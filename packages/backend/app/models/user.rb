class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  # Módulos de Devise que quieras usar
  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  enum role: {
    user: 'user',
    staff: 'staff',
    admin: 'admin'
  }

  validates :role, presence: true, inclusion: { in: roles.keys }
  
  # before_create :set_jti
  before_validation :set_jti, on: :create

  private

  def set_jti
    self.jti ||= SecureRandom.uuid
  end
end
