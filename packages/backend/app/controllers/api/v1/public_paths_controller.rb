# GET /api/v1/public_paths
# Compact index of every public URL the frontend can build: property slugs/codes and
# location slugs (including previous ones). The frontend proxy uses it to answer 301s
# for legacy and outdated URLs, and the sitemap/geo pages use it for counts.
module Api
  module V1
    class PublicPathsController < ApplicationController
      skip_before_action :authenticate_user!
      skip_before_action :reject_disabled_user!

      def index
        properties = Property.publicly_visible
                             .where.not(state_id: nil).where.not(city_id: nil)
                             .includes(:listing_type)
                             .order(created_at: :desc)

        render json: {
          properties: properties.map { |property| property_path_json(property) },
          states: State.order(:es_name).map { |state| location_json(state) },
          cities: City.order(:es_name).map { |city| location_json(city).merge(state_id: city.state_id) }
        }
      end

      private

      def property_path_json(property)
        {
          id: property.id,
          code: property.code,
          slug_es: PropertyPublicUrl.slug(property, :es),
          slug_en: PropertyPublicUrl.slug(property, :en),
          state_id: property.state_id,
          city_id: property.city_id,
          listing_type: property.listing_type&.name,
          updated_at: property.updated_at
        }
      end

      def location_json(location)
        {
          id: location.id,
          name: location.name,
          es_name: location.es_name,
          slug: location.slug,
          slug_en: location.slug_en,
          previous_slugs: location.previous_slugs
        }
      end
    end
  end
end
