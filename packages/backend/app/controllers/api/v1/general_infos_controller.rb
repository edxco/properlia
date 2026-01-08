# app/controllers/api/v1/general_infos_controller.rb
module Api
  module V1
    class GeneralInfosController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/general_info
      def show
        general_info = GeneralInfo.instance

        if general_info
          render json: {
            phone: general_info.phone,
            whatsapp: general_info.whatsapp,
            email_to: general_info.email_to
          }
        else
          render json: { error: 'General info not found' }, status: :not_found
        end
      end

      # PUT /api/v1/general_info
      def update
        general_info = GeneralInfo.instance

        if general_info.update(general_info_params)
          render json: {
            phone: general_info.phone,
            whatsapp: general_info.whatsapp,
            email_to: general_info.email_to
          }
        else
          render json: { errors: general_info.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def general_info_params
        params.require(:general_info).permit(:phone, :whatsapp, :email_to)
      end
    end
  end
end
