class Property < ApplicationRecord
  # Associations
  belongs_to :property_type
  belongs_to :status
  belongs_to :listing_type
  has_many_attached :images
  has_many_attached :videos
  has_many :leads, dependent: :nullify

  # Direct many-to-many relationship with categories
  # Users select which categories apply when creating a listing
  # (e.g., Land can be residential, commercial, industrial, or any combination)
  has_and_belongs_to_many :property_categories,
                          join_table: :properties_property_categories

  has_and_belongs_to_many :property_features,
                          join_table: :properties_property_features

  # Scope to find properties by category (uses the direct association)
  scope :by_category, ->(category_id) {
    joins(:property_categories)
      .where(property_categories: { id: category_id })
      .distinct
  }

  scope :by_category_slug, ->(slug) {
    joins(:property_categories)
      .where(property_categories: { slug: slug })
      .distinct
  }

  # Get available categories for this property's type
  # Useful for forms to show which categories the user can select
  def available_categories
    property_type&.property_categories || PropertyCategory.none
  end

  # Validations
  validates :title, :address, :price, :property_type, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }

  validate :acceptable_attachments

  def acceptable_attachments
    images.each do |img|
      errors.add(:images, "must be an image") unless img.content_type.start_with?("image/")
    end
    videos.each do |vid|
      errors.add(:videos, "must be a video") unless vid.content_type.start_with?("video/")
    end
  end
end
