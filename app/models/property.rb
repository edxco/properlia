class Property < ApplicationRecord
  
  has_many_attached :images
  has_many_attached :videos

  validates :title, :address, :price, presence: true
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
