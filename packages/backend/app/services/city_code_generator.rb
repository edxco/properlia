# Builds a unique 3-letter code from a city name (e.g. "San Andrés Cholula" => "SAC").
class CityCodeGenerator
  STOP_WORDS = %w[de del la las los el y].freeze

  def self.generate(name, taken: City.where.not(code: nil).pluck(:code))
    new(name, taken).generate
  end

  def initialize(name, taken)
    @words = normalize(name).split(/\s+/).reject { |w| STOP_WORDS.include?(w) }
    @taken = taken.to_set
  end

  def generate
    candidates.find { |c| !@taken.include?(c) } ||
      raise(ArgumentError, "No available city code for #{@words.join(' ')}")
  end

  private

  def candidates
    letters = @words.join.chars
    base = base_code
    prefix = base[0, 2]
    tail = (@words.last || '').chars.drop(@words.size == 1 ? 3 : 1)

    [base] +
      tail.map { |ch| (prefix + ch).upcase } +
      letters.map { |ch| (prefix + ch).upcase } +
      ('A'..'Z').map { |ch| prefix + ch } +
      (0..9).map { |n| "#{prefix}#{n}" }
  end

  def base_code
    raw = if @words.size == 1
            @words.first[0, 3]
          else
            @words.map { |w| w[0] }.join[0, 3]
          end
    raw = (raw + @words.join[raw.size..].to_s)[0, 3] if raw.size < 3
    raw.ljust(3, 'X').upcase
  end

  def normalize(str)
    str.to_s.unicode_normalize(:nfd).gsub(/[̀-ͯ]/, '').downcase.gsub(/[^a-z\s]/, ' ').strip
  end
end
