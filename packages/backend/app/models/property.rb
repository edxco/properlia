class Property < ApplicationRecord
  # Associations
  belongs_to :property_type
  belongs_to :status
  belongs_to :listing_type
  has_many_attached :images
  has_many_attached :videos

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
