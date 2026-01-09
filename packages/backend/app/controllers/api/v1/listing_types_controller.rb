# app/controllers/api/v1/listing_types_controller.rb
module Api
  module V1
    class ListingTypesController < ApplicationController
      skip_before_action :authenticate_user!, only: [:index, :show]
      before_action :set_listing_type, only: %i[show update destroy]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/listing_types
      def index
        @pagy, @listing_types = pagy(ListingType.all.order(created_at: :asc))

        render json: {
          data: @listing_types,
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
          }
        }
      end

      # GET /api/v1/listing_types/:id
      def show
        render json: @listing_type
      end

      # POST /api/v1/listing_types
      def create
        listing_type = ListingType.new(listing_type_params)

        if listing_type.save
          render json: listing_type, status: :created
        else
          render json: { errors: listing_type.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/listing_types/:id
      def update
        if @listing_type.update(listing_type_params)
          render json: @listing_type, status: :ok
        else
          render json: { errors: @listing_type.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/listing_types/:id
      def destroy
        if @listing_type.properties.exists?
          render json: {
            error: 'Cannot delete listing type because it is assigned to one or more properties',
            properties_count: @listing_type.properties.count
          }, status: :unprocessable_entity
        elsif @listing_type.destroy
          render json: { message: 'Listing type deleted successfully' }, status: :ok
        else
          render json: { errors: @listing_type.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_listing_type
        @listing_type = ListingType.find(params[:id])
      end

      def listing_type_params
        params.require(:listing_type).permit(:name, :es_name)
      end
    end
  end
end
