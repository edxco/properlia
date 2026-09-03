# Resolves free-text state/city names (from the Google Apps Script intake
# pipeline) into State/City records. States are always pre-seeded; a City is
# found-or-created under the matched State since cities are not seeded.
class LocationResolver
  def self.resolve(state_name:, city_name: nil)
    new.resolve(state_name: state_name, city_name: city_name)
  end

  def resolve(state_name:, city_name: nil)
    state = find_state(state_name)
    return [nil, nil] unless state

    [state, find_or_create_city(state, city_name)]
  end

  private

  def find_state(raw)
    return nil if raw.blank?

    normalized = normalize(raw)
    State.all.find { |s| normalize(s.name) == normalized || normalize(s.es_name) == normalized }
  end

  def find_or_create_city(state, raw)
    return nil if raw.blank?

    normalized = normalize(raw)
    existing = state.cities.to_a.find { |c| normalize(c.name) == normalized }
    return existing if existing

    display_name = raw.to_s.strip.split(/\s+/).map(&:capitalize).join(' ')
    state.cities.create!(name: display_name, es_name: display_name)
  end

  def normalize(str)
    str.to_s.unicode_normalize(:nfd).gsub(/[\u0300-\u036f]/, '').downcase.strip
  end
end
