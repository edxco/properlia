class PropertyType < ApplicationRecord
  # Validations
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :es_name, presence: true, uniqueness: { case_sensitive: false }

  # Associations
  has_many :properties, dependent: :restrict_with_error

  # Callbacks
  before_save :downcase_names

  private

  def downcase_names
    self.name = name.downcase.strip if name.present?
    self.es_name = es_name.downcase.strip if es_name.present?
  end
end
