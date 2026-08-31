class PropertyType < ApplicationRecord
  # Associations
  has_and_belongs_to_many :property_categories,
                          join_table: :property_categories_property_types
  has_many :properties, dependent: :restrict_with_error
  has_many :leads, dependent: :nullify

  # Validations
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :es_name, presence: true, uniqueness: { case_sensitive: false }

  # Callbacks
  before_save :downcase_names

  private

  def downcase_names
    self.name = name.downcase.strip if name.present?
    self.es_name = es_name.downcase.strip if es_name.present?
  end
end
