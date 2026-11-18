# frozen_string_literal: true

# No client uses direct uploads; files only arrive through authenticated multipart requests.
Rails.application.config.to_prepare do
  ActiveStorage::DirectUploadsController.before_action { head :not_found }
end
