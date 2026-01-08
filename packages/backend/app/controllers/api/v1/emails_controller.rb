module Api
  module V1
    class EmailsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:send_contact_form, :send_property_inquiry]

      # POST /api/v1/emails/contact
      def send_contact_form
        validate_params!([:name, :email, :message])

        result = EmailService.send_contact_form(
          name: params[:name],
          email: params[:email],
          message: params[:message],
          subject: params[:subject]
        )

        if result[:success]
          render json: {
            message: "Contact form sent successfully",
            id: result[:data][:id]
          }, status: :ok
        else
          render json: {
            error: "Failed to send email",
            details: result[:error]
          }, status: :unprocessable_entity
        end
      rescue ArgumentError => e
        render json: { error: e.message }, status: :bad_request
      end

      # POST /api/v1/emails/property-inquiry
      def send_property_inquiry
        validate_params!([:property_id, :name, :email, :message])

        # Find property to get title
        property = Property.find_by(id: params[:property_id])

        unless property
          return render json: { error: "Property not found" }, status: :not_found
        end

        result = EmailService.send_property_inquiry(
          property_id: property.id,
          property_title: property.title,
          name: params[:name],
          email: params[:email],
          phone: params[:phone],
          message: params[:message]
        )

        if result[:success]
          render json: {
            message: "Property inquiry sent successfully",
            id: result[:data][:id]
          }, status: :ok
        else
          render json: {
            error: "Failed to send inquiry",
            details: result[:error]
          }, status: :unprocessable_entity
        end
      rescue ArgumentError => e
        render json: { error: e.message }, status: :bad_request
      end

      # POST /api/v1/emails/welcome
      def send_welcome
        unless current_user
          return render json: { error: "Authentication required" }, status: :unauthorized
        end

        result = EmailService.send_welcome_email(
          user_email: current_user.email,
          user_name: current_user.name || current_user.email
        )

        if result[:success]
          render json: {
            message: "Welcome email sent successfully",
            id: result[:data][:id]
          }, status: :ok
        else
          render json: {
            error: "Failed to send welcome email",
            details: result[:error]
          }, status: :unprocessable_entity
        end
      end

      private

      def validate_params!(required_fields)
        missing_fields = required_fields.select { |field| params[field].blank? }

        if missing_fields.any?
          raise ArgumentError, "Missing required fields: #{missing_fields.join(', ')}"
        end

        # Validate email format
        if params[:email].present? && !valid_email?(params[:email])
          raise ArgumentError, "Invalid email format"
        end
      end

      def valid_email?(email)
        email.match?(/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i)
      end
    end
  end
end
