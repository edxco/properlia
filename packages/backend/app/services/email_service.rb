# EmailService handles all email sending through Resend
class EmailService
  class << self
    # Send contact form email
    # @param name [String] Name of the person contacting
    # @param email [String] Email address of the sender
    # @param message [String] Message content
    # @param subject [String] Email subject (optional)
    # @return [Hash] Resend API response or error
    def send_contact_form(name:, email:, message:, subject: 'New Contact Form Submission')
      validate_resend_configured!
      general_info = GeneralInfo.instance

      params = {
        from: ENV.fetch('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        to: general_info.email_to,
        subject: subject,
        html: contact_form_html(name: name, email: email, message: message),
        reply_to: email
      }

      send_email(params)
    end

    # Send property inquiry email
    # @param property_id [Integer] ID of the property
    # @param property_title [String] Title of the property
    # @param name [String] Name of the person inquiring
    # @param email [String] Email address of the sender
    # @param phone [String] Phone number (optional)
    # @param message [String] Inquiry message
    # @return [Hash] Resend API response or error
    def send_property_inquiry(property_id:, property_title:, name:, email:, message:, phone: nil)
      validate_resend_configured!
      general_info = GeneralInfo.instance

      params = {
        from: ENV.fetch('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        to: general_info.email_to,
        subject: "Property Inquiry: #{property_title}",
        html: property_inquiry_html(
          property_id: property_id,
          property_title: property_title,
          name: name,
          email: email,
          phone: phone,
          message: message
        ),
        reply_to: email
      }

      send_email(params)
    end

    # Send welcome email to new user
    # @param user_email [String] User's email address
    # @param user_name [String] User's name
    # @return [Hash] Resend API response or error
    def send_welcome_email(user_email:, user_name:)
      validate_resend_configured!

      params = {
        from: ENV.fetch('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        to: user_email,
        subject: 'Welcome to Properlia!',
        html: welcome_email_html(name: user_name)
      }

      send_email(params)
    end

    # Send property confirmation email after creation
    # @param property [Property] The property object
    # @return [Hash] Resend API response or error
    def send_property_confirmation(property:)
      validate_resend_configured!
      general_info = GeneralInfo.instance

      # Truncate title to 20 characters max
      truncated_title = property.title.length > 20 ? "#{property.title[0..19]}..." : property.title

      params = {
        from: ENV.fetch('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        to: general_info.email_to,
        subject: "Confirmación #{property.property_type.es_name} en #{property.listing_type.es_name}, #{property.address}, #{property.city}",
        html: property_confirmation_html(property: property)
      }

      send_email(params)
    end

    private

    def validate_resend_configured!
      return if ENV['RESEND_API_KEY'].present?

      raise StandardError, 'RESEND_API_KEY is not configured'
    end

    def send_email(params)
      response = Resend::Emails.send(params)
      Rails.logger.info "Email sent successfully: #{response}"
      { success: true, data: response }
    rescue Resend::Error => e
      Rails.logger.error "Resend API error: #{e.message}"
      { success: false, error: e.message }
    rescue StandardError => e
      Rails.logger.error "Failed to send email: #{e.message}"
      { success: false, error: e.message }
    end

    # HTML template for contact form email
    def contact_form_html(name:, email:, message:)
      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #374151; }
              .value { margin-top: 5px; }
              .message { background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">#{name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">#{email}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="message">#{message.gsub("\n", '<br>')}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # HTML template for property inquiry email
    def property_inquiry_html(property_id:, property_title:, name:, email:, phone:, message:)
      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #374151; }
              .value { margin-top: 5px; }
              .message { background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; }
              .property-info { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Property Inquiry</h1>
              </div>
              <div class="content">
                <div class="property-info">
                  <div class="label">Property:</div>
                  <div class="value">#{property_title}</div>
                  <div class="value" style="font-size: 12px; color: #6b7280;">Property ID: #{property_id}</div>
                </div>
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">#{name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">#{email}</div>
                </div>
                #{phone.present? ? "<div class=\"field\"><div class=\"label\">Phone:</div><div class=\"value\">#{phone}</div></div>" : ''}
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="message">#{message.gsub("\n", '<br>')}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # HTML template for welcome email
    def welcome_email_html(name:)
      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; }
              .content { background-color: #f9fafb; padding: 40px; }
              .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Properlia!</h1>
              </div>
              <div class="content">
                <p>Hi #{name},</p>
                <p>Thank you for joining Properlia! We're excited to help you find your perfect property.</p>
                <p>With Properlia, you can:</p>
                <ul>
                  <li>Browse thousands of properties</li>
                  <li>Save your favorite listings</li>
                  <li>Get instant updates on new properties</li>
                  <li>Connect directly with property owners</li>
                </ul>
                <p>Get started by exploring our latest properties today!</p>
                <p style="text-align: center;">
                  <a href="#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}" class="cta-button">
                    Explore Properties
                  </a>
                </p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Best regards,<br>The Properlia Team</p>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # HTML template for property confirmation email
    def property_confirmation_html(property:)
      # Format price
      formatted_price = "$#{number_with_delimiter(property.price, delimiter: ',')}"

      # Format date
      formatted_date = property.created_at.strftime('%d/%m/%Y %H:%M')

      # Build property details URL
      property_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}/properties/#{property.id}"

      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; }
              .section-title { color: #2563eb; font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
              .property-detail {
                background-color: white;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                border-left: 4px solid #2563eb;
              }
              .detail-label {
                color: #2563eb;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .detail-value {
                color: #374151;
                font-size: 14px;
              }
              .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: white !important;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                font-weight: bold;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nueva Propiedad Creada</h1>
              </div>
              <div class="content">
                <p>Se ha creado una nueva propiedad en el sistema:</p>

                <div class="section-title">Información Principal</div>

                <div class="property-detail">
                  <div class="detail-label">Título</div>
                  <div class="detail-value">#{property.title}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">UUID</div>
                  <div class="detail-value">#{property.id}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">Precio</div>
                  <div class="detail-value">#{formatted_price}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">Tipo de Propiedad</div>
                  <div class="detail-value">#{property.property_type&.es_name || property.property_type&.name || 'N/A'}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">Estado</div>
                  <div class="detail-value">#{property.status&.es_name || property.status&.name || 'N/A'}</div>
                </div>

                <div class="section-title">Ubicación</div>

                <div class="property-detail">
                  <div class="detail-label">Colonia</div>
                  <div class="detail-value">#{property.neighborhood || 'No especificado'}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">Ciudad</div>
                  <div class="detail-value">#{property.city || 'No especificado'}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">Estado</div>
                  <div class="detail-value">#{property.state || 'No especificado'}</div>
                </div>

                <div class="section-title">Información Adicional</div>

                <div class="property-detail">
                  <div class="detail-label">Fecha de Creación</div>
                  <div class="detail-value">#{formatted_date}</div>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="#{property_url}" class="cta-button">Ver Detalles de la Propiedad</a>
                </div>

                <div class="footer">
                  <p>Este es un correo automático de confirmación.</p>
                  <p>Properlia - Sistema de Gestión de Propiedades</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # Helper method to format numbers with delimiter
    def number_with_delimiter(number, delimiter: ',')
      number.to_s.reverse.gsub(/(\d{3})(?=\d)/, "\\1#{delimiter}").reverse
    end
  end
end
