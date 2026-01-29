# frozen_string_literal: true

module Pdf
  module DisplayImageCover
    def display_image_cover(pdf, attachment, width:, height:)
      return unless attachment.present?

      blob = attachment.blob
      return unless blob
      return unless blob.content_type&.start_with?('image/')

      temp = Tempfile.new(['prawn-cover', '.jpg'])

      begin
        image =
          if attachment.service.name == :local
            image_path = ActiveStorage::Blob.service.path_for(blob.key)
            return unless File.exist?(image_path)

            MiniMagick::Image.open(image_path)
          else
            io = URI.open(attachment.url)
            MiniMagick::Image.read(io)
          end

        image.auto_orient

        w = width.round
        h = height.round

        img_ratio = image.width.to_f / image.height
        box_ratio = w.to_f / h

        if img_ratio > box_ratio
          image.resize "x#{h}"
          x = ((image.width - w) / 2.0).round
          image.crop "#{w}x#{h}+#{x}+0"
        else
          image.resize "#{w}x"
          y = ((image.height - h) / 2.0).round
          image.crop "#{w}x#{h}+0+#{y}"
        end

        image.format 'jpg'
        image.write(temp.path)

        pdf.image temp.path, at: [0, h], width: w, height: h
      rescue StandardError => e
        Rails.logger.error "Failed to render cover image: #{e.message}\n#{e.backtrace.first(3).join("\n")}"
      ensure
        temp.close
        temp.unlink
      end
    end
  end
end
