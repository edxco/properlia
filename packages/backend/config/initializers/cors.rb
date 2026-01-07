# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # Local development origins
  local_origins = ["http://localhost:5173", "http://localhost:3001", "http://localhost:3002"]

  # Environment-specific origins from CORS_ORIGINS env var
  # Supports comma-separated list: "https://app.com,http://1.2.3.4:3001,http://1.2.3.4:3002"
  env_origins = ENV["CORS_ORIGINS"]&.split(",")&.map(&:strip) || []

  # Combine all allowed origins
  allowed_origins = (local_origins + env_origins).uniq

  allow do
    origins allowed_origins

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: true,
      expose: ["Authorization"]

    resource "/users/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: true,
      expose: ["Authorization"]

    resource "/rails/active_storage/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: ["Content-Disposition"]  # so browsers can read filename
  end
end

