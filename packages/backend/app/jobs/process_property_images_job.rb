class ProcessPropertyImagesJob < ApplicationJob
  queue_as :default

  def perform(property_id)
    property = Property.find_by(id: property_id)
    return unless property

    property.images.each { |attachment| ImageCompressor.call(attachment) }
  end
end
