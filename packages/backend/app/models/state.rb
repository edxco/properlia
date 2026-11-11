class State < ApplicationRecord
  include PublicSlugs

  # State slugs share the first URL level (/es/{state}) with fixed pages, so these are off limits.
  RESERVED_SLUGS = %w[
    propiedades properties contacto contact servicios services
    consulta-comprador buyer-consultation consulta-vendedor seller-consultation
    aviso-de-privacidad privacy terminos-y-condiciones terms mapa-del-sitio sitemap
    api es en
  ].freeze

  has_many :cities, dependent: :restrict_with_error
  has_many :properties, dependent: :restrict_with_error
  has_many :leads, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true
  validates :es_name, presence: true, uniqueness: true
  validates :slug, :slug_en, uniqueness: true, exclusion: { in: RESERVED_SLUGS, message: 'is reserved' }

  private

  def slug_scope
    State.all
  end

  def assign_slugs
    super
    self.slug = "#{slug}-estado" if RESERVED_SLUGS.include?(slug)
    self.slug_en = "#{slug_en}-state" if RESERVED_SLUGS.include?(slug_en)
  end
end
