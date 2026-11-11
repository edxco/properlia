# Permanent URL slugs for locations: `slug` (from es_name) and `slug_en` (from name).
# Slugs are assigned once and do not follow later name edits; an explicit slug
# change keeps the old value in previous_slugs so the frontend can 301 to the new URL.
module PublicSlugs
  extend ActiveSupport::Concern

  included do
    before_validation :assign_slugs, on: :create
    before_validation :normalize_slugs
    before_update :remember_previous_slugs

    validates :slug, :slug_en, presence: true, format: { with: Slugger::FORMAT, allow_blank: true }

    after_commit :revalidate_frontend_cache
  end

  private

  # Records sharing the slug namespace (all states, or the cities of one state).
  def slug_scope
    raise NotImplementedError
  end

  def assign_slugs
    self.slug = slug.presence || unique_slug(:slug, es_name.presence || name)
    self.slug_en = slug_en.presence || unique_slug(:slug_en, name.presence || es_name)
  end

  def unique_slug(column, source)
    base = Slugger.slugify(source)
    return base if base.blank?

    Slugger.unique(base, slug_scope.where.not(id: id).where("#{column} = :b OR #{column} LIKE :p", b: base, p: "#{base}-%").pluck(column))
  end

  def normalize_slugs
    self.slug = Slugger.slugify(slug) if slug.present?
    self.slug_en = Slugger.slugify(slug_en) if slug_en.present?
  end

  def remember_previous_slugs
    old = []
    old << slug_was if will_save_change_to_slug? && slug_was.present?
    old << slug_en_was if will_save_change_to_slug_en? && slug_en_was.present?
    return if old.empty?

    self.previous_slugs = ((previous_slugs || []) | old) - [slug, slug_en]
  end

  def revalidate_frontend_cache
    RevalidateFrontendCacheJob.perform_later
  end
end
