require 'rails_helper'

RSpec.describe 'Property public code', type: :model do
  let(:state) { State.create!(name: 'Puebla', es_name: 'Puebla') }
  let(:puebla) { City.create!(state: state, name: 'Puebla', es_name: 'Puebla') }
  let(:cholula) { City.create!(state: state, name: 'San Andres Cholula', es_name: 'San Andrés Cholula') }

  def type(name)
    PropertyType.find_or_create_by!(name: name) { |t| t.es_name = "#{name} es" }
  end

  def create_property(type_name, city: nil)
    build_test_property(status: active_status, property_type: type(type_name), city: city)
  end

  it 'assigns a city code to new cities' do
    expect(puebla.code).to eq('PUE')
    expect(cholula.code).to eq('SAC')
  end

  it 'builds the code from the city, the type segment and a running number' do
    codes = [
      create_property('house', city: puebla),
      create_property('department', city: puebla),
      create_property('office', city: cholula),
      create_property('warehouse', city: cholula),
      create_property('land', city: cholula)
    ].map(&:code)

    expect(codes.map { |c| c[0..4] }).to eq(%w[PUE-R PUE-R SAC-C SAC-I SAC-T])
    numbers = codes.map { |c| c[5..].to_i }
    expect(numbers).to eq(numbers.sort)
    expect(numbers.uniq.size).to eq(5)
    expect(codes).to all(match(/\A[A-Z]{3}-[RCIT]\d{4,}\z/))
  end

  it 'uses GEN when the property has no city' do
    expect(create_property('land').code).to start_with('GEN-T')
  end

  it 'never changes the code after creation' do
    property = create_property('house', city: puebla)
    original = property.code

    property.update!(city: cholula, property_type: type('land'), code: 'XXX-X0000')

    expect(property.reload.code).to eq(original)
  end
end
