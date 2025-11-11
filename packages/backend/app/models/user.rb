class User < ApplicationRecord
  # Módulos de Devise que quieras usar
  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  include Devise::JWT::RevocationStrategies::JTIMatcher

  before_create :set_jti

  private
  def set_jti
    self.jti ||= SecureRandom.uuid
  end
end
