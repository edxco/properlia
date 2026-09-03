class City < ApplicationRecord
  belongs_to :state
  has_many :properties, dependent: :restrict_with_error
  has_many :leads, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: { scope: :state_id }
  validates :es_name, presence: true, uniqueness: { scope: :state_id }
end
