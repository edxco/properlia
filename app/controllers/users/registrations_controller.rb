class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json


  def create
    build_resource(sign_up_params)
    resource.save
    if resource.persisted?
      render json: { message: 'Registro exitoso', user: resource }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def sign_up(_resource_name, _resource); end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: { message: 'Registro exitoso', user: resource }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # Permitir campos extra si agregaste name/role
  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :role)
  end

  def account_update_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :role)
  end
end
