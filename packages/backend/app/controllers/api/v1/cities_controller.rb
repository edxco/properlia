# app/controllers/api/v1/cities_controller.rb
module Api
  module V1
    class CitiesController < ApplicationController
      skip_before_action :authenticate_user!, only: %i[index show]
      skip_before_action :reject_disabled_user!, only: %i[index show]
      before_action :set_city, only: %i[show update destroy]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/cities
      def index
        cities = City.all.order(:es_name)
        cities = cities.where(state_id: params[:state_id]) if params[:state_id].present?

        pagy_options = {}
        pagy_options[:limit] = params[:items].to_i if params[:items].present? && params[:items].to_i.positive?

        @pagy, @cities = pagy(cities, **pagy_options)

        render json: {
          data: @cities,
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
          }
        }
      end

      # GET /api/v1/cities/:id
      def show
        render json: @city
      end

      # POST /api/v1/cities
      def create
        city = City.new(city_params)

        if city.save
          render json: city, status: :created
        else
          render json: { errors: city.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/cities/:id
      def update
        if @city.update(city_params)
          render json: @city, status: :ok
        else
          render json: { errors: @city.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/cities/:id
      def destroy
        if @city.properties.exists? || @city.leads.exists?
          render json: {
            error: 'Cannot delete city because it is assigned to one or more properties or leads'
          }, status: :unprocessable_entity
        elsif @city.destroy
          render json: { message: 'City deleted successfully' }, status: :ok
        else
          render json: { errors: @city.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_city
        @city = City.find(params[:id])
      end

      def city_params
        params.require(:city).permit(:name, :es_name, :state_id)
      end
    end
  end
end
