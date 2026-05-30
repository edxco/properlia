# frozen_string_literal: true

module Pdf
  module ImagesHelper
    def add_images_section(pdf, max_images: 10)
      return unless @property.images.attached?

      images = if @property.image_order.present?
        order = @property.image_order.map(&:to_s)
        ordered = order.filter_map { |id| @property.images.find { |img| img.id.to_s == id } }
        unordered = @property.images.reject { |img| order.include?(img.id.to_s) }
        (ordered + unordered).drop(1).first(max_images)
      else
        @property.images.drop(1).first(max_images)
      end
      return if images.empty?

      box_w = pdf.bounds.width

      images.each_with_index do |attachment, idx|
        pdf.start_new_page(margin: 40) if idx > 0
        display_image_fit(pdf, attachment, width: box_w)
      end
    end
  end
end
