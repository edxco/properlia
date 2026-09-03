class ProcessPropertyImagesJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: :polynomially_longer, attempts: 5 do |job, error|
    Rails.logger.error "ProcessPropertyImagesJob giving up for property #{job.arguments.first}: #{error.message}"
  end

  def perform(property_id, attachment_ids)
    property = Property.find_by(id: property_id)
    return unless property

    failed_ids = []

    property.images.where(id: attachment_ids).each do |attachment|
      ImageCompressor.call(attachment)
    rescue StandardError
      failed_ids << attachment.id
    end

    raise "Failed to compress attachments: #{failed_ids.join(', ')}" if failed_ids.any?
  end
end
