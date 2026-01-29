# frozen_string_literal: true

module Api
  module V1
    class PdfsController < ApplicationController
      # No authentication required for downloading PDFs - they're public brochures
      skip_before_action :authenticate_user!
      before_action :set_property

      # GET /api/v1/properties/:property_id/pdf
      # Query params:
      #   - locale: 'en' or 'es' (default: 'es')
      #   - download: 'true' or 'false' (default: 'true')
      def show
        locale = params[:locale]&.to_sym || :es
        locale = :es unless %i[en es].include?(locale)

        # Generate PDF
        pdf_service = Pdf::GeneratorService.new(
          @property,
          locale: locale,
          base_url: frontend_base_url
        )

        pdf_data = pdf_service.generate

        # Send as download or inline
        disposition = params[:download] == 'false' ? 'inline' : 'attachment'
        filename = sanitize_filename("#{@property.title}_#{@property.id}.pdf")

        send_data pdf_data,
                  filename: filename,
                  type: 'application/pdf',
                  disposition: disposition
      rescue StandardError => e
        Rails.logger.error "PDF generation failed: #{e.message}\n#{e.backtrace.join("\n")}"
        render json: { error: 'Failed to generate PDF' }, status: :internal_server_error
      end

      # POST /api/v1/properties/:property_id/pdf/email
      # Body params:
      #   - email: recipient email address (required)
      #   - locale: 'en' or 'es' (default: 'es')
      #   - message: optional personal message
      def email
        recipient_email = params[:email]
        locale = params[:locale]&.to_sym || :es
        locale = :es unless %i[en es].include?(locale)

        # Validate email
        unless recipient_email.present? && valid_email?(recipient_email)
          return render json: { error: 'Invalid email address' }, status: :unprocessable_entity
        end

        # Generate PDF
        pdf_service = Pdf::GeneratorService.new(
          @property,
          locale: locale,
          base_url: frontend_base_url
        )

        pdf_data = pdf_service.generate

        # Send email with PDF attachment
        PropertyMailer.send_pdf(
          property: @property,
          recipient_email: recipient_email,
          pdf_data: pdf_data,
          locale: locale,
          message: params[:message]
        ).deliver_later

        render json: { message: 'PDF sent successfully' }, status: :ok
      rescue StandardError => e
        Rails.logger.error "PDF email failed: #{e.message}\n#{e.backtrace.join("\n")}"
        render json: { error: 'Failed to send PDF via email' }, status: :internal_server_error
      end

      private

      def set_property
        @property = Property.includes(:property_type, :status, :listing_type)
                            .with_attached_images
                            .with_attached_videos
                            .find_by(id: params[:property_id])

        unless @property
          render json: { error: 'Property not found' }, status: :not_found
        end
      end

      def frontend_base_url
        ENV['FRONTEND_URL'] || 'http://localhost:3001'
      end

      def valid_email?(email)
        email.match?(URI::MailTo::EMAIL_REGEXP)
      end

      def sanitize_filename(filename)
        # Remove special characters and limit length
        filename.gsub(/[^0-9A-Za-z.\-_]/, '_').slice(0, 255)
      end
    end
  end
end
