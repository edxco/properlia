# frozen_string_literal: true

module Pdf
  module FeaturesHelper
    def add_commercial_features_box(pdf)
      features = []
      features << "#{@property.built_area} #{@t[:sqm]} #{@t[:built_area]}" if @property.built_area.present?
      features << "#{@property.land_area} #{@t[:sqm]} #{@t[:land_area]}" if @property.land_area.present?
      features << "#{@property.parking_spaces} #{@t[:parking_spaces]}" if @property.parking_spaces > 0

      return if features.empty?

      pdf.stroke_bounds do
        pdf.fill_color 'EBF5FB'
        pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 60
        pdf.fill_color '000000'

        pdf.pad(15) do
          pdf.text features.join(' • '), size: 12, align: :center, style: :bold
        end
      end
    end

    def add_industrial_features_box(pdf)
      features = []
      features << "#{@property.built_area} #{@t[:sqm]} #{@t[:built_area]}" if @property.built_area.present?
      features << "#{@property.land_area} #{@t[:sqm]} #{@t[:land_area]}" if @property.land_area.present?
      features << "#{@property.parking_spaces} #{@t[:parking_spaces]}" if @property.parking_spaces > 0

      return if features.empty?

      pdf.stroke_bounds do
        pdf.fill_color 'FADBD8'
        pdf.fill_rectangle [pdf.bounds.left, pdf.bounds.top], pdf.bounds.width, 60
        pdf.fill_color '000000'

        pdf.pad(15) do
          pdf.text features.join(' • '), size: 12, align: :center, style: :bold
        end
      end
    end
  end
end
