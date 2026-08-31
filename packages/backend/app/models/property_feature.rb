class PropertyFeature < ApplicationRecord
  has_and_belongs_to_many :properties,
                          join_table: :properties_property_features

  before_validation :normalize_slug

  validates :name, presence: true, uniqueness: true
  validates :es_name, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true

  private

  def normalize_slug
    return if slug.blank?

    self.slug = slug.downcase.strip.gsub(/\s+/, '-').gsub(/[^a-z0-9\-]/, '')
  end
end
