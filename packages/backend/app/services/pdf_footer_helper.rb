# frozen_string_literal: true

module PdfFooterHelper
  def add_global_footer(pdf)
    footer_h = 42 # matches your cover strip height vibe
    brand_blue = '214C9B'

    # helper: y-from-top -> prawn y
    ref_y = ->(y_from_top) { pdf.bounds.top - y_from_top }

    phone = @general_info&.phone.to_s.presence || '222 255 9549'
    website = 'www.properlia.com'

    # Optional: load Lexend if available (same logic as cover)
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

    pdf.repeat(:all) do
      pdf.canvas do
        # Bottom strip (absolute page coords)
        pdf.fill_color brand_blue
        pdf.fill_rectangle [pdf.bounds.left, footer_h], pdf.bounds.width, footer_h
        pdf.fill_color 'FFFFFF'

        # Left: Properlia © YEAR
        begin
          pdf.font('Lexend', style: :extra_bold)
        rescue StandardError
          begin
            pdf.font(pdf.font.family, style: :bold)
          rescue StandardError
            nil
          end
        end
        pdf.draw_text "Properlia © #{Time.current.year}", at: [12, 16]

        # Middle-right: phone
        begin
          pdf.font('Lexend', style: :semi_bold)
        rescue StandardError
          # ignore
        end
        pdf.draw_text "#{phone}   |", at: [pdf.bounds.width - 220, 16]

        # Right: website
        begin
          pdf.font('Lexend')
        rescue StandardError
          # ignore
        end
        pdf.fill_color 'F6F6F6'
        pdf.draw_text website, at: [pdf.bounds.width - 120, 16]

        # (Optional) page number on far right
        pdf.fill_color 'FFFFFF'
        pdf.draw_text pdf.page_number.to_s, at: [pdf.bounds.width - 20, 16]

        pdf.fill_color '000000'
      end
    end
  end
end
