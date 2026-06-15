# frozen_string_literal: true

module Pdf
  module FormatHelper
    def format_price(price)
      "$#{number_with_delimiter(price.to_i, delimiter: ',')}"
    end

    def number_with_delimiter(number, delimiter: ',')
      number.to_s.reverse.gsub(/(\d{3})(?=\d)/, "\\1#{delimiter}").reverse
    end

    # Converts characters outside Latin Extended-B (U+0000-U+024F) to safe
    # Latin equivalents. Windows PDF viewers don't fall back to system fonts
    # for missing glyphs, so smart quotes, dashes, bullets, etc. show as blanks.
    def sanitize_for_pdf(text)
      return '' if text.blank?

      text.to_s
          .unicode_normalize(:nfc)
          .gsub(" ", ' ')
          .gsub("‘", "'").gsub("’", "'")
          .gsub("“", '"').gsub("”", '"')
          .gsub("–", '-').gsub("—", '-')
          .gsub("…", '...')
          .gsub("•", "·")
          .gsub(/[^ -ɏ\n\r\t]/, '')
          .strip
    end
  end
end
