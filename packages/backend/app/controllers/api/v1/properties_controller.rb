# app/controllers/api/v1/properties_controller.rb
module Api
  module V1
    class PropertiesController < ApplicationController
      skip_before_action :authenticate_user!, only: %i[index show intake]
      skip_before_action :reject_disabled_user!, only: %i[index show intake]
      before_action :authenticate_intake_token!, only: %i[intake]
      before_action :set_property, only: %i[show update delete_attachment destroy reorder_images]
      before_action(only: %i[destroy]) { authorize_any!(:admin) }
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/properties
      def index
        properties = Property.all

        # Exclude suspended properties by default (unless include_suspended=true)
        # Suspended status ID: 7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64
        # unless ActiveModel::Type::Boolean.new.cast(params[:include_suspended])
        #   suspended_status_id = '7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64'
        #   properties = properties.where.not(status_id: suspended_status_id)
        # end

        # Filter by featured
        if params[:featured].present?
          properties = properties.where(featured: ActiveModel::Type::Boolean.new.cast(params[:featured]))
        end

        # Filter by status (supports id or name)
        if params[:status_id].present?
          properties = properties.where(status_id: params[:status_id])
        elsif params[:status].present?
          properties = properties.joins(:status).where(statuses: { name: params[:status] })
        end

        # Filter by property_type_id
        properties = properties.where(property_type_id: params[:property_type_id]) if params[:property_type_id].present?

        # Filter by listing_type_id (sale, rent, pre-sale)
        properties = properties.where(listing_type_id: params[:listing_type_id]) if params[:listing_type_id].present?

        # Location filters (exact match on the normalized state/city lookup tables)
        properties = properties.where(state_id: params[:state_id]) if params[:state_id].present?

        properties = properties.where(city_id: params[:city_id]) if params[:city_id].present?

        if params[:neighborhood].present?
          properties = properties.where('LOWER(neighborhood) LIKE ?', "%#{params[:neighborhood].downcase}%")
        end

        # Price range filters
        properties = properties.where('price >= ?', params[:price_min].to_f) if params[:price_min].present?

        properties = properties.where('price <= ?', params[:price_max].to_f) if params[:price_max].present?

        # Room and bathroom filters (minimum values)
        properties = properties.where('rooms >= ?', params[:rooms_min].to_i) if params[:rooms_min].present?

        properties = properties.where('bathrooms >= ?', params[:bathrooms_min].to_i) if params[:bathrooms_min].present?

        # Filter by category slug (residential, commercial, industrial)
        # Exclude land property type — land belongs to all categories in the DB but
        # should only appear when explicitly filtered via property_type_name=land
        if params[:category_slug].present?
          properties = properties.by_category_slug(params[:category_slug])
                                 .joins(:property_type)
                                 .where.not(property_types: { name: 'land' })
        end

        # Filter by property type name (used for e.g. "land" which has no category slug)
        if params[:property_type_name].present?
          properties = properties.joins(:property_type)
                                 .where('LOWER(property_types.name) = ?', params[:property_type_name].downcase)
        end

        # Text search on title, description, address, state, city, and neighborhood
        if params[:search].present?
          search_term = "%#{params[:search].downcase}%"
          properties = properties.left_joins(:state, :city).where(
            'LOWER(properties.title) LIKE :q OR LOWER(properties.description) LIKE :q OR ' \
            'LOWER(properties.address) LIKE :q OR LOWER(properties.neighborhood) LIKE :q OR ' \
            'LOWER(states.name) LIKE :q OR LOWER(states.es_name) LIKE :q OR ' \
            'LOWER(cities.name) LIKE :q OR LOWER(cities.es_name) LIKE :q',
            q: search_term
          )
        end

        # Apply custom items limit if provided
        pagy_options = {}
        pagy_options[:limit] = params[:items].to_i if params[:items].present? && params[:items].to_i.positive?

        @pagy, @properties = pagy(properties.order(created_at: :desc), **pagy_options)

        render json: {
          data: @properties.map { |property| property_json(property) },
          metadata: {
            count: @pagy.count,
            page: @pagy.page,
            pages: @pagy.pages,
            next: @pagy.next,
            prev: @pagy.prev
          }
        }
      end

      def show
        render json: property_json(@property)
      end

      # POST /api/v1/properties
      def create
        Rails.logger.debug "Received params: #{params.inspect}"
        Rails.logger.debug "Property params: #{params[:property].inspect}"

        property = Property.new(property_params)
        if property.save
          ProcessPropertyImagesJob.perform_later(property.id, property.images.pluck(:id)) if params.dig(:property, :images).present?

          # Send confirmation email asynchronously
          begin
            EmailService.send_property_confirmation(property: property)
            Rails.logger.info "Property confirmation email sent for property #{property.id}"
          rescue StandardError => e
            # Log error but don't fail the request
            Rails.logger.error "Failed to send property confirmation email: #{e.message}"
          end

          render json: property_json(property),
                 status: :created
        else
          render json: { errors: property.errors.full_messages }, status: :unprocessable_entity
        end
      rescue ActionController::ParameterMissing => e
        Rails.logger.error "Parameter missing: #{e.message}"
        Rails.logger.error "All params: #{params.inspect}"
        render json: { error: e.message, received_params: params.keys }, status: :bad_request
      end

      # PUT /api/v1/properties/:id
      # (Rails also supports PATCH; route is shared)
      def update
        # Extract media from params to handle separately
        new_images = params.dig(:property, :images)
        new_videos = params.dig(:property, :videos)

        # Normalize image_order IDs to strings to prevent integer/string mismatch
        update_params = property_params.except(:images, :videos)
        update_params[:image_order] = update_params[:image_order].map(&:to_s) if update_params[:image_order].present?

        # Update other attributes
        if @property.update(update_params)
          # Append new media if provided (doesn't remove existing ones)
          if new_images.present?
            @property.images.attach(new_images)
            # Append newly attached IDs to image_order so they sort after existing images
            existing_order = @property.image_order.map(&:to_s)
            new_ids = @property.images.pluck(:id).map(&:to_s) - existing_order
            @property.update_column(:image_order, existing_order + new_ids) if new_ids.any?
            ProcessPropertyImagesJob.perform_later(@property.id, new_ids) if new_ids.any?
          end
          @property.videos.attach(new_videos) if new_videos.present?

          render json: property_json(@property), status: :ok
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/properties/intake
      #
      # Machine-to-machine endpoint for the Google Apps Script property-intake
      # pipeline. Not a public/website-facing endpoint — auth is a single shared
      # secret (PROPERTY_INTAKE_TOKEN), not a user session/JWT, since the caller
      # is a script, not a signed-in Properlia user.
      #
      # Expected body (see Code.gs `sendToWebsite_`):
      #   title, transaction_type ("sell"|"rent"), specific_property_type
      #   (one of PropertyType#name), presale (bool, only relevant when
      #   transaction_type == "sell"), property_categories (array of
      #   PropertyCategory#slug — e.g. ["residential"]), description_es,
      #   description_en, price, state, location: { colonia, municipio },
      #   specs: { land_m2, construction_m2, bedrooms, bathrooms, half_bathrooms,
      #   parking_spaces, condition — "condition" isn't stored yet, see note below },
      #   media: { photos: [urls], video: [urls] }
      #
      # Note: the properties table has no "levels" (floor count) column and no
      # place for free-text "condition" outside the description itself — both
      # get folded into description_es/description_en by the AI step rather
      # than stored as structured fields. Add columns for them later if you
      # want to filter/sort listings by either.
      def intake
        property_type = PropertyType.find_by('LOWER(name) = ?', intake_params[:specific_property_type].to_s.downcase)
        listing_type = ListingType.find_by(name: intake_listing_type_name)
        status = Status.find_by(name: 'active')
        categories = PropertyCategory.where(slug: Array(intake_params[:property_categories]).map { |s| s.to_s.downcase })

        state, city = LocationResolver.resolve(
          state_name: intake_params[:state].presence || 'Puebla',
          city_name: intake_params.dig(:location, :municipio)
        )

        errors = []
        errors << "Unknown specific_property_type: #{intake_params[:specific_property_type]}" unless property_type
        errors << "Unknown transaction_type/presale combination: #{intake_params[:transaction_type]}" unless listing_type
        errors << 'No "active" status found — check Status seeds' unless status
        errors << "Unknown state: #{intake_params[:state]} (not one of the 32 seeded Mexican states)" unless state
        return render json: { errors: errors }, status: :unprocessable_entity if errors.any?

        property = Property.new(
          title: intake_params[:title],
          address: intake_params[:title],
          description: intake_params[:description_es],
          description_en: intake_params[:description_en],
          land_area: intake_params.dig(:specs, :land_m2),
          built_area: intake_params.dig(:specs, :construction_m2),
          rooms: intake_params.dig(:specs, :bedrooms) || 0,
          bathrooms: intake_params.dig(:specs, :bathrooms) || 0,
          half_bathrooms: intake_params.dig(:specs, :half_bathrooms) || 0,
          parking_spaces: intake_params.dig(:specs, :parking_spaces) || 0,
          price: intake_params[:price],
          state: state,
          city: city,
          neighborhood: intake_params.dig(:location, :colonia),
          property_type: property_type,
          listing_type: listing_type,
          status: status,
          exclusive_listing: true
        )
        property.property_categories = categories if categories.any?

        if property.save
          AttachRemoteMediaJob.perform_later(
            property.id,
            Array(intake_params.dig(:media, :photos)),
            Array(intake_params.dig(:media, :video))
          )
          render json: { listing_url: listing_url_for(property), id: property.id }, status: :created
        else
          render json: { errors: property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/properties/generate_content
      #
      # Drafts a title and description (each in Spanish and English) from the
      # form's current (not-yet-saved) field values, so it works identically
      # for create and edit.
      def generate_content
        property_type = PropertyType.find_by(id: generate_content_params[:property_type_id])
        listing_type = ListingType.find_by(id: generate_content_params[:listing_type_id])
        state = State.find_by(id: generate_content_params[:state_id])
        city = City.find_by(id: generate_content_params[:city_id])

        unless property_type && listing_type
          return render json: { error: 'property_type_id and listing_type_id are required' },
                         status: :unprocessable_entity
        end

        categories = PropertyCategory.where(id: Array(generate_content_params[:property_category_ids]))

        # Preserve the advisor's selection order — PropertyFeature.where(id:...)
        # does not guarantee it, and the first feature is the mandatory
        # "featured characteristic" the title generator relies on.
        feature_ids = Array(generate_content_params[:property_feature_ids])
        features = PropertyFeature.where(id: feature_ids).index_by(&:id).values_at(*feature_ids).compact

        result = Ai::PropertyContentGenerator.call(
          property_type: property_type,
          listing_type: listing_type,
          categories: categories,
          features: features,
          address: generate_content_params[:address],
          neighborhood: generate_content_params[:neighborhood],
          city: city&.es_name,
          state: state&.es_name,
          price: generate_content_params[:price],
          land_area: generate_content_params[:land_area],
          built_area: generate_content_params[:built_area],
          rooms: generate_content_params[:rooms],
          bathrooms: generate_content_params[:bathrooms],
          half_bathrooms: generate_content_params[:half_bathrooms],
          parking_spaces: generate_content_params[:parking_spaces]
        )

        render json: result, status: :ok
      rescue Ai::PropertyContentGenerator::GenerationError => e
        render json: { error: e.message }, status: :bad_gateway
      end

      # DELETE /api/v1/properties/:id
      def destroy
        if @property.destroy
          render json: { message: 'Property deleted successfully' }, status: :ok
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/properties/:id/attachments/:attachment_id
      def delete_attachment
        attachment = @property.images.find_by(id: params[:attachment_id]) ||
                     @property.videos.find_by(id: params[:attachment_id])

        if attachment
          attachment.purge
          render json: { message: 'Attachment deleted successfully' }, status: :ok
        else
          render json: { error: 'Attachment not found' }, status: :not_found
        end
      end

      # PUT /api/v1/properties/:id/reorder_images
      def reorder_images
        image_ids = params[:image_ids]

        unless image_ids.is_a?(Array)
          return render json: { error: 'image_ids must be an array' }, status: :bad_request
        end

        # Normalize to strings to avoid integer/string type mismatch in JSONB
        image_ids = image_ids.map(&:to_s)

        # Validate that all IDs belong to this property's images
        existing_ids = @property.images.pluck(:id).map(&:to_s)
        invalid_ids = image_ids - existing_ids

        if invalid_ids.any?
          return render json: { error: "Invalid image IDs: #{invalid_ids.join(', ')}" }, status: :bad_request
        end

        if @property.update(image_order: image_ids)
          render json: property_json(@property), status: :ok
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_property
        @property = Property.find(params[:id])
      end

      def property_params
        permitted_columns = Property.column_names.map(&:to_sym) - %i[id created_at updated_at images image_order]
        params.require(:property).permit(*permitted_columns, images: [], videos: [], property_category_ids: [],
                                                             property_feature_ids: [], image_order: [])
      end

      def generate_content_params
        params.permit(:property_type_id, :listing_type_id, :address, :neighborhood, :city_id, :state_id,
                      :price, :land_area, :built_area, :rooms, :bathrooms, :half_bathrooms,
                      :parking_spaces, property_category_ids: [], property_feature_ids: [])
      end

      # ---- intake-only helpers ----

      def authenticate_intake_token!
        expected = ENV['PROPERTY_INTAKE_TOKEN']
        provided = request.headers['Authorization'].to_s.sub(/\ABearer /, '')

        if expected.blank?
          Rails.logger.error 'PROPERTY_INTAKE_TOKEN is not set — refusing all /intake requests'
          return render json: { error: 'Intake endpoint not configured' }, status: :service_unavailable
        end

        render json: { error: 'Unauthorized' }, status: :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected, provided)
      end

      def intake_params
        params.permit(
          :title, :description_es, :description_en, :price, :state,
          :transaction_type, :specific_property_type, :presale,
          specs: %i[land_m2 construction_m2 bedrooms bathrooms half_bathrooms parking_spaces condition],
          location: %i[colonia municipio],
          media: { photos: [], video: [] },
          property_categories: []
        )
      end

      # transaction_type "rent" -> ListingType "rent"
      # transaction_type "sell" + presale=true -> "pre-sale", else -> "sale"
      def intake_listing_type_name
        return 'rent' if intake_params[:transaction_type].to_s.downcase == 'rent'

        ActiveModel::Type::Boolean.new.cast(intake_params[:presale]) ? 'pre-sale' : 'sale'
      end

      def listing_url_for(property)
        base = ENV.fetch('FRONTEND_URL', 'https://properlia.com')
        state = intake_slugify(property.state&.name)
        city = intake_slugify(property.city&.name)
        slug = intake_slugify(property.title)
        "#{base}/es/properties/#{state}/#{city}/#{property.id}/#{slug}"
      end

      # Mirrors packages/shared/src/lib/slugify.ts so URLs match what the
      # frontend itself generates for a given title/state/city.
      def intake_slugify(text)
        return 'na' if text.blank?

        text.to_s.unicode_normalize(:nfd).gsub(/[\u0300-\u036f]/, '').downcase
            .gsub(/[^a-z0-9]+/, '-').gsub(/\A-+|-+\z/, '')
      end

      def property_json(property)
        # include signed URLs for immediate consumption by your frontend
        base_attributes = property.attributes.except('created_at', 'updated_at')

        # Hide address if exclusive_listing is false
        base_attributes = base_attributes.except('address') unless property.exclusive_listing

        base_attributes.merge(
          'property_type' => if property.property_type
                               {
                                 id: property.property_type.id,
                                 name: property.property_type.name,
                                 es_name: property.property_type.es_name
                               }
                             end,
          'status' => if property.status
                        {
                          id: property.status.id,
                          name: property.status.name,
                          es_name: property.status.es_name
                        }
                      end,
          'listing_type' => if property.listing_type
                              {
                                id: property.listing_type.id,
                                name: property.listing_type.name,
                                es_name: property.listing_type.es_name
                              }
                            end,
          'state' => if property.state
                       {
                         id: property.state.id,
                         name: property.state.name,
                         es_name: property.state.es_name
                       }
                     end,
          'city' => if property.city
                      {
                        id: property.city.id,
                        name: property.city.name,
                        es_name: property.city.es_name
                      }
                    end,
          'property_categories' => property.property_categories.map do |cat|
            { id: cat.id, name: cat.name, es_name: cat.es_name, slug: cat.slug }
          end,
          'property_features' => property.property_features.map do |feature|
            { id: feature.id, name: feature.name, es_name: feature.es_name, slug: feature.slug }
          end,
          'images' => if property.images.attached?
                        images_data = property.images.map do |i|
                          { id: i.id, url: url_for(i), filename: i.filename.to_s,
                            content_type: i.content_type }
                        end
                        # Sort by image_order if present, otherwise keep original order
                        if property.image_order.present?
                          order_map = property.image_order.map(&:to_s).each_with_index.to_h
                          images_data.sort_by { |img| order_map[img[:id].to_s] || Float::INFINITY }
                        else
                          images_data
                        end
                      else
                        []
                      end,
          'videos' => if property.videos.attached?
                        property.videos.map do |v|
                          { id: v.id, url: url_for(v), filename: v.filename.to_s,
                            content_type: v.content_type }
                        end
                      else
                        []
                      end
        )
      end
    end
  end
end
