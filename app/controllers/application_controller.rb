class ApplicationController < ActionController::API
  include Response
  include Pagy::Backend

  before_action :authenticate_user!
end