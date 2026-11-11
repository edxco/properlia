# Public detail URL of a property: /{locale}/{propiedades|properties}/{title-slug}-{code}.
# Mirrors buildPropertyUrl() in packages/shared/src/lib/slugify.ts.
class PropertyPublicUrl
  LOCALES = %i[es en].freeze
  SEGMENTS = { es: 'propiedades', en: 'properties' }.freeze

  def self.slug(property, locale)
    title = locale.to_sym == :en ? property.title_en.presence || property.title : property.title
    [Slugger.slugify(title), property.code.to_s.downcase].reject(&:blank?).join('-')
  end

  def self.path(property, locale)
    "/#{locale}/#{SEGMENTS.fetch(locale.to_sym)}/#{slug(property, locale)}"
  end

  def self.url(property, locale = :es)
    "#{ENV.fetch('FRONTEND_URL', 'https://properlia.com').chomp('/')}#{path(property, locale)}"
  end

  def self.urls(property)
    LOCALES.index_with { |locale| url(property, locale) }
  end
end
