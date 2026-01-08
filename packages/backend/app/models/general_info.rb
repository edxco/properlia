# frozen_string_literal: true

# GeneralInfo is a singleton model that stores contact information
# used throughout the application, such as phone, WhatsApp, and email.
# Only one record should exist in this table, enforced by the unique
# index on singleton_guard column.
class GeneralInfo < ApplicationRecord
  # Validations
  validates :phone, presence: true
  validates :whatsapp, presence: true
  validates :email_to, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :singleton_guard, inclusion: { in: [0] }

  # Class method to get the singleton instance
  def self.instance
    first_or_create!(singleton_guard: 0)
  end

  # Class method to safely update the singleton instance
  def self.update_instance(attributes)
    instance&.update!(attributes)
  end

  # Prevent changing singleton_guard value
  before_validation :ensure_singleton_guard

  private

  def ensure_singleton_guard
    self.singleton_guard = 0
  end
end
