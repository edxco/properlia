# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # allow do
  #   origins '*' # cámbialo a tu dominio en prod
  #   resource '*',
  #     headers: :any,
  #     expose: ['Authorization'],
  #     methods: %i[get post put patch delete options head]
  # end
  allow do
    # Local dev frontend
    origins "http://localhost:5173", "http://localhost:3001"

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: true

    resource "/rails/active_storage/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: ["Content-Disposition"]  # so browsers can read filename
  end

  allow do
    # Stage frontend(s)
    origins "https://app-stage.properlia.com"

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: true

    resource "/rails/active_storage/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: ["Content-Disposition"]
  end
end

