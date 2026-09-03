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

    # Send consultation form email to admin
    # @param lead [Lead] The lead object from the form submission
    # @param form_type [String] Type of form: 'buyer' or 'seller'
    # @return [Hash] Resend API response or error
    def send_consultation_admin_email(lead:, form_type:)
      validate_resend_configured!
      general_info = GeneralInfo.instance

      subject = form_type == 'buyer' ? 'Nueva Consulta de Comprador' : 'Nueva Consulta de Vendedor'
      html_content = form_type == 'buyer' ? buyer_consultation_admin_html(lead: lead) : seller_consultation_admin_html(lead: lead)

      params = {
        from: ENV.fetch('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        to: general_info.email_to,
        subject: subject,
        html: html_content,
        reply_to: lead.email
      }

      send_email(params)
    end

    # Send consultation confirmation email to user
    # @param lead [Lead] The lead object from the form submission
    # @param form_type [String] Type of form: 'buyer' or 'seller'
    # @return [Hash] Resend API response or error
    def send_consultation_confirmation_email(lead:, form_type:)
      validate_resend_configured!
      return { success: false, error: 'No email provided' } unless lead.email.present?

      general_info = GeneralInfo.instance
      subject = form_type == 'buyer' ? 'Gracias por tu interés - Properlia' : 'Gracias por contactarnos - Properlia'
      html_content = form_type == 'buyer' ? buyer_consultation_confirmation_html(lead: lead, general_info: general_info) : seller_consultation_confirmation_html(lead: lead, general_info: general_info)

      params = {
        from: ENV.fetch('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
        to: lead.email,
        subject: subject,
        html: html_content
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
        subject: "Confirmación #{property.property_type.es_name} en #{property.listing_type.es_name}, #{property.address}, #{property.city&.es_name}",
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
              .header { background-color: #214c9b; color: white; padding: 20px; text-align: center; }
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
              .header { background-color: #214c9b; color: white; padding: 20px; text-align: center; }
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
              .header { background-color: #214c9b; color: white; padding: 30px; text-align: center; }
              .content { background-color: #f9fafb; padding: 40px; }
              .cta-button {
                display: inline-block;
                background-color: #214c9b;
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
              .header { background-color: #214c9b; color: white; padding: 30px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; }
              .section-title { color: #214c9b; font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
              .property-detail {
                background-color: white;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                border-left: 4px solid #214c9b;
              }
              .detail-label {
                color: #214c9b;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .detail-value {
                color: #374151;
                font-size: 14px;
              }
              .cta-button {
                display: inline-block;
                background-color: #214c9b;
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
                  <div class="detail-value">#{property.city&.es_name || 'No especificado'}</div>
                </div>

                <div class="property-detail">
                  <div class="detail-label">Estado</div>
                  <div class="detail-value">#{property.state&.es_name || 'No especificado'}</div>
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

    # HTML template for buyer consultation admin email
    def buyer_consultation_admin_html(lead:)
      budget_display = lead.max_budget.present? ? "$#{number_with_delimiter(lead.max_budget)}" : 'No especificado'
      location_parts = [lead.neighborhood, lead.city&.es_name, lead.state&.es_name].compact.reject(&:blank?)
      location_display = location_parts.any? ? location_parts.join(', ') : 'No especificado'
      desired_date_display = lead.desired_date.present? ? lead.desired_date.strftime('%d/%m/%Y') : 'No especificado'
      source_detail = lead.source_detail || {}

      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #214c9b; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; }
              .section-title { color: #214c9b; font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #214c9b; padding-bottom: 5px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #374151; font-size: 14px; }
              .value { margin-top: 3px; color: #1f2937; }
              .highlight { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .notes { background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
              .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nueva Consulta de Comprador</h1>
              </div>
              <div class="content">
                <div class="highlight">
                  <div class="label">Tipo de Operación:</div>
                  <div class="value" style="font-size: 18px; font-weight: bold;">Compra</div>
                </div>

                <div class="section-title">Información de Contacto</div>
                <div class="field">
                  <div class="label">Nombre:</div>
                  <div class="value">#{lead.full_name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">#{lead.email || 'No proporcionado'}</div>
                </div>
                <div class="field">
                  <div class="label">Teléfono:</div>
                  <div class="value">#{lead.phone.present? ? lead.phone : 'No proporcionado'}</div>
                </div>

                <div class="section-title">Detalles del Interés</div>
                #{lead.interest_property_type.present? ? "<div class=\"field\"><div class=\"label\">Tipo de Propiedad:</div><div class=\"value\">#{lead.interest_property_type}</div></div>" : ''}
                <div class="field">
                  <div class="label">Presupuesto Máximo:</div>
                  <div class="value">#{budget_display}</div>
                </div>
                <div class="field">
                  <div class="label">Ubicación de Interés:</div>
                  <div class="value">#{location_display}</div>
                </div>
                <div class="field">
                  <div class="label">Fecha Deseada:</div>
                  <div class="value">#{desired_date_display}</div>
                </div>

                <div class="section-title">Información del Comprador</div>
                #{source_detail['purchase_goal'].present? ? "<div class=\"field\"><div class=\"label\">Objetivo de Compra:</div><div class=\"value\">#{source_detail['purchase_goal']}</div></div>" : ''}
                #{source_detail['payment_method'].present? ? "<div class=\"field\"><div class=\"label\">Método de Pago:</div><div class=\"value\">#{source_detail['payment_method']}</div></div>" : ''}
                #{source_detail['essential_criteria'].present? ? "<div class=\"field\"><div class=\"label\">Criterios Esenciales:</div><div class=\"value\">#{source_detail['essential_criteria']}</div></div>" : ''}
                #{source_detail['decision_timeframe'].present? ? "<div class=\"field\"><div class=\"label\">Plazo de Decisión:</div><div class=\"value\">#{format_timeframe(source_detail['decision_timeframe'])}</div></div>" : ''}
                #{source_detail['alignment_answer'].present? ? "<div class=\"field\"><div class=\"label\">Alineación:</div><div class=\"value\">#{source_detail['alignment_answer'] == 'yes' ? 'Sí' : 'En evaluación'}</div></div>" : ''}

                #{lead.notes.present? ? "<div class=\"section-title\">Notas Adicionales</div><div class=\"notes\">#{lead.notes.gsub("\n", '<br>')}</div>" : ''}

                <div class="footer">
                  <p>Lead ID: #{lead.id} | Fuente: #{lead.source}</p>
                  <p>Fecha de registro: #{lead.created_at.strftime('%d/%m/%Y %H:%M')}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # HTML template for seller consultation admin email
    def seller_consultation_admin_html(lead:)
      budget_display = lead.max_budget.present? ? "$#{number_with_delimiter(lead.max_budget)}" : 'No especificado'
      location_parts = [lead.neighborhood, lead.city&.es_name, lead.state&.es_name].compact.reject(&:blank?)
      location_display = location_parts.any? ? location_parts.join(', ') : 'No especificado'
      desired_date_display = lead.desired_date.present? ? lead.desired_date.strftime('%d/%m/%Y') : 'No especificado'

      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #214c9b; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9fafb; padding: 30px; }
              .section-title { color: #214c9b; font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #214c9b; padding-bottom: 5px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #374151; font-size: 14px; }
              .value { margin-top: 3px; color: #1f2937; }
              .highlight { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .notes { background-color: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
              .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nueva Consulta de Vendedor</h1>
              </div>
              <div class="content">
                <div class="highlight">
                  <div class="label">Tipo de Operación:</div>
                  <div class="value" style="font-size: 18px; font-weight: bold;">Venta</div>
                </div>

                <div class="section-title">Información de Contacto</div>
                <div class="field">
                  <div class="label">Nombre:</div>
                  <div class="value">#{lead.full_name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">#{lead.email || 'No proporcionado'}</div>
                </div>
                <div class="field">
                  <div class="label">Teléfono:</div>
                  <div class="value">#{lead.phone.present? ? lead.phone : 'No proporcionado'}</div>
                </div>

                <div class="section-title">Detalles de la Propiedad</div>
                <div class="field">
                  <div class="label">Precio Esperado:</div>
                  <div class="value">#{budget_display}</div>
                </div>
                <div class="field">
                  <div class="label">Ubicación:</div>
                  <div class="value">#{location_display}</div>
                </div>
                <div class="field">
                  <div class="label">Fecha Deseada de Venta:</div>
                  <div class="value">#{desired_date_display}</div>
                </div>

                #{lead.notes.present? ? "<div class=\"section-title\">Descripción de la Propiedad</div><div class=\"notes\">#{lead.notes.gsub("\n", '<br>')}</div>" : ''}

                <div class="footer">
                  <p>Lead ID: #{lead.id} | Fuente: #{lead.source}</p>
                  <p>Fecha de registro: #{lead.created_at.strftime('%d/%m/%Y %H:%M')}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # HTML template for buyer confirmation email to user
    def buyer_consultation_confirmation_html(lead:, general_info:)
      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #214c9b; color: white; padding: 30px; text-align: center; }
              .content { background-color: #f9fafb; padding: 40px; }
              .message { font-size: 16px; margin-bottom: 30px; }
              .summary { background-color: white; padding: 20px; border-radius: 5px; border: 1px solid #e5e7eb; margin-bottom: 30px; }
              .summary-title { font-weight: bold; color: #214c9b; margin-bottom: 15px; }
              .summary-item { margin-bottom: 10px; }
              .summary-label { color: #6b7280; font-size: 14px; }
              .summary-value { color: #1f2937; }
              .contact-section { background-color: #dbeafe; padding: 20px; border-radius: 5px; text-align: center; }
              .contact-title { font-weight: bold; color: #214c9b; margin-bottom: 10px; }
              .contact-info { margin: 5px 0; }
              .cta-button {
                display: inline-block;
                background-color: #214c9b;
                color: white !important;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                font-weight: bold;
              }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Gracias por tu Interés</h1>
              </div>
              <div class="content">
                <p style="font-size: 18px;">Hola #{lead.full_name},</p>
                <p class="message">Hemos recibido tu información y un asesor se pondrá en contacto contigo pronto para ayudarte a encontrar la propiedad ideal.</p>

                <div class="summary">
                  <div class="summary-title">Resumen de tu solicitud:</div>
                  <div class="summary-item">
                    <span class="summary-label">Operación:</span>
                    <span class="summary-value">Compra</span>
                  </div>
                  #{lead.max_budget.present? ? "<div class=\"summary-item\"><span class=\"summary-label\">Presupuesto:</span> <span class=\"summary-value\">$#{number_with_delimiter(lead.max_budget)}</span></div>" : ''}
                  #{[lead.neighborhood, lead.city&.es_name, lead.state&.es_name].compact.reject(&:blank?).any? ? "<div class=\"summary-item\"><span class=\"summary-label\">Ubicación:</span> <span class=\"summary-value\">#{[lead.neighborhood, lead.city&.es_name, lead.state&.es_name].compact.reject(&:blank?).join(', ')}</span></div>" : ''}
                </div>

                <div class="contact-section">
                  <div class="contact-title">¿Tienes preguntas?</div>
                  <p>No dudes en contactarnos:</p>
                  #{general_info.phone.present? ? "<div class=\"contact-info\">Tel: #{general_info.phone}</div>" : ''}
                  #{general_info.whatsapp.present? ? "<div class=\"contact-info\">WhatsApp: #{general_info.whatsapp}</div>" : ''}
                  <div class="contact-info">Email: #{general_info.email_to}</div>
                </div>

                <div style="text-align: center;">
                  <a href="#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}" class="cta-button">
                    Explorar Propiedades
                  </a>
                </div>

                <div class="footer">
                  <p>Este es un correo automático de confirmación.</p>
                  <p>Properlia - Tu socio en bienes raíces</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # HTML template for seller confirmation email to user
    def seller_consultation_confirmation_html(lead:, general_info:)
      <<~HTML
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #214c9b; color: white; padding: 30px; text-align: center; }
              .content { background-color: #f9fafb; padding: 40px; }
              .message { font-size: 16px; margin-bottom: 30px; }
              .summary { background-color: white; padding: 20px; border-radius: 5px; border: 1px solid #e5e7eb; margin-bottom: 30px; }
              .summary-title { font-weight: bold; color: #214c9b; margin-bottom: 15px; }
              .summary-item { margin-bottom: 10px; }
              .summary-label { color: #6b7280; font-size: 14px; }
              .summary-value { color: #1f2937; }
              .contact-section { background-color: #fef3c7; padding: 20px; border-radius: 5px; text-align: center; }
              .contact-title { font-weight: bold; color: #92400e; margin-bottom: 10px; }
              .contact-info { margin: 5px 0; }
              .cta-button {
                display: inline-block;
                background-color: #214c9b;
                color: white !important;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                font-weight: bold;
              }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Gracias por Contactarnos</h1>
              </div>
              <div class="content">
                <p style="font-size: 18px;">Hola #{lead.full_name},</p>
                <p class="message">Hemos recibido tu información y un asesor se pondrá en contacto contigo pronto para ayudarte con la venta de tu propiedad.</p>

                <div class="summary">
                  <div class="summary-title">Resumen de tu solicitud:</div>
                  <div class="summary-item">
                    <span class="summary-label">Operación:</span>
                    <span class="summary-value">Venta</span>
                  </div>
                  #{lead.max_budget.present? ? "<div class=\"summary-item\"><span class=\"summary-label\">Precio Esperado:</span> <span class=\"summary-value\">$#{number_with_delimiter(lead.max_budget)}</span></div>" : ''}
                  #{[lead.neighborhood, lead.city&.es_name, lead.state&.es_name].compact.reject(&:blank?).any? ? "<div class=\"summary-item\"><span class=\"summary-label\">Ubicación:</span> <span class=\"summary-value\">#{[lead.neighborhood, lead.city&.es_name, lead.state&.es_name].compact.reject(&:blank?).join(', ')}</span></div>" : ''}
                </div>

                <div class="contact-section">
                  <div class="contact-title">¿Tienes preguntas?</div>
                  <p>No dudes en contactarnos:</p>
                  #{general_info.phone.present? ? "<div class=\"contact-info\">Tel: #{general_info.phone}</div>" : ''}
                  #{general_info.whatsapp.present? ? "<div class=\"contact-info\">WhatsApp: #{general_info.whatsapp}</div>" : ''}
                  <div class="contact-info">Email: #{general_info.email_to}</div>
                </div>

                <div style="text-align: center;">
                  <a href="#{ENV.fetch('FRONTEND_URL', 'http://localhost:3001')}" class="cta-button">
                    Ver Nuestros Servicios
                  </a>
                </div>

                <div class="footer">
                  <p>Este es un correo automático de confirmación.</p>
                  <p>Properlia - Tu socio en bienes raíces</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      HTML
    end

    # Helper to format timeframe
    def format_timeframe(timeframe)
      case timeframe
      when '0-3' then '0-3 meses'
      when '3-6' then '3-6 meses'
      when '6-12' then '6-12 meses'
      else timeframe
      end
    end
  end
end
