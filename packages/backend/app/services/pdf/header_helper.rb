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

      # Skip the first page (cover page)
      pdf.repeat(lambda { |pg| pg > 1 }) do
        pdf.canvas do
          # Light gray header background
          pdf.fill_color bg_gray
          pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, header_h

          # Blue accent line at the bottom of header
          pdf.fill_color brand_blue
          pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top - header_h], pdf.bounds.width, 3

          # Property title (left side, bold, bigger font)
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
          title_text = title_text[0, 50] + '...' if title_text.length > 50
          pdf.draw_text title_text, at: [12, pdf.bounds.top - 30], size: 16

          # Right side - Location (top row)
          location_parts = [@property.neighborhood, @property.city, @property.state].compact.reject(&:blank?)
          location_text = location_parts.join(', ')
          location_text = location_text[0, 45] + '...' if location_text.length > 45

          begin
            pdf.font('Lexend', style: :semi_bold)
          rescue StandardError
            # ignore
          end

          pdf.fill_color text_gray
          location_width = pdf.width_of(location_text, size: 10)
          pdf.draw_text location_text, at: [pdf.bounds.width - location_width - 12, pdf.bounds.top - 18], size: 10

          # Right side - Property type and listing type (bottom row)
          begin
            pdf.font('Lexend')
          rescue StandardError
            # ignore
          end

          property_type_text = if @property.property_type
                                 (@locale == :es ? @property.property_type.es_name : @property.property_type.name).to_s
                               end
          listing_type_text = if @property.listing_type
                                (@locale == :es ? @property.listing_type.es_name : @property.listing_type.name).to_s
                              end

          type_parts = [property_type_text, listing_type_text].compact.reject(&:blank?)
          type_line = type_parts.map { |t| t.split.map(&:capitalize).join(' ') }.join(' • ')

          pdf.fill_color brand_blue
          type_width = pdf.width_of(type_line, size: 9)
          pdf.draw_text type_line, at: [pdf.bounds.width - type_width - 12, pdf.bounds.top - 38], size: 9

          pdf.fill_color '000000'
        end
      end
    end
  end
end
