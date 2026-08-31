# frozen_string_literal: true

class PropertyMailer < ApplicationMailer
  # Sends a property PDF brochure to a recipient
  #
  # @param property [Property] the property to send
  # @param recipient_email [String] the recipient's email address
  # @param pdf_data [String] the generated PDF binary data
  # @param locale [Symbol] :en or :es
  # @param message [String] optional personal message from sender
  def send_pdf(property:, recipient_email:, pdf_data:, locale: :es, message: nil)
    @property = property
    @locale = locale
    @message = message
    @general_info = GeneralInfo.instance

    # Set translations
    @t = translations[locale]

    # Attach PDF
    filename = "#{property.title.parameterize}_#{property.id}.pdf"
    attachments[filename] = pdf_data

    # Prepare email
    subject = locale == :es ? "Información sobre: #{property.title}" : "Information about: #{property.title}"

    mail(
      to: recipient_email,
      subject: subject,
      from: @general_info.email_to
    )
  end

  private

  def translations
    {
      en: {
        greeting: 'Hello,',
        intro: 'Thank you for your interest in this property.',
        attached: 'Please find attached the detailed property brochure.',
        contact: 'If you have any questions or would like to schedule a viewing, please contact us:',
        phone: 'Phone',
        whatsapp: 'WhatsApp',
        email: 'Email',
        regards: 'Best regards,',
        team: 'The Properlia Team'
      },
      es: {
        greeting: 'Hola,',
        intro: 'Gracias por tu interés en esta propiedad.',
        attached: 'Adjunto encontrarás el folleto detallado de la propiedad.',
        contact: 'Si tienes alguna pregunta o deseas agendar una visita, contáctanos:',
        phone: 'Teléfono',
        whatsapp: 'WhatsApp',
        email: 'Correo',
        regards: 'Saludos cordiales,',
        team: 'El equipo de Properlia'
      }
    }
  end
end
