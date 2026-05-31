# app/controllers/api/v1/properties_controller.rb
module Api
  module V1
    class PropertiesController < ApplicationController
      skip_before_action :authenticate_user!, only: %i[index show]
      skip_before_action :reject_disabled_user!, only: %i[index show]
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

        # Location filters (case-insensitive partial match)
        properties = properties.where('LOWER(city) LIKE ?', "%#{params[:city].downcase}%") if params[:city].present?

        properties = properties.where('LOWER(state) LIKE ?', "%#{params[:state].downcase}%") if params[:state].present?

        if params[:neighborhood].present?
          properties = properties.where('LOWER(neighborhood) LIKE ?', "%#{params[:neighborhood].downcase}%")
        end

        # Price range filters
        properties = properties.where('price >= ?', params[:price_min].to_f) if params[:price_min].present?

        properties = properties.where('price <= ?', params[:price_max].to_f) if params[:price_max].present?

        # Room and bathroom filters (minimum values)
        properties = properties.where('rooms >= ?', params[:rooms_min].to_i) if params[:rooms_min].present?

        properties = properties.where('bathrooms >= ?', params[:bathrooms_min].to_i) if params[:bathrooms_min].present?

        # Text search on title, description, address, city, state, and neighborhood
        if params[:search].present?
          search_term = "%#{params[:search].downcase}%"
          properties = properties.where(
            'LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(address) LIKE ? OR LOWER(city) LIKE ? OR LOWER(state) LIKE ? OR LOWER(neighborhood) LIKE ?',
            search_term, search_term, search_term, search_term, search_term, search_term
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
          ProcessPropertyImagesJob.perform_later(property.id) if params.dig(:property, :images).present?

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
            ProcessPropertyImagesJob.perform_later(@property.id)
          end
          @property.videos.attach(new_videos) if new_videos.present?

          render json: property_json(@property), status: :ok
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
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
