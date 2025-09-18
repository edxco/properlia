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

  # Ejemplo de endpoint protegido
  namespace :v1 do
    resources :properties, only: [:index]  # ejemplo
  end
end

end
