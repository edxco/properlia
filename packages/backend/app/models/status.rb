class Status < ApplicationRecord
  ON_HOLD = 'on-hold'.freeze
  SOLD = 'sold'.freeze

  # Associations
  has_many :properties

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :es_name, presence: true, uniqueness: true

  def self.on_hold
    find_by!(name: ON_HOLD)
  end

  def self.sold
    find_by!(name: SOLD)
  end
end
