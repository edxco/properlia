class ApplicationController < ActionController::API
  include Response
  include Authorization
  include Pagy::Backend
  include Pagy::Frontend

  before_action :authenticate_user!
  before_action :reject_disabled_user!

  private

  def reject_disabled_user!
    return unless current_user && !current_user.enabled?

    render json: { error: 'Account disabled' }, status: :forbidden
  end
end