# frozen_string_literal: true

module Pdf
  module ImagesHelper
    def add_images_section(pdf, max_images: 10)
      return unless @property.images.attached?

      images = @property.images.drop(1).first(max_images)
      return if images.empty?

      per_page = 2

      page_w = pdf.bounds.width
      page_h = pdf.bounds.height

      box_w = (page_w * 0.80).floor
      x     = (page_w - box_w) / 2.0

      gap_y = 12

      footer_safe_h = 70
      top_safe_h    = 80

      images.each_slice(per_page).with_index do |pair, idx|
        pdf.start_new_page(margin: 40) if idx > 0

        top_y    = pdf.bounds.top - top_safe_h
        bottom_y = footer_safe_h

        available_h = top_y - bottom_y
        max_box_h   = ((available_h - gap_y) / 2.0).floor

        target_box_h = (page_h * 0.40).floor
        box_h = [target_box_h, max_box_h].min

        y1 = top_y
        y2 = top_y - box_h - gap_y

        pdf.bounding_box([x, y1], width: box_w, height: box_h) do
          display_image_cover(pdf, pair[0], width: box_w, height: box_h)
        end

        if pair[1]
          pdf.bounding_box([x, y2], width: box_w, height: box_h) do
            display_image_cover(pdf, pair[1], width: box_w, height: box_h)
          end
        end
      end
    end
  end
end
