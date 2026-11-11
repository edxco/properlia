# URL slugs: lowercase ASCII words joined by hyphens ("San Andrés Cholula" => "san-andres-cholula").
# Mirrors slugify() in packages/shared/src/lib/slugify.ts; both must produce identical output.
class Slugger
  FORMAT = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/

  def self.slugify(text)
    text.to_s.unicode_normalize(:nfd).gsub(/[̀-ͯ]/, '').downcase
        .gsub(/[^a-z0-9]+/, '-').gsub(/\A-+|-+\z/, '')
  end

  # Appends -2, -3… until the slug is not in `taken`.
  def self.unique(base, taken)
    taken = taken.to_set
    return base unless taken.include?(base)

    (2..).each do |n|
      candidate = "#{base}-#{n}"
      return candidate unless taken.include?(candidate)
    end
  end
end
