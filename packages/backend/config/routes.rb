Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Health check endpoint
  get "/health", to: proc { [200, { "Content-Type" => "application/json" }, [{ status: "ok" }.to_json]] }

  # Devise routes for user authentication
  devise_for :users,
    defaults: { format: :json },
    controllers: {
      sessions: 'users/sessions',
      registrations: 'users/registrations'
    }

  # Current user endpoint
  get '/users/current', to: 'users#current'

  # API routes
  namespace :api do
    namespace :v1 do
      resources :properties, only: %i[index show create update] do
        member do
          delete 'attachments/:attachment_id', to: 'properties#delete_attachment', as: 'delete_attachment'
        end
      end

      resources :property_types
      resources :statuses

      # General info endpoint
      get 'general_info', to: 'general_infos#show'
      put 'general_info', to: 'general_infos#update'

      # Email endpoints
      post 'emails/contact', to: 'emails#send_contact_form'
      post 'emails/property-inquiry', to: 'emails#send_property_inquiry'
      post 'emails/welcome', to: 'emails#send_welcome'
    end
  end
end
