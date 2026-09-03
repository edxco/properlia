class ImageCompressor
  MAX_DIMENSION = 2000
  QUALITY = 85

  def self.call(attachment)
    new(attachment).call
  end

  def initialize(attachment)
    @attachment = attachment
  end

  def call
    return unless @attachment.content_type.start_with?("image/")
    return if @attachment.blob.metadata["compressed"]

    @attachment.blob.open do |tmp|
      processed = ImageProcessing::Vips
        .source(tmp)
        .resize_to_limit(MAX_DIMENSION, MAX_DIMENSION)
        .convert("jpeg")
        .saver(quality: QUALITY)
        .call

      new_blob = ActiveStorage::Blob.create_and_upload!(
        io: processed,
        filename: "#{@attachment.filename.base}.jpg",
        content_type: "image/jpeg",
        metadata: { compressed: true }
      )

      old_blob = @attachment.blob
      @attachment.update!(blob: new_blob)
      old_blob.purge
    end
  rescue StandardError => e
    Rails.logger.error "ImageCompressor failed for attachment #{@attachment.id}: #{e.message}"
    raise
  end
end
