class City < ApplicationRecord
  belongs_to :state
  has_many :properties, dependent: :restrict_with_error
  has_many :leads, dependent: :restrict_with_error

  before_validation :assign_code, on: :create
  before_validation { self.code = code.strip.upcase if code.present? }

  validates :name, presence: true, uniqueness: { scope: :state_id }
  validates :es_name, presence: true, uniqueness: { scope: :state_id }
  validates :code, presence: true, uniqueness: true, format: { with: /\A[A-Z0-9]{3}\z/ }

  private

  def assign_code
    self.code = code.to_s.strip.upcase.presence || CityCodeGenerator.generate(es_name.presence || name)
  end
end
