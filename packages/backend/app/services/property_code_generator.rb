# Builds a property's public code: {CITY}-{TYPE}{NNNN}, e.g. "PUE-R0012".
class PropertyCodeGenerator
  NO_CITY = 'GEN'.freeze

  def self.next_number
    ActiveRecord::Base.connection.select_value(
      "SELECT nextval(pg_get_serial_sequence('properties', 'code_number'))"
    ).to_i
  end

  def self.format_code(city_code:, type_letter:, number:)
    format('%<city>s-%<type>s%<number>04d', city: city_code.presence || NO_CITY, type: type_letter, number: number)
  end
end
