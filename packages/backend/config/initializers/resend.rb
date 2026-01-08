# Resend configuration
# API key should be set via RESEND_API_KEY environment variable

if ENV['RESEND_API_KEY'].present?
  Resend.api_key = ENV['RESEND_API_KEY']
  Rails.logger.info "Resend initialized with API key"
else
  Rails.logger.warn "RESEND_API_KEY environment variable not set. Email functionality will not work."
end
