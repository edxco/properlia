FactoryBot.define do
  factory :state do
    sequence(:name) { |n| "State #{n}" }
    sequence(:es_name) { |n| "Estado #{n}" }
  end
end
