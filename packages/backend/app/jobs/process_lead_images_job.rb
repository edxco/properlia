class ProcessLeadImagesJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: :polynomially_longer, attempts: 5 do |job, error|
    Rails.logger.error "ProcessLeadImagesJob giving up for lead #{job.arguments.first}: #{error.message}"
  end

  def perform(lead_id, attachment_ids)
    lead = Lead.find_by(id: lead_id)
    return unless lead

    failed_ids = []

    lead.images.where(id: attachment_ids).each do |attachment|
      ImageCompressor.call(attachment)
    rescue StandardError
      failed_ids << attachment.id
    end

    raise "Failed to compress attachments: #{failed_ids.join(', ')}" if failed_ids.any?
  end
end
