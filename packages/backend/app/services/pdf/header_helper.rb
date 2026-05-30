# frozen_string_literal: true

module Pdf
  module HeaderHelper
    def add_global_header(pdf)
      header_h = 50
      brand_blue = '214C9B'
      text_gray = '373435'
      bg_gray = 'F5F5F5'

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
        # ignore
      end

      pdf.repeat(lambda { |pg| pg > 1 }) do
        pdf.canvas do
          pdf.fill_color bg_gray
          pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, header_h

          pdf.fill_color brand_blue
          pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top - header_h], pdf.bounds.width, 3

          # Row 1: Title (full width)
          begin
            pdf.font('Lexend', style: :bold)
          rescue StandardError
            begin
              pdf.font(pdf.font.family, style: :bold)
            rescue StandardError
              nil
            end
          end

          pdf.fill_color text_gray
          title_text = @property.title.to_s.strip
          title_text = title_text[0, 93] + '...' if title_text.length > 93
          pdf.text_box title_text,
                       at: [12, pdf.bounds.top - 10],
                       width: pdf.bounds.width - 24,
                       height: 18,
                       size: 14,
                       single_line: true,
                       overflow: :truncate

          # Row 2 left: location
          location_parts = []
          location_parts << @property.address if @property.exclusive_listing && @property.address.present?
          location_parts += [@property.neighborhood, @property.city, @property.state].compact.reject(&:blank?)
          location_text = location_parts.join(', ')

          begin
            pdf.font('Lexend', style: :semi_bold)
          rescue StandardError
            nil
          end

          pdf.fill_color text_gray
          pdf.text_box location_text,
                       at: [12, pdf.bounds.top - 34],
                       width: pdf.bounds.width / 2,
                       height: 12,
                       size: 9,
                       single_line: true,
                       overflow: :truncate

          # Row 2 right: listing type | property type
          begin
            pdf.font('Lexend')
          rescue StandardError
            nil
          end

          listing_type_text = if @property.listing_type
                                (@locale == :es ? @property.listing_type.es_name : @property.listing_type.name).to_s
                              end
          property_type_text = if @property.property_type
                                 (@locale == :es ? @property.property_type.es_name : @property.property_type.name).to_s
                               end

          type_parts = [listing_type_text, property_type_text].compact.reject(&:blank?)
          type_line = type_parts.map { |t| t.split.map(&:capitalize).join(' ') }.join(' | ')

          pdf.fill_color brand_blue
          type_width = pdf.width_of(type_line, size: 9)
          pdf.text_box type_line,
                       at: [pdf.bounds.width - type_width - 12, pdf.bounds.top - 34],
                       width: type_width + 12,
                       height: 12,
                       size: 9,
                       single_line: true,
                       overflow: :truncate

          pdf.fill_color '000000'
        end
      end
    end
  end
end
