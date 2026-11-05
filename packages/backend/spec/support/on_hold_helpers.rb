module OnHoldHelpers
  def on_hold_status
    Status.find_or_create_by!(name: Status::ON_HOLD) { |s| s.es_name = 'apartada' }
  end

  def sold_status
    Status.find_or_create_by!(name: Status::SOLD) { |s| s.es_name = 'vendida' }
  end

  def active_status
    Status.find_or_create_by!(name: 'active') { |s| s.es_name = 'activa' }
  end

  def build_test_property(status:, **attrs)
    Property.create!(
      title: 'Casa Centro', address: 'Calle 1', price: 1_000_000, status: status,
      property_type: PropertyType.first || PropertyType.create!(name: 'house', es_name: 'casa'),
      listing_type: ListingType.first || ListingType.create!(name: 'sale', es_name: 'venta'),
      **attrs
    )
  end
end

RSpec.configure do |config|
  config.include OnHoldHelpers
  config.include ActiveSupport::Testing::TimeHelpers
end
