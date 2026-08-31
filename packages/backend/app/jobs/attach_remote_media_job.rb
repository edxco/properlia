# Downloads media from the URLs the Google Apps Script intake pipeline hands
# over (Drive files shared "anyone with the link"), attaches them to the
# property via ActiveStorage, then runs the same compression pass used for
# normal uploads. Kept separate from ProcessPropertyImagesJob because it also
# has to fetch bytes over HTTP first, and because video attachments should
# never go through ImageCompressor.
class AttachRemoteMediaJob < ApplicationJob
  queue_as :default

  # Only fetch from hosts we expect the intake payload to reference.
  ALLOWED_HOSTS = %w[drive.google.com].freeze
  MAX_BYTES = 200.megabytes

  def perform(property_id, photo_urls = [], video_urls = [])
    property = Property.find_by(id: property_id)
    return unless property

    Array(photo_urls).each { |url| attach_remote_file(property, url, :images) }
    Array(video_urls).each { |url| attach_remote_file(property, url, :videos) }

    property.images.each { |attachment| ImageCompressor.call(attachment) }
  end

  private

  def attach_remote_file(property, url, association)
    uri = URI.parse(url)
    raise "Refusing to fetch untrusted host: #{uri.host}" unless ALLOWED_HOSTS.include?(uri.host)

    response = fetch_with_redirects(uri)
    return unless response.is_a?(Net::HTTPSuccess)

    body = response.body
    return if body.bytesize > MAX_BYTES

    filename = filename_from(response, uri)
    content_type = response['content-type'].presence || 'application/octet-stream'

    property.public_send(association).attach(
      io: StringIO.new(body),
      filename: filename,
      content_type: content_type
    )
  rescue StandardError => e
    Rails.logger.error "AttachRemoteMediaJob failed for #{url}: #{e.message}"
  end

  def fetch_with_redirects(uri, limit = 5)
    raise 'Too many redirects' if limit.zero?

    response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(Net::HTTP::Get.new(uri))
    end

    case response
    when Net::HTTPRedirection
      fetch_with_redirects(URI.parse(response['location']), limit - 1)
    else
      response
    end
  end

  def filename_from(response, uri)
    disposition = response['content-disposition']
    match = disposition&.match(/filename="?([^";]+)"?/)
    return match[1] if match

    File.basename(uri.path).presence || "upload-#{SecureRandom.hex(4)}"
  end
end
