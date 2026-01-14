# frozen_string_literal: true

require 'prawn'
require 'prawn/table'
require 'rqrcode'
require 'open-uri'
require 'mini_magick'

# Suppress Prawn internationalization warning
Prawn::Fonts::AFM.hide_m17n_warning = true

class PdfGeneratorService
  # Template constants based on property type names from DB
  RESIDENTIAL_TYPES = %w[house departament].freeze
  COMMERCIAL_TYPES = ['retail space'].freeze
  INDUSTRIAL_TYPES = %w[warehouse].freeze
  LAND_TYPES = %w[land].freeze

  # Translations
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
    # Determine template based on property type
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
      generate_residential_pdf # fallback
    end
  end

  private

  def determine_template
    # Return residential if property type is missing
    return :residential unless @property.property_type

    # Get the property type name (e.g., 'house', 'departament', 'retail space', 'warehouse', 'land')
    type_name = @property.property_type.name

    return :residential if RESIDENTIAL_TYPES.include?(type_name)
    return :commercial if COMMERCIAL_TYPES.include?(type_name)
    return :industrial if INDUSTRIAL_TYPES.include?(type_name)
    return :land if LAND_TYPES.include?(type_name)

    :residential # default fallback
  end

  def generate_residential_pdf
    # NOTE: Cover reference is LETTER (612x792). Using LETTER to match pixel-perfect cover.
    Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
      # Cover page with residential template design
      add_residential_template_cover(pdf)

      # Start content pages with margins
      pdf.start_new_page(margin: 40)

      # Header with title
      add_header(pdf)

      # Property images section
      add_images_section(pdf, max_images: 4)

      # Property title and price
      pdf.move_down 20
      pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
      pdf.move_down 10
      pdf.text format_price(@property.price), size: 24, style: :bold, color: '27AE60'

      # Key features in a box
      pdf.move_down 15
      add_residential_features_box(pdf)

      # Description
      if @property.description.present?
        pdf.move_down 15
        pdf.text @t[:description], size: 14, style: :bold
        pdf.move_down 5
        pdf.text @property.description, size: 10, align: :justify
      end

      # Location details
      pdf.move_down 15
      add_location_section(pdf)

      # Additional property details
      pdf.move_down 15
      add_property_details_table(pdf)

      # Footer with contact info and QR code
      add_footer(pdf)
    end.render
  end

  def generate_commercial_pdf
    # NOTE: Cover reference is LETTER (612x792). Using LETTER to match pixel-perfect cover.
    Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
      # Cover page
      add_cover_page(pdf, color: '3498DB')

      # Start content pages with margins
      pdf.start_new_page(margin: 40)

      # Header
      add_header(pdf)

      # Property images
      add_images_section(pdf, max_images: 3)

      # Title and price
      pdf.move_down 20
      pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
      pdf.move_down 10
      pdf.text format_price(@property.price), size: 24, style: :bold, color: '3498DB'

      # Commercial features
      pdf.move_down 15
      add_commercial_features_box(pdf)

      # Description
      if @property.description.present?
        pdf.move_down 15
        pdf.text @t[:description], size: 14, style: :bold
        pdf.move_down 5
        pdf.text @property.description, size: 10, align: :justify
      end

      # Location (important for commercial)
      pdf.move_down 15
      add_location_section(pdf)

      # Details table
      pdf.move_down 15
      add_property_details_table(pdf)

      # Footer
      add_footer(pdf)
    end.render
  end

  def generate_industrial_pdf
    # NOTE: Cover reference is LETTER (612x792). Using LETTER to match pixel-perfect cover.
    Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
      # Cover page
      add_cover_page(pdf, color: 'E74C3C')

      # Start content pages with margins
      pdf.start_new_page(margin: 40)

      # Header
      add_header(pdf)

      # Images
      add_images_section(pdf, max_images: 3)

      # Title and price
      pdf.move_down 20
      pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
      pdf.move_down 10
      pdf.text format_price(@property.price), size: 24, style: :bold, color: 'E74C3C'

      # Industrial features
      pdf.move_down 15
      add_industrial_features_box(pdf)

      # Description
      if @property.description.present?
        pdf.move_down 15
        pdf.text @t[:description], size: 14, style: :bold
        pdf.move_down 5
        pdf.text @property.description, size: 10, align: :justify
      end

      # Location
      pdf.move_down 15
      add_location_section(pdf)

      # Details
      pdf.move_down 15
      add_property_details_table(pdf)

      # Footer
      add_footer(pdf)
    end.render
  end

  def generate_land_pdf
    # NOTE: Cover reference is LETTER (612x792). Using LETTER to match pixel-perfect cover.
    Prawn::Document.new(page_size: 'LETTER', margin: 0) do |pdf|
      # Cover page
      add_cover_page(pdf, color: '8E44AD')

      # Start content pages with margins
      pdf.start_new_page(margin: 40)

      # Header
      add_header(pdf)

      # Images
      add_images_section(pdf, max_images: 3)

      # Title and price
      pdf.move_down 20
      pdf.text @property.title, size: 20, style: :bold, color: '2C3E50'
      pdf.move_down 10
      pdf.text format_price(@property.price), size: 24, style: :bold, color: '8E44AD'

      # Land features
      pdf.move_down 15
      add_land_features_box(pdf)

      # Description
      if @property.description.present?
        pdf.move_down 15
        pdf.text @t[:description], size: 14, style: :bold
        pdf.move_down 5
        pdf.text @property.description, size: 10, align: :justify
      end

      # Location (very important for land)
      pdf.move_down 15
      add_location_section(pdf)

      # Details
      pdf.move_down 15
      add_property_details_table(pdf)

      # Footer
      add_footer(pdf)
    end.render
  end

  # Helper methods

 def add_residential_template_cover(pdf)
  # Pixel-perfect cover based on uploaded "Tipo de propiedad (2).pdf" (LETTER 612x792)
  # IMPORTANT: Do not change Hero, Badges, Title blocks (kept intact below).

  # --- Fonts (Lexend). If not available, gracefully fallback.
  begin
    pdf.font_families.update(
      'Lexend' => {
        normal: Rails.root.join('app/assets/fonts/Lexend-Regular.ttf'),
        bold: Rails.root.join('app/assets/fonts/Lexend-Bold.ttf'),
        semi_bold: Rails.root.join('app/assets/fonts/Lexend-SemiBold.ttf'),
        extra_bold: Rails.root.join('app/assets/fonts/Lexend-ExtraBold.ttf')
      }
    )
  rescue StandardError
    # Ignore – keep default fonts.
  end

  # Helper: convert "y from top" (PDF reference) to Prawn y
  ref_y = ->(y_from_top) { pdf.bounds.top - y_from_top }

  # Colors from reference
  brand_blue  = '214C9B'
  light_blue  = '47C5FB'
  text_gray   = '373435'
  bg_gray     = 'E5E5E5'
  footer_blue = brand_blue

  # ------------------------------------------------------------
  # HERO (DO NOT CHANGE)
  # ------------------------------------------------------------
  hero_h = 408.75

  begin
    if @property.images.attached? && @property.images.first.present?
      pdf.bounding_box([0, pdf.bounds.top], width: pdf.bounds.width, height: hero_h) do
        display_image(pdf, @property.images.first, width: pdf.bounds.width, height: hero_h)
      end
    else
      pdf.canvas do
        pdf.fill_color brand_blue
        pdf.fill_rectangle [0, pdf.bounds.top], pdf.bounds.width, hero_h
        pdf.fill_color '000000'
      end
    end
  rescue StandardError => e
    Rails.logger.error "Failed to load cover hero image: #{e.message}"
    pdf.canvas do
      pdf.fill_color brand_blue
      pdf.fill_rectangle [0, pdf.bounds.top], pdf.bounds.width, hero_h
      pdf.fill_color '000000'
    end
  end

  # ------------------------------------------------------------
  # BADGES (DO NOT CHANGE)
  # ------------------------------------------------------------
  pdf.canvas do
    pdf.fill_color light_blue
    pdf.fill_rectangle [306, ref_y.call(255.7490234375)], 263.6533203125, 29.244048595428467

    pdf.fill_color brand_blue
    pdf.fill_rectangle [306, ref_y.call(284.99310302734375)], 263.583740234375, 46.89190673828125

    pdf.fill_color '000000'
  end

  listing_text =
    if @property.listing_type
      (@locale == :es ? @property.listing_type.es_name : @property.listing_type.name).to_s
    else
      ''
    end

  type_text =
    if @property.property_type
      (@locale == :es ? @property.property_type.es_name : @property.property_type.name).to_s
    else
      ''
    end

  pdf.fill_color 'FFFFFF'
  begin
    pdf.font('Lexend', style: :extra_bold)
  rescue StandardError
    nil
  end

  right_edge        = 566.6082153320312
  listing_box_w     = (566.6082153320312 - 372.1171875)
  type_box_w        = (566.6123657226562 - 328.5)
  badge_right_edge  = 306.0 + 263.6533203125
  title_box_w       = 416.8920135498047

  pdf.text_box listing_text.to_s.strip.capitalize,
               at: [right_edge - listing_box_w, ref_y.call(262.4990234375)],
               width: listing_box_w,
               height: 15.0,
               size: 12,
               overflow: :shrink_to_fit,
               align: :right,
               single_line: true

  pdf.text_box type_text.to_s.strip.upcase,
               at: [right_edge - type_box_w, ref_y.call(298.4930725097656)],
               width: type_box_w,
               height: 18.75,
               size: 15,
               overflow: :shrink_to_fit,
               align: :right,
               single_line: true

  # ------------------------------------------------------------
  # TITLE (DO NOT CHANGE)
  # ------------------------------------------------------------
  pdf.text_box @property.title.to_s.strip,
               at: [badge_right_edge - title_box_w, ref_y.call(334.0053405761719)],
               width: title_box_w,
               height: 52.5,
               size: 42,
               align: :center,
               overflow: :shrink_to_fit

  pdf.fill_color '000000'

  # ------------------------------------------------------------
  # TOP-LEFT LOGO WHITE BOX + LOGO (from template)
  # ------------------------------------------------------------
  pdf.canvas do
    pdf.fill_color 'FFFFFF'
    # White rectangle: x=0, y=0, w=151.3266, h=61.2 (y from top)
    pdf.fill_rectangle [0, ref_y.call(0)], 151.32655334472656, 61.19999694824219
    pdf.fill_color '000000'
  end

  # Logo path fixed as you requested
  logo_path = Rails.root.join('app/assets/images/properlia.png')
  if File.exist?(logo_path)
    # Logo image rect in PDF: x=8.5039, y=13.6096, w=135.75, h=33.75
    pdf.image logo_path.to_s,
              at: [8.503936767578125, ref_y.call(13.609603881835938)],
              width: 135.75,
              height: 33.75
  end

  # ------------------------------------------------------------
  # GRAY PANEL BACKGROUND (middle block)
  # ------------------------------------------------------------
  pdf.canvas do
    pdf.fill_color bg_gray
    # Rect: x=0, y=408.509979, w=611.778381, h=341.954742 (to y=750.464722)
    pdf.fill_rectangle [0, ref_y.call(408.5099792480469)], 611.7783813476562, (750.4647216796875 - 408.5099792480469)
    pdf.fill_color '000000'
  end

  # Helpers for values (match template style "1,050m2")
  fmt_int = ->(v) { number_with_delimiter(v.to_i, delimiter: ',') }
  area_str = ->(v) { v.present? ? "#{fmt_int.call(v)}m2" : nil }

  land_area  = area_str.call(@property.land_area)
  built_area = area_str.call(@property.built_area)

  # ------------------------------------------------------------
  # LEFT COLUMN: Property Details + lines (positions from PDF)
  # ------------------------------------------------------------
  begin
    pdf.font('Lexend', style: :extra_bold)
  rescue StandardError
    nil
  end
  pdf.fill_color text_gray
  pdf.text_box @t[:title], # "Property Details" / "Detalles de la Propiedad"
               at: [41.67942810058594, ref_y.call(433.300048828125)],
               width: (178.079345703125 - 41.67942810058594),
               height: (453.29693603515625 - 433.300048828125),
               size: 16,
               overflow: :shrink_to_fit

  begin
    pdf.font('Lexend')
  rescue StandardError
    nil
  end

  y_lines = [
    [469.13226318359375, "#{land_area} #{@t[:land_area]}".strip],
    [485.63226318359375, "#{built_area} #{@t[:built_area]}".strip],
    [502.13226318359375, (@property.rooms.to_i > 0 ? "#{@property.rooms.to_i} #{@t[:rooms]}:" : nil)],
    [518.6322631835938,  (@property.parking_spaces.to_i > 0 ? "#{@property.parking_spaces.to_i} #{@t[:parking_spaces]}:" : nil)],
    [535.1322631835938,  (@property.bathrooms.to_i > 0 ? "#{@property.bathrooms.to_i} #{@t[:bathrooms]}:" : nil)],
    [551.6322631835938,  (@property.half_bathrooms.to_i > 0 ? "#{@property.half_bathrooms.to_i} #{@t[:half_bathrooms]}:" : nil)]
  ]

  y_lines.each do |y0, txt|
    next if txt.blank?

    pdf.text_box txt,
                 at: [41.67942810058594, ref_y.call(y0)],
                 width: 300,
                 height: 16,
                 size: 12,
                 overflow: :shrink_to_fit
  end

  # ------------------------------------------------------------
  # RIGHT COLUMN: Price + Address + City/State
  # ------------------------------------------------------------
  begin
    pdf.font('Lexend', style: :extra_bold)
  rescue StandardError
    nil
  end
  pdf.fill_color text_gray
  price_text = "#{format_price(@property.price)} MXN"
  pdf.text_box price_text,
               at: [403.57843017578125, ref_y.call(434.2475280761719)],
               width: (568.602783203125 - 403.57843017578125),
               height: (464.2475280761719 - 434.2475280761719),
               size: 24,
               overflow: :shrink_to_fit,
               align: :right

  begin
    pdf.font('Lexend')
  rescue StandardError
    nil
  end
  pdf.fill_color brand_blue

  addr = [@property.address, @property.neighborhood].compact.join(', ')
  pdf.text_box addr,
               at: [398.4977111816406, ref_y.call(467.1249694824219)],
               width: (568.6176147460938 - 398.4977111816406),
               height: 20,
               size: 12,
               overflow: :shrink_to_fit,
               align: :right

  city_state = [@property.city, @property.state].compact.join(' / ')
  pdf.text_box city_state,
               at: [484.0152893066406, ref_y.call(491.2999572753906)],
               width: (569.6115112304688 - 484.0152893066406),
               height: 20,
               size: 16,
               overflow: :shrink_to_fit,
               align: :right

  pdf.fill_color '000000'

  # ------------------------------------------------------------
  # DESCRIPTION SECTION (below gray panel)
  # ------------------------------------------------------------
  begin
    pdf.font('Lexend', style: :extra_bold)
  rescue StandardError
    nil
  end
  pdf.fill_color text_gray
  pdf.text_box @t[:description],
               at: [41.67942810058594, ref_y.call(580.0847778320312)],
               width: 250,
               height: 20,
               size: 16,
               overflow: :shrink_to_fit

  begin
    pdf.font('Lexend')
  rescue StandardError
    nil
  end
  pdf.fill_color text_gray

  desc_text = @property.description.to_s.strip
  if desc_text.present?
    # The reference shows size ~10 and a multi-line block
    pdf.text_box desc_text,
                 at: [41.67942810058594, ref_y.call(609.3557739257812)],
                 width: (pdf.bounds.width - (41.67942810058594 * 2)),
                 height: 140,
                 size: 10,
                 leading: 2,
                 overflow: :truncate
  end

  pdf.fill_color '000000'

  # ------------------------------------------------------------
  # BOTTOM FOOTER STRIP (blue) + text
  # ------------------------------------------------------------
  pdf.canvas do
    pdf.fill_color footer_blue
    # Rect: x=-5.4219, y=750.4648, w=622.7638, h=41.4636
    pdf.fill_rectangle [-5.4219255447387695, ref_y.call(750.4647827148438)],
                       (617.3419189453125 - (-5.4219255447387695)),
                       (791.9284057617188 - 750.4647827148438)
    pdf.fill_color '000000'
  end

  pdf.fill_color 'FFFFFF'
  begin
    pdf.font('Lexend', style: :extra_bold)
  rescue StandardError
    nil
  end
  pdf.text_box "Properlia © #{Time.current.year}",
               at: [11.35546875, ref_y.call(763.6965942382812)],
               width: 250,
               height: 15,
               size: 12,
               overflow: :shrink_to_fit

  begin
    pdf.font('Lexend', style: :semi_bold)
  rescue StandardError
    # fallback to normal if semibold not available
    begin
      pdf.font('Lexend')
    rescue StandardError
      nil
    end
  end
  phone = @general_info&.phone.to_s.presence || '222 255 9549'
  pdf.text_box "#{phone}   |",
               at: [380.1168518066406, ref_y.call(763.6965942382812)],
               width: 110,
               height: 15,
               size: 12,
               overflow: :shrink_to_fit

  begin
    pdf.font('Lexend')
  rescue StandardError
    nil
  end
  pdf.fill_color 'F6F6F6'
  pdf.text_box 'www.properlia.com',
               at: [485.0113525390625, ref_y.call(763.6965942382812)],
               width: 120,
               height: 15,
               size: 12,
               overflow: :shrink_to_fit

  pdf.fill_color '000000'
