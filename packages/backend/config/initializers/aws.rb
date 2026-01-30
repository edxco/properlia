# frozen_string_literal: true

require 'aws-sdk-s3'

# Configure AWS SDK to auto-refresh credentials from EC2 instance metadata.
# This ensures temporary credentials are refreshed before they expire.
#
# IMPORTANT: For Docker containers, set EC2 metadata hop limit to 2:
# AWS Console → EC2 → Instance → Actions → Modify instance metadata options → Hop limit: 2

if Rails.env.production? || Rails.env.staging?
  Aws.config.update({
    region: ENV.fetch('AWS_REGION', 'us-east-1'),
    credentials: Aws::InstanceProfileCredentials.new(
      retries: 5,
      http_open_timeout: 5,
      http_read_timeout: 5
    )
  })
end
