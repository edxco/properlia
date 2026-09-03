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
      resources :properties, only: %i[index show create update destroy] do
        member do
          delete 'attachments/:attachment_id', to: 'properties#delete_attachment', as: 'delete_attachment'
          put 'reorder_images', to: 'properties#reorder_images'
        end

        collection do
          # Machine-to-machine intake from the Google Apps Script pipeline.
          # Auth: Authorization: Bearer <PROPERTY_INTAKE_TOKEN>, not a user session.
          post 'intake', to: 'properties#intake'
        end

        # PDF generation routes
        get 'pdf', to: 'pdfs#show', as: 'pdf'
        post 'pdf/email', to: 'pdfs#email', as: 'email_pdf'
      end

      resources :property_types
      resources :property_features, only: %i[index create destroy]
      resources :statuses
      resources :listing_types
      resources :states
      resources :cities

      resources :leads, only: %i[index show create update] do
        collection do
          post 'public', to: 'leads#public_create'
        end
        member do
          post 'change_status'
          post 'assign'
          post 'record_contact'
        end
        resources :events, controller: 'lead_events', only: %i[index show create]
      end

      # General info endpoint
      get 'general_info', to: 'general_infos#show'
      put 'general_info', to: 'general_infos#update'

      # Email endpoints
      post 'emails/contact', to: 'emails#send_contact_form'
      post 'emails/property-inquiry', to: 'emails#send_property_inquiry'
      post 'emails/welcome', to: 'emails#send_welcome'

      # Admin endpoints
      namespace :admin do
        resources :users, only: %i[index show create update] do
          member do
            patch 'disable'
          end
        end
      end
    end
  end
end
