# frozen_string_literal: true

require 'open-uri'

module Pdf
  module CoverHelper
    def add_residential_template_cover(pdf)
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

      ref_y = ->(y_from_top) { pdf.bounds.top - y_from_top }

      brand_blue  = '214C9B'
      light_blue  = '47C5FB'
      text_gray   = '373435'
      bg_gray     = 'E5E5E5'
      footer_blue = brand_blue

      hero_h = 408.75
      hero_w = pdf.bounds.width

      begin
        if @property.images.attached? && @property.images.first.present?
          attachment =
            if @property.image_order.present?
              cover_id = @property.image_order.first.to_s
              @property.images.find { |img| img.id.to_s == cover_id } || @property.images.first
            else
              @property.images.first
            end

          temp = cover_image_for_attachment(
            pdf_width: hero_w,
            pdf_height: hero_h,
            attachment: attachment
          )

          if temp
            begin
              pdf.canvas do
                pdf.bounding_box([0, pdf.bounds.top], width: hero_w, height: hero_h) do
                  pdf.image temp.path, at: [0, hero_h], width: hero_w, height: hero_h
                end
              end
            ensure
              temp.close
              temp.unlink
            end
          else
            pdf.canvas do
              pdf.fill_color brand_blue
              pdf.fill_rectangle [0, pdf.bounds.top], hero_w, hero_h
              pdf.fill_color '000000'
            end
          end
        else
          pdf.canvas do
            pdf.fill_color brand_blue
            pdf.fill_rectangle [0, pdf.bounds.top], hero_w, hero_h
            pdf.fill_color '000000'
          end
        end
      rescue StandardError => e
        Rails.logger.error "Failed to load cover hero image: #{e.message}"
        pdf.canvas do
          pdf.fill_color brand_blue
          pdf.fill_rectangle [0, pdf.bounds.top], hero_w, hero_h
          pdf.fill_color '000000'
        end
      end

      pdf.canvas do
        pdf.fill_color '000000'
        pdf.transparent(0.4) do
          pdf.fill_rectangle [0, ref_y.call(334.0053405761719 - 25)], hero_w, (hero_h - 334.0053405761719 + 25)
        end
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

      begin
        pdf.font('Lexend', style: :extra_bold)
      rescue StandardError
        nil
      end

      right_edge       = 566.6082153320312
      badge_right_edge = 306.0 + 263.6533203125
      title_box_w      = 416.8920135498047

      pdf.fill_color 'FFFFFF'
      pdf.text_box @property.title.to_s.strip,
                   at: [badge_right_edge - title_box_w, ref_y.call(334.0053405761719)],
                   width: title_box_w,
                   height: 52.5,
                   size: 28,
                   align: :right,
                   overflow: :shrink_to_fit

      pdf.fill_color '000000'

      if @display_properlia_info
        pdf.canvas do
          pdf.fill_color 'FFFFFF'
          pdf.fill_rectangle [0, ref_y.call(0)], 151.32655334472656, 61.19999694824219
          pdf.fill_color '000000'
        end

        logo_path = Rails.root.join('app/assets/images/properlia.png')
        if File.exist?(logo_path)
          pdf.image logo_path.to_s,
                    at: [8.503936767578125, ref_y.call(13.609603881835938)],
                    width: 135.75,
                    height: 33.75
        end
      end

      card_gap     = 20.0
      card_top_gap = 20.0
      col_w        = (611.7783813476562 - card_gap * 3) / 2.0
      left_card_x  = card_gap
      right_box_x  = left_card_x + col_w + card_gap
      col_pad      = 24
      col_h        = 172.0
      card_y_top   = 408.5099792480469 + card_top_gap
      l_txt_x      = left_card_x + col_pad
      r_txt_x      = right_box_x + col_pad
      txt_w        = col_w - 2 * col_pad
      section_h    = 750.4647216796875 - 408.5099792480469

      pdf.canvas do
        pdf.fill_color 'FFFFFF'
        pdf.fill_rectangle [0, ref_y.call(408.5099792480469)], 611.7783813476562, section_h
        pdf.fill_color '000000'
      end

      pdf.fill_color bg_gray
      pdf.rounded_rectangle [left_card_x, ref_y.call(card_y_top)], col_w, col_h, 14
      pdf.fill
      pdf.rounded_rectangle [right_box_x, ref_y.call(card_y_top)], col_w, col_h, 14
      pdf.fill

      fmt_int = ->(v) { number_with_delimiter(v.to_i, delimiter: ',') }
      area_str = ->(v) { v.present? ? "#{fmt_int.call(v)}m2" : nil }

      land_area  = area_str.call(@property.land_area)
      built_area = @property.built_area.to_i > 0 ? area_str.call(@property.built_area) : nil

      begin
        pdf.font('Lexend', style: :extra_bold)
      rescue StandardError
        nil
      end
      pdf.fill_color brand_blue
      pdf.text_box @t[:title],
                   at: [l_txt_x, ref_y.call(420.0 + card_top_gap)],
                   width: txt_w,
                   height: 20,
                   size: 16,
                   overflow: :shrink_to_fit

      begin
        pdf.font('Lexend')
      rescue StandardError
        nil
      end

      y_lines = [
        [454.57 + card_top_gap, "#{land_area} #{@t[:land_area]}".strip],
        [471.07 + card_top_gap, (built_area ? "#{built_area} #{@t[:built_area]}".strip : nil)],
        [487.57 + card_top_gap, (@property.rooms.to_i > 0 ? "#{@property.rooms.to_i} #{@t[:rooms]}" : nil)],
        [504.07 + card_top_gap,
         (@property.parking_spaces.to_i > 0 ? "#{@property.parking_spaces.to_i} #{@t[:parking_spaces]}" : nil)],
        [520.57 + card_top_gap, (@property.bathrooms.to_i > 0 ? "#{@property.bathrooms.to_i} #{@t[:bathrooms]}" : nil)],
        [537.07 + card_top_gap,
         (@property.half_bathrooms.to_i > 0 ? "#{@property.half_bathrooms.to_i} #{@t[:half_bathrooms]}" : nil)]
      ]

      y_lines.each do |y0, txt|
        next if txt.blank?

        pdf.text_box txt,
                     at: [l_txt_x, ref_y.call(y0)],
                     width: txt_w,
                     height: 16,
                     size: 12,
                     overflow: :shrink_to_fit
      end

      begin
        pdf.font('Lexend', style: :extra_bold)
      rescue StandardError
        nil
      end
      pdf.fill_color brand_blue
      right_card_title = @locale == :es ? 'Información General' : 'General Information'
      pdf.text_box right_card_title,
                   at: [r_txt_x, ref_y.call(420.0 + card_top_gap)],
                   width: txt_w,
                   height: 20,
                   size: 16,
                   overflow: :shrink_to_fit

      begin
        pdf.font('Lexend')
      rescue StandardError
        nil
      end

      type_label    = type_text.to_s.strip.capitalize
      listing_label = listing_text.to_s.strip.capitalize
      meta_parts    = [type_label, listing_label].reject(&:empty?)
      unless meta_parts.empty?
        pdf.fill_color brand_blue
        pdf.text_box meta_parts.join('  ·  '),
                     at: [r_txt_x, ref_y.call(454.57 + card_top_gap)],
                     width: txt_w,
                     height: 14,
                     size: 12,
                     overflow: :shrink_to_fit,
                     single_line: true
      end

      begin
        pdf.font('Lexend')
      rescue StandardError
        nil
      end
      pdf.fill_color text_gray
      price_text = "#{format_price(@property.price)} MXN"
      pdf.text_box price_text,
                   at: [r_txt_x, ref_y.call(468.82 + card_top_gap)],
                   width: txt_w,
                   height: 30.0,
                   size: 12,
                   overflow: :shrink_to_fit

      begin
        pdf.font('Lexend')
      rescue StandardError
        nil
      end
      pdf.fill_color brand_blue

      addr_line_h = 16.0
      addr_y0     = 501.69 + card_top_gap

      [
        @property.address.presence,
        @property.neighborhood.presence,
        [@property.city, @property.state].compact.join(', ').presence
      ].compact.each_with_index do |line, i|
        pdf.text_box line,
                     at: [r_txt_x, ref_y.call(addr_y0 + i * addr_line_h)],
                     width: txt_w,
                     height: addr_line_h,
                     size: 12,
                     overflow: :shrink_to_fit
      end

      pdf.fill_color '000000'

      if @property.property_features.any?
        feat_y_top   = 408.5099792480469 + card_top_gap + col_h + 15.0
        feat_full_w  = right_box_x + col_w - col_pad - l_txt_x
        feat_line_h  = 16.0

        begin
          pdf.font('Lexend', style: :extra_bold)
        rescue StandardError
          nil
        end
        pdf.fill_color brand_blue
        features_label = @locale == :es ? 'Características' : 'Features'
        pdf.text_box features_label,
                     at: [l_txt_x, ref_y.call(feat_y_top)],
                     width: feat_full_w,
                     height: 20,
                     size: 16,
                     overflow: :shrink_to_fit

        begin
          pdf.font('Lexend')
        rescue StandardError
          nil
        end

        feature_names = @property.property_features.map do |f|
          (@locale == :es ? f.es_name : f.name).to_s.strip
        end.reject(&:blank?)

        feature_names.first(4).each_with_index do |name, i|
          pdf.fill_color text_gray
          pdf.text_box name,
                       at: [l_txt_x, ref_y.call(feat_y_top + 22.0 + i * feat_line_h)],
                       width: feat_full_w,
                       height: feat_line_h,
                       size: 12,
                       overflow: :shrink_to_fit
        end
      end

      pdf.fill_color '000000'

      if @display_properlia_info
        pdf.canvas do
          pdf.fill_color footer_blue
          pdf.fill_rectangle [-5.4219255447387695, ref_y.call(750.4647827148438)],
                             (617.3419189453125 - -5.4219255447387695),
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
          begin
            pdf.font('Lexend')
          rescue StandardError
            nil
          end
        end
        raw_phone = @general_info&.phone.to_s.gsub(/\D/, '').presence || '2222559549'
        phone = if raw_phone.length == 10
                  "(#{raw_phone[0..2]}) #{raw_phone[3..5]} #{raw_phone[6..7]} #{raw_phone[8..9]}"
                else
                  @general_info&.phone.to_s.presence || '(222) 255 95 49'
                end
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
    end

    def add_cover_page(pdf, color: '27AE60')
      pdf.go_to_page(1) if pdf.page_count > 0
      add_residential_template_cover(pdf)
    end

    private

    def cover_image_for_attachment(pdf_width:, pdf_height:, attachment:)
      w = pdf_width.round
      h = pdf_height.round

      blob = attachment.blob
      image =
        if attachment.service.name == :local
          image_path = ActiveStorage::Blob.service.path_for(blob.key)
          return nil unless File.exist?(image_path)

          MiniMagick::Image.open(image_path)
        else
          io = URI.open(attachment.url)
          MiniMagick::Image.read(io)
        end

      image.auto_orient

      img_ratio = image.width.to_f / image.height
      box_ratio = w.to_f / h

      if img_ratio > box_ratio
        image.resize "x#{h}"
        excess_width = image.width - w
        image.crop "#{w}x#{h}+#{(excess_width / 2.0).round}+0"
      else
        image.resize "#{w}x"
        excess_height = image.height - h
        image.crop "#{w}x#{h}+0+#{(excess_height / 2.0).round}"
      end

      temp = Tempfile.new(['hero-cover', '.jpg'])
      image.format 'jpg'
      image.write(temp.path)
      temp
    end
  end
end
