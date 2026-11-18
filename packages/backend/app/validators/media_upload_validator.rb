# frozen_string_literal: true

# Validates media by content (first bytes via Marcel), size and file count.
# Models run it before anything is uploaded; AttachRemoteMediaJob runs it before attach.
class MediaUploadValidator
  IMAGE_TYPES = %w[image/jpeg image/png image/webp].freeze
  VIDEO_TYPES = %w[video/mp4 video/quicktime].freeze

  RULES = {
    images: { types: IMAGE_TYPES, max_bytes: 10.megabytes, max_files: 60 },
    videos: { types: VIDEO_TYPES, max_bytes: 200.megabytes, max_files: 5 }
  }.freeze

  class << self
    def errors_for(attachables, kind:, existing: 0, max_files: nil)
      rule = RULES.fetch(kind)
      items = Array.wrap(attachables).flatten.compact
      limit = max_files || rule[:max_files]

      errors = []
      errors << "too many #{kind} (maximum #{limit})" if items.size + existing > limit

      items.each_with_index do |item, index|
        next if item.is_a?(ActiveStorage::Blob) || item.is_a?(ActiveStorage::Attachment)

        message = problem_with(item, rule)
        errors << "#{kind} ##{index + 1}: #{message}" if message
      end
      errors
    end

    def detect(io)
      io.rewind
      Marcel::MimeType.for(io)
    ensure
      io.rewind
    end

    private

    def problem_with(item, rule)
      io, size = io_and_size(item)
      return 'is not an uploaded file' unless io
      return 'is empty' if size.to_i.zero?
      return "is larger than #{rule[:max_bytes] / 1.megabyte} MB" if size > rule[:max_bytes]

      detected = detect(io)
      return nil if rule[:types].include?(detected)

      "has unsupported content (#{detected})"
    end

    def io_and_size(item)
      io = if item.respond_to?(:tempfile)
             item.tempfile
           elsif item.is_a?(Hash)
             item[:io] || item['io']
           end
      return [nil, nil] unless io.respond_to?(:read) && io.respond_to?(:rewind)

      [io, io.respond_to?(:size) ? io.size : nil]
    end
  end
end
