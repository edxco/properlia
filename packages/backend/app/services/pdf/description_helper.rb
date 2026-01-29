# frozen_string_literal: true

module Pdf
  module DescriptionHelper
    def add_description_page(pdf)
      pdf.start_new_page(margin: 0)

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

      # Light gray background for the entire page
      pdf.canvas do
        pdf.fill_color bg_gray
        pdf.fill_rectangle [0, pdf.bounds.top], pdf.bounds.width, pdf.bounds.height
        pdf.fill_color '000000'
      end

      margin = 40
      content_width = pdf.bounds.width - (margin * 2)

      # Description header
      begin
        pdf.font('Lexend', style: :extra_bold)
      rescue StandardError
        begin
          pdf.font(pdf.font.family, style: :bold)
        rescue StandardError
          nil
        end
      end

      pdf.fill_color brand_blue
      pdf.text_box @t[:description],
                   at: [margin, pdf.bounds.top - 80],
                   width: content_width,
                   height: 30,
                   size: 16,
                   overflow: :shrink_to_fit

      # Description text
      begin
        pdf.font('Lexend')
      rescue StandardError
        # ignore
      end

      desc_text = @property.description.to_s.strip
      if desc_text.present?
        pdf.fill_color text_gray
        pdf.text_box desc_text,
                     at: [margin, pdf.bounds.top - 120],
                     width: content_width,
                     height: 500,
                     size: 12,
                     leading: 4,
                     align: :justify,
                     overflow: :truncate
      end

      pdf.fill_color '000000'
    end
  end
end
