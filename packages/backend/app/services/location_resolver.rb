# Resolves free-text state/city names (from the Google Apps Script intake
# pipeline) into State/City records. States are always pre-seeded; a City is
# found-or-created under the matched State since cities are not seeded.
class LocationResolver
  def self.resolve(state_name:, city_name: nil)
    new.resolve(state_name: state_name, city_name: city_name)
  end

  def self.normalize(str)
    str.to_s.unicode_normalize(:nfd).gsub(/[̀-ͯ]/, '').downcase.squish
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
    match_city(state, normalized) || create_city(state, raw.to_s.squish, normalized)
  end

  # Concurrent intakes can race on the (state_id, name/es_name) or code unique
  # indexes; re-read and reuse the winner, or retry once for a code collision.
  def create_city(state, display_name, normalized, retried: false)
    state.cities.create!(name: display_name, es_name: display_name)
  rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid
    existing = match_city(state, normalized)
    return existing if existing
    raise if retried

    create_city(state, display_name, normalized, retried: true)
  end

  def match_city(state, normalized)
    state.cities.reload.find { |c| normalize(c.name) == normalized || normalize(c.es_name) == normalized }
  end

  def normalize(str)
    self.class.normalize(str)
  end
end
