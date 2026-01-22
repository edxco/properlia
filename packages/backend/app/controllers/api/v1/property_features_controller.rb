module Api
  module V1
    class PropertyFeaturesController < ApplicationController
      skip_before_action :authenticate_user!, only: [:index]
      before_action :set_property_feature, only: [:destroy]

      # GET /api/v1/property_features
      def index
        @property_features = PropertyFeature.order(name: :asc)

        render json: {
          data: @property_features.map { |pf| property_feature_json(pf) }
        }
      end

      # POST /api/v1/property_features
      def create
        property_feature = PropertyFeature.new(property_feature_params)

        if property_feature.save
          render json: property_feature_json(property_feature), status: :created
        else
          render json: { errors: property_feature.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/property_features/:id
      def destroy
        if @property_feature.properties.exists?
          render json: {
            error: 'Cannot delete property feature because it is assigned to one or more properties',
            properties_count: @property_feature.properties.count
          }, status: :unprocessable_entity
        elsif @property_feature.destroy
          render json: { message: 'Property feature deleted successfully' }, status: :ok
        else
          render json: { errors: @property_feature.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_property_feature
        @property_feature = PropertyFeature.find(params[:id])
      end

      def property_feature_params
        params.require(:property_feature).permit(:name, :es_name, :slug)
      end

      def property_feature_json(property_feature)
        {
          id: property_feature.id,
          name: property_feature.name,
          es_name: property_feature.es_name,
          slug: property_feature.slug,
          created_at: property_feature.created_at,
          updated_at: property_feature.updated_at
        }
      end
    end
  end
end