end


  def add_cover_page(pdf, color: '27AE60')
    # Pixel-perfect cover based on "Tipo de propiedad.pdf" reference.
    # Keep the method signature to avoid touching the callers.
    add_residential_template_cover(pdf)
  end

  def add_cover_features(pdf, color:)
    features = []

    # Collect features based on property type (without emojis)
    template = determine_template

    case template
    when :residential
      features << { label: @t[:rooms], value: @property.rooms.to_s } if @property.rooms > 0
      features << { label: @t[:bathrooms], value: @property.bathrooms.to_s } if @property.bathrooms > 0
      features << { label: @t[:parking_spaces], value: @property.parking_spaces.to_s } if @property.parking_spaces > 0
      if @property.built_area.present?
        features << { label: @t[:built_area],
                      value: "#{@property.built_area} #{@t[:sqm]}" }
      end
    when :commercial, :industrial
      if @property.built_area.present?
        features << { label: @t[:built_area],
                      value: "#{@property.built_area} #{@t[:sqm]}" }
      end
      features << { label: @t[:land_area], value: "#{@property.land_area} #{@t[:sqm]}" } if @property.land_area.present?
      features << { label: @t[:parking_spaces], value: @property.parking_spaces.to_s } if @property.parking_spaces > 0
    when :land
      features << { label: @t[:land_area], value: "#{@property.land_area} #{@t[:sqm]}" } if @property.land_area.present?
    end

    return if features.empty?

    # Display features in a grid
    features_per_row = [features.length, 4].min
    box_width = (pdf.bounds.width / features_per_row) - 10

    features.each_with_index do |feature, index|
      x_pos = (index % features_per_row) * (box_width + 10)
      y_pos = pdf.cursor - ((index / features_per_row) * 70)

      pdf.bounding_box([x_pos, pdf.cursor], width: box_width, height: 60) do
        # Feature box with background
        pdf.fill_color 'FFFFFF'
        pdf.fill_and_stroke_rounded_rectangle [0, 60], box_width, 60, 8

        # Circle icon background
        circle_center_x = box_width / 2
        pdf.fill_color color
        pdf.fill_circle [circle_center_x, 35], 15

        # Value (white text on colored circle)
        pdf.fill_color 'FFFFFF'
        pdf.text_box feature[:value],
                     at: [0, 40],
                     width: box_width,
                     height: 20,
                     size: 12,
                     style: :bold,
                     align: :center

        # Label
        pdf.fill_color '2C3E50'
        pdf.text_box feature[:label],
                     at: [5, 15],
                     size: 9,
                     width: box_width - 10,
                     align: :center,
                     overflow: :shrink_to_fit

        pdf.fill_color '000000'
      end
    end
  end

  def add_header(pdf)
    pdf.text 'PROPERLIA', size: 24, style: :bold, color: '1A1A1A'
    pdf.move_down 5
    pdf.stroke_horizontal_rule
    pdf.move_down 10
  end

  def add_images_section(pdf, max_images: 4)
    return unless @property.images.attached?

    images_to_display = @property.images.first(max_images)
    return if images_to_display.empty?

    pdf.move_down 10

    # Calculate layout based on number of images
    if images_to_display.count == 1
      # Single large image
      display_image(pdf, images_to_display.first, width: 500, height: 300)
    elsif images_to_display.count == 2
      # Two images side by side
      images_to_display.each_with_index do |image, index|
        pdf.bounding_box([index * 250, pdf.cursor], width: 240, height: 180) do
          display_image(pdf, image, width: 240, height: 180)
        end
      end
      pdf.move_down 190
    elsif images_to_display.count == 3
      # One large on top, two smaller below
      display_image(pdf, images_to_display[0], width: 500, height: 200)
      pdf.move_down 10
      [1, 2].each do |i|
        pdf.bounding_box([(i - 1) * 250, pdf.cursor], width: 240, height: 140) do
          display_image(pdf, images_to_display[i], width: 240, height: 140)
        end
      end
      pdf.move_down 150
    else
      # Grid of 4 images (2x2)
      images_to_display.each_with_index do |image, index|
        row = index / 2
        col = index % 2
        pdf.bounding_box([col * 250, pdf.cursor - (row * 150)], width: 240, height: 140) do
          display_image(pdf, image, width: 240, height: 140)
        end
      end
      pdf.move_down 310
    end
  end

  def display_image(pdf, attachment, width:, height:)
    return unless attachment.present?

    begin
      # Get the blob from the attachment
      blob = attachment.blob
      return unless blob

      # Skip non-image content types
      return unless blob.content_type&.start_with?('image/')

      # Get image data
      if attachment.service.name == :local
        # For local storage, use the path directly
        image_path = ActiveStorage::Blob.service.path_for(blob.key)

        # Check if file exists
        unless File.exist?(image_path)
          Rails.logger.warn "Image file not found: #{image_path}"
          return
        end

        # For WebP images, convert to PNG first (Prawn doesn't support WebP)
        if blob.content_type == 'image/webp'
          require 'mini_magick'
          image = MiniMagick::Image.open(image_path)
          png_path = "#{image_path}.png"
          image.format 'png'
          image.write png_path
          pdf.image png_path, fit: [width, height]
          File.delete(png_path) if File.exist?(png_path) # Clean up temp file
        else
          pdf.image image_path, fit: [width, height]
        end
      else
        # For remote storage (S3), download the image
        url = attachment.url
        image_data = URI.open(url)

        # For WebP images, convert to PNG first
        if blob.content_type == 'image/webp'
          require 'mini_magick'
          image = MiniMagick::Image.read(image_data)
          image.format 'png'
          pdf.image StringIO.new(image.to_blob), fit: [width, height]
        else
          pdf.image image_data, fit: [width, height]
        end
      end
    rescue StandardError => e
      # If image fails to load, just skip it silently
      Rails.logger.error "Failed to load image: #{e.message}\n#{e.backtrace.first(3).join("\n")}"
    end
  end

  def add_residential_features_box(pdf)
    features = []
    features << "#{@property.rooms} #{@t[:rooms]}" if @property.rooms > 0
    features << "#{@property.bathrooms} #{@t[:bathrooms]}" if @property.bathrooms > 0
    features << "#{@property.parking_spaces} #{@t[:parking_spaces]}" if @property.parking_spaces > 0
    features << "#{@property.built_area} #{@t[:sqm]}" if @property.built_area.present?

    return if features.empty?

    pdf.stroke_bounds do
      pdf.fill_color 'F8F9FA'
      pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 60
      pdf.fill_color '000000'

      pdf.pad(15) do
        pdf.text features.join(' • '), size: 12, align: :center, style: :bold
      end
    end
  end

  def add_commercial_features_box(pdf)
    features = []
    features << "#{@property.built_area} #{@t[:sqm]} #{@t[:built_area]}" if @property.built_area.present?
    features << "#{@property.land_area} #{@t[:sqm]} #{@t[:land_area]}" if @property.land_area.present?
    features << "#{@property.parking_spaces} #{@t[:parking_spaces]}" if @property.parking_spaces > 0

    return if features.empty?

    pdf.stroke_bounds do
      pdf.fill_color 'EBF5FB'
      pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 60
      pdf.fill_color '000000'

      pdf.pad(15) do
        pdf.text features.join(' • '), size: 12, align: :center, style: :bold
      end
    end
  end

  def add_industrial_features_box(pdf)
    features = []
    features << "#{@property.built_area} #{@t[:sqm]} #{@t[:built_area]}" if @property.built_area.present?
    features << "#{@property.land_area} #{@t[:sqm]} #{@t[:land_area]}" if @property.land_area.present?
    features << "#{@property.parking_spaces} #{@t[:parking_spaces]}" if @property.parking_spaces > 0

    return if features.empty?

    pdf.stroke_bounds do
      pdf.fill_color 'FADBD8'
      pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 60
      pdf.fill_color '000000'

      pdf.pad(15) do
        pdf.text features.join(' • '), size: 12, align: :center, style: :bold
      end
    end
  end

  def add_land_features_box(pdf)
    features = []
    features << "#{@property.land_area} #{@t[:sqm]}" if @property.land_area.present?

    return if features.empty?

    pdf.stroke_bounds do
      pdf.fill_color 'F4ECF7'
      pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 60
      pdf.fill_color '000000'

      pdf.pad(15) do
        pdf.text "#{@t[:land_area]}: #{features.join(' • ')}", size: 12, align: :center, style: :bold
      end
    end
  end

  def add_location_section(pdf)
    pdf.text "#{@t[:address]}", size: 14, style: :bold
    pdf.move_down 5

    location_parts = []
    location_parts << @property.address if @property.address.present?
    location_parts << @property.neighborhood if @property.neighborhood.present?
    location_parts << @property.city if @property.city.present?
    location_parts << @property.state if @property.state.present?
    location_parts << @property.zip_code if @property.zip_code.present?

    pdf.text location_parts.join(', '), size: 10
  end

  def add_property_details_table(pdf)
    data = []

    # Property type
    data << [@t[:property_type], @property.property_type.name] if @property.property_type

    # Listing type
    data << [@t[:listing_type], @property.listing_type.name] if @property.listing_type

    # Status
    data << [@t[:status], @property.status.name] if @property.status

    # Exclusive listing
    data << [@t[:exclusive], @property.exclusive_listing ? @t[:yes] : @t[:no]]

    # Featured
    data << [@t[:featured], @property.featured ? @t[:yes] : @t[:no]] if @property.featured

    return if data.empty?

    pdf.table(data, width: pdf.bounds.width, cell_style: { padding: 8 }) do
      cells.border_width = 0.5
      columns(0).font_style = :bold
      columns(0).background_color = 'F8F9FA'
    end
  end

  def add_footer(pdf)
    # Move to bottom of page
    pdf.move_down 20

    # Contact information box
    pdf.stroke_bounds do
      pdf.fill_color 'E8F8F5'
      pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 80
      pdf.fill_color '000000'

      pdf.bounding_box([pdf.bounds.left + 10, pdf.bounds.top - 10], width: pdf.bounds.width - 120, height: 60) do
        pdf.text @t[:contact], size: 12, style: :bold
        pdf.move_down 5
        pdf.text "#{@t[:phone]}: #{@general_info.phone}", size: 9
        pdf.text "#{@t[:whatsapp]}: #{@general_info.whatsapp}", size: 9
        pdf.text "#{@t[:email]}: #{@general_info.email_to}", size: 9
      end

      # QR Code
      add_qr_code(pdf)
    end
  end

  def add_qr_code(pdf)
    property_url = "#{@base_url}/properties/#{@property.id}"
    qrcode = RQRCode::QRCode.new(property_url)

    # Convert QR code to PNG
    png = qrcode.as_png(
      bit_depth: 1,
      border_modules: 1,
      color_mode: ChunkyPNG::COLOR_GRAYSCALE,
      color: 'black',
      file: nil,
      fill: 'white',
      module_px_size: 6,
      resize_exactly_to: false,
      resize_gte_to: false,
      size: 120
    )

    # Save to temporary file
    temp_file = Tempfile.new(['qr', '.png'])
    temp_file.binmode
    temp_file.write(png.to_s)
    temp_file.rewind

    # Add to PDF
    pdf.bounding_box([pdf.bounds.width - 90, pdf.bounds.top - 10], width: 80, height: 80) do
      pdf.image temp_file.path, fit: [70, 70]
      pdf.move_down 2
      pdf.text @t[:scan_qr], size: 6, align: :center
    end

    temp_file.close
    temp_file.unlink
  rescue StandardError => e
    Rails.logger.error "Failed to generate QR code: #{e.message}"
  end

  def format_price(price)
    "$#{number_with_delimiter(price, delimiter: ',')}"
  end

  def number_with_delimiter(number, delimiter: ',')
    number.to_s.reverse.gsub(/(\d{3})(?=\d)/, "\\1#{delimiter}").reverse
  end
end
