# frozen_string_literal: true

module Pdf
  module FooterHelper
    def add_global_footer(pdf)
      footer_h = 42
      brand_blue = '214C9B'

      raw_phone = @general_info&.phone.to_s.gsub(/\D/, '').presence || '2222559549'
      phone = if raw_phone.length == 10
                "(#{raw_phone[0..2]}) #{raw_phone[3..5]} #{raw_phone[6..7]} #{raw_phone[8..9]}"
              else
                @general_info&.phone.to_s.presence || '(222) 255 95 49'
              end
      website = 'www.properlia.com'

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
          pdf.fill_color brand_blue
          pdf.fill_rectangle [pdf.bounds.left, footer_h], pdf.bounds.width, footer_h
          pdf.fill_color 'FFFFFF'

          begin
            pdf.font('Lexend', style: :extra_bold)
          rescue StandardError
            begin
              pdf.font(pdf.font.family, style: :bold)
            rescue StandardError
              nil
            end
          end
          pdf.text_box "Properlia © #{Time.current.year}",
                       at: [12, 25],
                       width: 200,
                       height: 14,
                       size: 12,
                       single_line: true,
                       overflow: :truncate

          icon_size = 12
          icon_y = 13
          phone_icon = Rails.root.join('app/assets/images/phone-call.png').to_s
          whatsapp_icon = Rails.root.join('app/assets/images/whatsapp.png').to_s

          x_cursor = pdf.bounds.width - 270

          pdf.image phone_icon, at: [x_cursor, icon_y + icon_size], width: icon_size, height: icon_size if File.exist?(phone_icon)
          x_cursor += icon_size + 4

          pdf.image whatsapp_icon, at: [x_cursor, icon_y + icon_size], width: icon_size, height: icon_size if File.exist?(whatsapp_icon)
          x_cursor += icon_size + 6

          begin
            pdf.font('Lexend')
          rescue StandardError
            nil
          end
          pdf.text_box "#{phone}   |",
                       at: [x_cursor, 25],
                       width: 150,
                       height: 14,
                       size: 12,
                       single_line: true,
                       overflow: :truncate

          begin
            pdf.font('Lexend')
          rescue StandardError
            nil
          end
          pdf.fill_color 'F6F6F6'
          pdf.text_box website,
                       at: [pdf.bounds.width - 120, 25],
                       width: 130,
                       height: 14,
                       size: 12,
                       single_line: true,
                       overflow: :truncate
        end
      end
    end
  end
end
