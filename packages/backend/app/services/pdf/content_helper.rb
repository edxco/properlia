# frozen_string_literal: true

module Pdf
  module ContentHelper
    def add_location_section(pdf)
      pdf.text "#{@t[:address]}", size: 14, style: :bold
      pdf.move_down 5

      location_parts = []
      location_parts << sanitize_for_pdf(@property.address) if @property.address.present?
      location_parts << sanitize_for_pdf(@property.neighborhood) if @property.neighborhood.present?
      location_parts << sanitize_for_pdf(@property.city) if @property.city.present?
      location_parts << sanitize_for_pdf(@property.state) if @property.state.present?
      location_parts << sanitize_for_pdf(@property.zip_code) if @property.zip_code.present?

      pdf.text location_parts.join(', '), size: 10
    end

    def add_property_details_table(pdf)
      data = []

      pdf.move_down 15

      data << [@t[:property_type], @property.property_type.name] if @property.property_type
      data << [@t[:listing_type], @property.listing_type.name] if @property.listing_type
      data << [@t[:status], @property.status.name] if @property.status
      data << [@t[:exclusive], @property.exclusive_listing ? @t[:yes] : @t[:no]]
      data << [@t[:featured], @property.featured ? @t[:yes] : @t[:no]] if @property.featured

      return if data.empty?

      pdf.table(data, width: pdf.bounds.width, cell_style: { padding: 8 }) do
        cells.border_width = 0.5
        columns(0).font_style = :bold
        columns(0).background_color = 'F8F9FA'
      end
    end
  end
end
