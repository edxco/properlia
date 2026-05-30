# frozen_string_literal: true

module Pdf
  module FormatHelper
    def format_price(price)
      "$#{number_with_delimiter(price.to_i, delimiter: ',')}"
    end

    def number_with_delimiter(number, delimiter: ',')
      number.to_s.reverse.gsub(/(\d{3})(?=\d)/, "\\1#{delimiter}").reverse
    end
  end
end
