class PropertyType < ApplicationRecord
  SEGMENTS = {
    residential: ['house', 'department'],
    commercial: ['retail space', 'doctor office', 'office'],
    industrial: ['warehouse'],
    land: ['land']
  }.freeze

  CODE_LETTERS = { residential: 'R', commercial: 'C', industrial: 'I', land: 'T' }.freeze

  def self.segment_for(type_name)
    SEGMENTS.find { |_, names| names.include?(type_name) }&.first || :residential
  end

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

  def segment
    self.class.segment_for(name)
  end

  def code_letter
    CODE_LETTERS.fetch(segment)
  end

  private

  def downcase_names
    self.name = name.downcase.strip if name.present?
    self.es_name = es_name.downcase.strip if es_name.present?
  end
end
