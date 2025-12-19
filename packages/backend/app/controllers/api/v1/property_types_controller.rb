# app/controllers/api/v1/property_types_controller.rb
module Api
  module V1
    class PropertyTypesController < ApplicationController
      skip_before_action :authenticate_user!, only: [:index, :show]
      before_action :set_property_type, only: %i[show update destroy]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/property_types
      def index
        @pagy, @property_types = pagy(PropertyType.all.order(created_at: :asc))

        render json: {
          data: @property_types,
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
          }
        }
      end

      # GET /api/v1/property_types/:id
      def show
        render json: @property_type
      end

      # POST /api/v1/property_types
      def create
        property_type = PropertyType.new(property_type_params)

        if property_type.save
          render json: property_type, status: :created
        else
          render json: { errors: property_type.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/property_types/:id
      def update
        if @property_type.update(property_type_params)
          render json: @property_type, status: :ok
        else
          render json: { errors: @property_type.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/property_types/:id
      def destroy
        if @property_type.properties.exists?
          render json: {
            error: 'Cannot delete property type because it is assigned to one or more properties',
            properties_count: @property_type.properties.count
          }, status: :unprocessable_entity
        elsif @property_type.destroy
          render json: { message: 'Property type deleted successfully' }, status: :ok
        else
          render json: { errors: @property_type.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_property_type
        @property_type = PropertyType.find(params[:id])
      end

      def property_type_params
        params.require(:property_type).permit(:name, :es_name)
      end
    end
  end
end
