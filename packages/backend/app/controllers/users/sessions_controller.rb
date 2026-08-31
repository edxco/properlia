class Users::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    render_success(
      data: resource.as_json(only: %i[id email name role]),
      message: 'Inicio de sesión exitoso'
    )
  end

  def respond_to_on_destroy
    render_success(message: 'Sesión cerrada')
  end
end
