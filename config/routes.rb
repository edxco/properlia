Rails.application.routes.draw do
  # devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  Rails.application.routes.draw do
  get "/health", to: proc { [200, { "Content-Type" => "application/json" }, [{ status: "ok" }.to_json]] }
  devise_for :users,
    defaults: { format: :json },
    controllers: {
      sessions: 'users/sessions',
      registrations: 'users/registrations'
    }

   namespace :api do
    namespace :v1 do
      resources :properties, only: %i[index show create update] do
        member do
          delete 'attachments/:attachment_id', to: 'properties#delete_attachment', as: 'delete_attachment'
        end
      end
    end
  end
end

end
