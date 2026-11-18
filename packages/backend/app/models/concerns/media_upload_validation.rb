# frozen_string_literal: true

# Rejects invalid uploads at save time, before Active Storage uploads anything.
module MediaUploadValidation
  extend ActiveSupport::Concern

  class_methods do
    def validates_media_upload(name, kind:, max_files: nil)
      validate do
        change = attachment_changes[name.to_s]
        next unless change.respond_to?(:attachables)

        MediaUploadValidator.errors_for(change.attachables, kind: kind, max_files: max_files)
                            .each { |message| errors.add(name, message) }
      end
    end
  end
end
