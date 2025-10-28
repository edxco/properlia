# app/controllers/api/v1/properties_controller.rb
module Api
  module V1
    class PropertiesController < ApplicationController
      before_action :authenticate_user!, only: [:create, :update]
      before_action :set_property, only: %i[show update]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/properties
      def index
        @pagy, @properties = pagy(Property.all.order(created_at: :desc))

        render json: {
          data: @properties,
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            items: (@pagy.respond_to?(:items) ? @pagy.items : @pagy.vars[:items]),
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
          }
        }
      end

      def show
        render json: @property.as_json
      end

      # POST /api/v1/properties
      def create
        property = Property.new(property_params)
        if property.save
          render json: property.as_json,
                 status: :created
        else
          render json: { errors: property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/properties/:id
      # (Rails also supports PATCH; route is shared)
      def update
        if @property.update(property_params)
          render json: @property.as_json,
                 status: :ok
        else
          render json: { errors: @property.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_property
        @property = Property.find(params[:id])
      end

      def property_params
        permitted_columns = Property.column_names.map(&:to_sym) - %i[id created_at updated_at images]
        params.require(:property).permit(*permitted_columns, images: [])
      end
    end
  end
end
