# frozen_string_literal: true

require 'prawn'
require 'prawn/table'
require 'open-uri'
require 'mini_magick'

Prawn::Fonts::AFM.hide_m17n_warning = true

module Pdf
  class GeneratorService
    include Pdf::FooterHelper
    include Pdf::HeaderHelper
    include Pdf::CoverHelper
    include Pdf::DescriptionHelper
    include Pdf::ImagesHelper
    include Pdf::FeaturesHelper
    include Pdf::ContentHelper
    include Pdf::FormatHelper
    include Pdf::DisplayImageCover

    RESIDENTIAL_TYPES = %w[house departament].freeze
    COMMERCIAL_TYPES = ['retail space'].freeze
    INDUSTRIAL_TYPES = %w[warehouse].freeze
    LAND_TYPES = %w[land].freeze

    TRANSLATIONS = {
      en: {
        title: 'Property Details',
        description: 'Description',
        price: 'Price',
        address: 'Address',
        city: 'City',
        state: 'State',
        neighborhood: 'Neighborhood',
        zip_code: 'ZIP Code',
        property_type: 'Property Type',
        listing_type: 'Listing Type',
        status: 'Status',
        land_area: 'Land Area',
        built_area: 'Built Area',
        rooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        half_bathrooms: 'Half Bathrooms',
        parking_spaces: 'Parking Spaces',
        contact: 'Contact Information',
        phone: 'Phone',
        whatsapp: 'WhatsApp',
        email: 'Email',
        exclusive: 'Exclusive Listing',
        featured: 'Featured Property',
        scan_qr: 'Scan for more details',
        sqm: 'sqm',
        yes: 'Yes',
        no: 'No'
      },
      es: {
        title: 'Detalles de la Propiedad',
        description: 'Descripción',
        price: 'Precio',
        address: 'Dirección',
        city: 'Ciudad',
        state: 'Estado',
        neighborhood: 'Colonia',
        zip_code: 'Código Postal',
        property_type: 'Tipo de Propiedad',
        listing_type: 'Tipo de Listado',
        status: 'Estado',
        land_area: 'Área del Terreno',
        built_area: 'Área Construida',
        rooms: 'Recámaras',
        bathrooms: 'Baños',
        half_bathrooms: 'Medios Baños',
        parking_spaces: 'Lugares de Estacionamiento',
        contact: 'Información de Contacto',
        phone: 'Teléfono',
        whatsapp: 'WhatsApp',
        email: 'Correo',
        exclusive: 'Listado Exclusivo',
        featured: 'Propiedad Destacada',
        scan_qr: 'Escanea para más detalles',
        sqm: 'm²',
        yes: 'Sí',
        no: 'No'
      }
    }.freeze

    def initialize(property, locale: :es, base_url: nil)
      @property = property
      @locale = locale.to_sym
      @base_url = base_url || ENV['FRONTEND_URL'] || 'http://localhost:3001'
      @general_info = GeneralInfo.instance
      @t = TRANSLATIONS[@locale]
    end

    def generate
      template = determine_template

      case template
      when :residential
        generate_residential_pdf
      when :commercial
        generate_commercial_pdf
      when :industrial
        generate_industrial_pdf
      when :land
        generate_land_pdf
      else
        generate_residential_pdf
      end
    end

    private

    def determine_template
      return :residential unless @property.property_type

      type_name = @property.property_type.name

      return :residential if RESIDENTIAL_TYPES.include?(type_name)
      return :commercial if COMMERCIAL_TYPES.include?(type_name)
      return :industrial if INDUSTRIAL_TYPES.include?(type_name)
      return :land if LAND_TYPES.include?(type_name)

      :residential
    end

    def generate_residential_pdf
      Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
        add_global_footer(pdf)
        add_global_header(pdf)
        add_residential_template_cover(pdf)

        # Page 2: Description page with light gray background
        add_description_page(pdf)

        # Page 3+: Images section
        pdf.start_new_page(margin: 40)
        add_images_section(pdf)

        pdf.move_down 20
        pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
        pdf.move_down 10
        pdf.text format_price(@property.price), size: 24, style: :bold, color: '27AE60'

        pdf.move_down 15
        add_location_section(pdf)

        pdf.move_down 15
        add_property_details_table(pdf)
      end.render
    end

    def generate_commercial_pdf
      Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
        add_global_footer(pdf)
        add_global_header(pdf)
        add_cover_page(pdf, color: '3498DB')

        # Page 2: Description page with light gray background
        add_description_page(pdf)

        # Page 3+: Images section
        pdf.start_new_page(margin: 40)
        add_images_section(pdf)

        pdf.move_down 20
        pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
        pdf.move_down 10
        pdf.text format_price(@property.price), size: 24, style: :bold, color: '3498DB'

        pdf.move_down 15
        add_commercial_features_box(pdf)

        pdf.move_down 15
        add_location_section(pdf)

        pdf.move_down 15
        add_property_details_table(pdf)
      end.render
    end

    def generate_industrial_pdf
      Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
        add_global_footer(pdf)
        add_global_header(pdf)
        add_cover_page(pdf, color: 'E74C3C')

        # Page 2: Description page with light gray background
        add_description_page(pdf)

        # Page 3+: Images section
        pdf.start_new_page(margin: 40)
        add_images_section(pdf)

        pdf.move_down 20
        pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
        pdf.move_down 10
        pdf.text format_price(@property.price), size: 24, style: :bold, color: 'E74C3C'

        pdf.move_down 15
        add_industrial_features_box(pdf)

        pdf.move_down 15
        add_location_section(pdf)

        pdf.move_down 15
        add_property_details_table(pdf)
      end.render
    end

    def generate_land_pdf
      Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
        add_global_footer(pdf)
        add_global_header(pdf)
        add_cover_page(pdf, color: '8E44AD')

        # Page 2: Description page with light gray background
        add_description_page(pdf)

        # Page 3+: Images section
        pdf.start_new_page(margin: 40)
        add_images_section(pdf)

        pdf.move_down 15
        add_location_section(pdf)
      end.render
    end
  end
end
