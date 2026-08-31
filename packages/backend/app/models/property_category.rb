class PropertyCategory < ApplicationRecord
  # Associations
  has_and_belongs_to_many :property_types,
                          join_table: :property_categories_property_types

  # Direct many-to-many with properties (user-selected categories per listing)
  has_and_belongs_to_many :properties,
                          join_table: :properties_property_categories

  # Validations
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :es_name, presence: true, uniqueness: { case_sensitive: false }
  validates :slug, presence: true, uniqueness: true
end