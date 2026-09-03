module Ai
  # Drafts a title and description (each in Spanish and English) with Anthropic
  # Claude, following the disclosure spirit of Mexican standard NOM-247
  # (surface area, price, general location, no unverifiable claims). Called
  # with the property's current draft attributes before the listing is even
  # saved, so it works the same way for both create and edit.
  class PropertyContentGenerator
    class GenerationError < StandardError; end

    MODEL = ENV.fetch('ANTHROPIC_MODEL', 'claude-sonnet-5')

    # Keyed by PropertyType#name (already lowercased by the model's before_save).
    TYPE_EMPHASIS = {
      'house' => 'Emphasize the distribution of bedrooms and bathrooms, the gap ' \
                 'between land and built area (yard size), parking, any ' \
                 'security-related features, and use a family-oriented tone.',
      'department' => 'Emphasize building amenities such as a pool, gym, or ' \
                       'elevator if present among the selected features, the ' \
                       'floor level if known, shared common areas, and a ' \
                       'lifestyle-oriented tone.',
      'land' => 'Land area is the headline figure (built area is usually not ' \
                'applicable). Note which use the property is suited for based ' \
                'on its category (residential, commercial, or industrial), and ' \
                'mention services availability or topography only if present ' \
                'among the selected features.',
      'retail space' => 'Emphasize street visibility and frontage, foot traffic ' \
                         'potential, usable commercial floor area, parking ' \
                         'availability for customers, and adaptability to ' \
                         'different business uses.',
      'warehouse' => 'Emphasize storage and loading capacity, ceiling height and ' \
                      'industrial features if present among the selected ' \
                      'features, and vehicle access.',
      'doctor office' => 'Emphasize suitability for a medical or professional ' \
                          'practice, accessibility, building amenities, and ' \
                          'proximity features if present among the selected ' \
                          'features.',
      'office' => 'Emphasize the floor plan and meeting space, parking ratio, ' \
                  'and building class or amenities.'
    }.freeze

    def self.call(**args)
      new(**args).call
    end

    def initialize(property_type:, listing_type:, address: nil, neighborhood: nil, city: nil,
                   state: nil, price: nil, land_area: nil, built_area: nil, rooms: nil,
                   bathrooms: nil, half_bathrooms: nil, parking_spaces: nil, categories: [],
                   features: [])
      @property_type = property_type
      @listing_type = listing_type
      @address = address
      @neighborhood = neighborhood
      @city = city
      @state = state
      @price = price
      @land_area = land_area
      @built_area = built_area
      @rooms = rooms
      @bathrooms = bathrooms
      @half_bathrooms = half_bathrooms
      @parking_spaces = parking_spaces
      @categories = Array(categories)
      # Order matters: the first entry is the advisor's featured characteristic
      # for the title (see #title_rules). Callers must preserve selection order.
      @features = Array(features)
    end

    def call
      raise GenerationError, 'ANTHROPIC_API_KEY is not configured' if ENV['ANTHROPIC_API_KEY'].blank?

      response = client.messages.create(
        model: MODEL,
        max_tokens: 3000,
        system: system_prompt,
        messages: [{ role: 'user', content: user_prompt }]
      )

      parse_response(response)
    rescue GenerationError
      raise
    rescue StandardError => e
      Rails.logger.error "Anthropic content generation failed: #{e.message}"
      raise GenerationError, 'AI service unavailable, write the title and description manually.'
    end

    private

    def client
      Anthropic::Client.new(api_key: ENV['ANTHROPIC_API_KEY'])
    end

    def system_prompt
      <<~PROMPT
        You are a real estate copywriter for Properlia, a Mexican real estate agency.
        Draft a TITLE and a DESCRIPTION for this listing, each in BOTH Spanish and
        English — independently well-written per language, not literal translations
        of each other.

        ## Description rules — must comply with Mexican standard NOM-247
        These disclosure requirements apply equally to BOTH `description_es` and
        `description_en` — each is a fully compliant, independent description,
        not just the Spanish one with the English being a looser paraphrase:
        - State the land and/or built area explicitly, with units (m²).
        - State the price, currency, and whether it is for sale or rent.
        - Reference only the general location (neighborhood, city, state) — never
          a full street address.
        - Do not make unverifiable legal or condition claims (e.g. deed status,
          liens, "no encumbrances") unless that information was explicitly given
          below — NOM-247 requires disclosures to be accurate, not merely absent.
        - Do not use unverifiable superlative or misleading commercial claims
          ("the best", "guaranteed investment", "will appreciate in value").
        - The user message below may list a "Featured characteristic" and
          "Other available characteristics" — for the DESCRIPTION, weave ALL of
          them naturally into the text as selling points (unlike the title,
          which only uses a small subset — see Title rules). Do not skip any of
          them, and do not invent amenities that are not in that list.
        #{TYPE_EMPHASIS[@property_type.name.to_s.downcase]}

        ## Title rules
        1. Identify the property type.
        2. Identify the most relevant available location (prefer neighborhood,
           then city, then state) — never the full street address.
        3. ALWAYS use the featured characteristic given below (marked "Featured
           characteristic") — it must appear in the title.
        4. You may add AT MOST ONE secondary characteristic, taken from "Other
           available characteristics" below, and only if it complements the
           featured one. Never add more than one.
        5. The secondary characteristic must genuinely complement the featured
           one (e.g. pairs naturally with it), not just be another random pick.
        6. Do not restate specs already evident elsewhere in the listing
           (bedrooms, bathrooms, parking, land area, built area) unless one of
           them literally is the featured or secondary characteristic.
        7. Use only the information given below — never information from outside
           this prompt.
        8. Never invent features, benefits, or claims.
        9. Avoid generic commercial adjectives ("hermosa", "increíble", "única",
           "espectacular", etc.) — this also keeps the title free of misleading
           or unverifiable claims (NOM-247 spirit).
        10. Keep the Spanish title between 50 and 75 characters when possible.
        11. Never exceed 90 characters unless strictly necessary to remain
            intelligible.
        12. Write `title_es` in natural, professional Mexican Spanish. Write
            `title_en` as an equivalent (not a literal translation) natural,
            professional English title.
        13. Generate exactly ONE title per language — a single best title, not a
            list of options.
        - Mentioning the operation (for sale / for rent) is optional — include it
          only if it fits naturally without breaking the length guidance.
        - Never include the full street address in the title.

        Respond with ONLY a JSON object, no markdown fences and no extra text,
        in exactly this shape:
        {"title_es": "...", "title_en": "...", "description_es": "...", "description_en": "..."}
      PROMPT
    end

    def user_prompt
      [
        "Property type: #{@property_type.es_name} / #{@property_type.name}",
        "Listing type: #{@listing_type.es_name} / #{@listing_type.name}",
        (categories_line if @categories.any?),
        "Location: #{[@neighborhood, @city, @state].compact_blank.join(', ')}",
        ("Price: #{@price}" if @price.present?),
        ("Land area: #{@land_area} m²" if @land_area.present?),
        ("Built area: #{@built_area} m²" if @built_area.present?),
        ("Bedrooms: #{@rooms}" if @rooms.present?),
        ("Bathrooms: #{@bathrooms}" if @bathrooms.present?),
        ("Half bathrooms: #{@half_bathrooms}" if @half_bathrooms.present?),
        ("Parking spaces: #{@parking_spaces}" if @parking_spaces.present?),
        (featured_characteristic_line if @features.any?),
        (other_characteristics_line if @features.size > 1)
      ].compact.join("\n")
    end

    def categories_line
      "Categories: #{@categories.map(&:es_name).join(', ')}"
    end

    def featured_characteristic_line
      "Featured characteristic (must appear in the title): #{@features.first.es_name}"
    end

    def other_characteristics_line
      "Other available characteristics (pick at most one, only if complementary " \
        "to the featured one): #{@features[1..].map(&:es_name).join(', ')}"
    end

    def parse_response(response)
      if response.stop_reason == :max_tokens
        Rails.logger.error 'Anthropic response truncated: hit max_tokens before completing'
        raise GenerationError, 'AI service returned an unexpected response.'
      end

      text_block = response.content.find { |block| block.type == :text }
      raise GenerationError, 'AI service returned an unexpected response.' unless text_block

      data = JSON.parse(text_block.text)
      {
        title_es: data.fetch('title_es'),
        title_en: data.fetch('title_en'),
        description_es: data.fetch('description_es'),
        description_en: data.fetch('description_en')
      }
    rescue JSON::ParserError, KeyError, NoMethodError => e
      Rails.logger.error "Unexpected Anthropic response shape: #{e.message}"
      raise GenerationError, 'AI service returned an unexpected response.'
    end
  end
end
