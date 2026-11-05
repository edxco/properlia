require 'net/http'

class RevalidateFrontendCacheJob < ApplicationJob
  queue_as :default

  def perform(tag = 'properties')
    base_url = ENV['FRONTEND_INTERNAL_URL']
    secret = ENV['REVALIDATE_SECRET']
    return if base_url.blank? || secret.blank?

    uri = URI.join(base_url, '/api/revalidate')
    request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json', 'x-revalidate-secret' => secret)
    request.body = { tag: tag }.to_json

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 3, read_timeout: 3) do |http|
      http.request(request)
    end
    Rails.logger.warn("[RevalidateFrontendCache] #{response.code} for tag #{tag}") unless response.is_a?(Net::HTTPSuccess)
  rescue StandardError => e
    Rails.logger.warn("[RevalidateFrontendCache] #{e.class}: #{e.message}")
  end
end
