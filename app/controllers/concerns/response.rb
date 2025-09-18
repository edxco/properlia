module Response
  extend ActiveSupport::Concern

  def render_success(data: {}, message: nil, status: :ok)
    render json: {
      success: true,
      message: message,
      data: data
    }, status: status
  end

  def render_error(errors: [], message: nil, status: :unprocessable_entity)
    render json: {
      success: false,
      message: message,
      errors: Array(errors)
    }, status: status
  end
  
end
