FactoryBot.define do
  factory :city do
    association :state
    sequence(:name) { |n| "City #{n}" }
    sequence(:es_name) { |n| "Ciudad #{n}" }
  end
end
