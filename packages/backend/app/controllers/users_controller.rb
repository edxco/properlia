class UsersController < ApplicationController
  before_action :authenticate_user!

  def current
    render_success(
      data: current_user.as_json(only: %i[id email name role])
    )
  end
end
