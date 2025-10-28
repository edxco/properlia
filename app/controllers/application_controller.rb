class ApplicationController < ActionController::API
  include Response
  include Pagy::Backend
  include Pagy::Frontend

  before_action :authenticate_user!
end