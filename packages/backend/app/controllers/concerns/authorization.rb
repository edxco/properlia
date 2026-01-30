module Authorization
  extend ActiveSupport::Concern

  private

  def authorize_any!(*roles)
    return if current_user && roles.map(&:to_s).include?(current_user.role)

    render json: { error: 'Forbidden' }, status: :forbidden
  end
end
