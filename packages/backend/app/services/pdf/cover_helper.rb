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
          attachment = @property.images.first

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

      pdf.text_box @property.title.to_s.strip,
                   at: [badge_right_edge - title_box_w, ref_y.call(334.0053405761719)],
                   width: title_box_w,
                   height: 52.5,
                   size: 42,
                   align: :center,
                   overflow: :shrink_to_fit

      pdf.fill_color '000000'

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

      pdf.canvas do
        pdf.fill_color bg_gray
        pdf.fill_rectangle [0, ref_y.call(408.5099792480469)], 611.7783813476562, (750.4647216796875 - 408.5099792480469)
        pdf.fill_color '000000'
      end

      fmt_int = ->(v) { number_with_delimiter(v.to_i, delimiter: ',') }
      area_str = ->(v) { v.present? ? "#{fmt_int.call(v)}m2" : nil }

      land_area  = area_str.call(@property.land_area)
      built_area = area_str.call(@property.built_area)

      begin
        pdf.font('Lexend', style: :extra_bold)
      rescue StandardError
        nil
      end
      pdf.fill_color brand_blue
      pdf.text_box @t[:title],
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
        [518.6322631835938,
         (@property.parking_spaces.to_i > 0 ? "#{@property.parking_spaces.to_i} #{@t[:parking_spaces]}:" : nil)],
        [535.1322631835938, (@property.bathrooms.to_i > 0 ? "#{@property.bathrooms.to_i} #{@t[:bathrooms]}:" : nil)],
        [551.6322631835938,
         (@property.half_bathrooms.to_i > 0 ? "#{@property.half_bathrooms.to_i} #{@t[:half_bathrooms]}:" : nil)]
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
                   size: 34,
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

      # Property Features section
      if @property.property_features.any?
        begin
          pdf.font('Lexend', style: :extra_bold)
        rescue StandardError
          nil
        end
        pdf.fill_color brand_blue
        features_label = @locale == :es ? 'Características' : 'Features'
        pdf.text_box features_label,
                     at: [41.67942810058594, ref_y.call(580)],
                     width: 200,
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

        # Display features in columns (2 columns)
        feature_names.each_slice(2).with_index do |pair, idx|
          y_pos = 605 + (idx * 18)
          break if y_pos > 720 # Don't overflow into footer

          pdf.fill_color text_gray
          pdf.text_box "• #{pair[0]}",
                       at: [41.67942810058594, ref_y.call(y_pos)],
                       width: 250,
                       height: 16,
                       size: 11,
                       overflow: :shrink_to_fit

          if pair[1]
            pdf.text_box "• #{pair[1]}",
                         at: [300, ref_y.call(y_pos)],
                         width: 250,
                         height: 16,
                         size: 11,
                         overflow: :shrink_to_fit
          end
        end
      end

      pdf.fill_color '000000'

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
