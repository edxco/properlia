# app/controllers/api/v1/properties_controller.rb
module Api
  module V1
    class PropertiesController < ApplicationController
      before_action :authenticate_user!, only: [:create, :update, :delete_attachment]
      before_action :set_property, only: %i[show update delete_attachment]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/properties
      def index
        properties = Property.all

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
        if params[:property_type_id].present?
          properties = properties.where(property_type_id: params[:property_type_id])
        end

        @pagy, @properties = pagy(properties.order(created_at: :desc))

        render json: {
          data: @properties.map { |property| property_json(property) },
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
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

        # Update other attributes
        if @property.update(property_params.except(:images, :videos))
          # Append new media if provided (doesn't remove existing ones)
          @property.images.attach(new_images) if new_images.present?
          @property.videos.attach(new_videos) if new_videos.present?

          render json: property_json(@property), status: :ok
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

      private

      def set_property
        @property = Property.find(params[:id])
      end

      def property_params
        permitted_columns = Property.column_names.map(&:to_sym) - %i[id created_at updated_at images]
        params.require(:property).permit(*permitted_columns, images: [], videos: [])
      end

      def property_json(property)
        # include signed URLs for immediate consumption by your frontend
        property.attributes.except('created_at', 'updated_at').merge(
          'property_type' => property.property_type ? {
            id: property.property_type.id,
            name: property.property_type.name,
            es_name: property.property_type.es_name
          } : nil,
          'status' => property.status ? {
            id: property.status.id,
            name: property.status.name,
            es_name: property.status.es_name,
          } : nil,
          'listing_type' => property.listing_type ? {
            id: property.listing_type.id,
            name: property.listing_type.name,
            es_name: property.listing_type.es_name
          } : nil,
          'images' => property.images.attached? ? property.images.map { |i| { id: i.id, url: url_for(i), filename: i.filename.to_s, content_type: i.content_type } } : [],
          'videos' => property.videos.attached? ? property.videos.map { |v| { id: v.id, url: url_for(v), filename: v.filename.to_s, content_type: v.content_type } } : []
        )
      end
    end
  end
end
