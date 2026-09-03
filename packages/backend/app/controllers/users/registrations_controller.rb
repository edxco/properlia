class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)
    resource.save
    if resource.save
      render_success(
        data: resource.as_json(only: %i[id email]),
        message: 'Registro exitoso',
        status: :created
      )
    else
      render_error(
        errors: resource.errors.full_messages,
        message: 'Validación fallida'
      )
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

  # role se excluye a propósito: el auto-registro/edición de perfil nunca debe
  # permitir que el propio usuario se asigne un rol (p. ej. "admin"). Los roles
  # se asignan vía Api::V1::Admin::UsersController.
  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end

  def account_update_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name)
  end
end
