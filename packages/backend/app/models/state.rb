class State < ApplicationRecord
  has_many :cities, dependent: :restrict_with_error
  has_many :properties, dependent: :restrict_with_error
  has_many :leads, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true
  validates :es_name, presence: true, uniqueness: true
end
