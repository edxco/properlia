class ProcessLeadImagesJob < ApplicationJob
  queue_as :default

  def perform(lead_id)
    lead = Lead.find_by(id: lead_id)
    return unless lead

    lead.images.each { |attachment| ImageCompressor.call(attachment) }
  end
end
