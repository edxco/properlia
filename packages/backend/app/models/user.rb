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
  before_validation :set_default_role, on: :create

  private

  def set_jti
    self.jti ||= SecureRandom.uuid
  end

  # Self-service signup/profile updates never submit a role (see
  # Users::RegistrationsController), so new users default to the
  # least-privileged role. Staff/admin accounts are created explicitly via
  # Api::V1::Admin::UsersController.
  def set_default_role
    self.role ||= 'user'
  end
end
