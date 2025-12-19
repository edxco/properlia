class Status < ApplicationRecord
  # Associations
  has_many :properties

  # Validations
  validates :name, presence: true, uniqueness: true
  validates :es_name, presence: true, uniqueness: true
end
