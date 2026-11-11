require 'rails_helper'

RSpec.describe LocationResolver do
  let!(:state) { create(:state, name: 'Puebla', es_name: 'Puebla') }

  def resolve(city_name, state_name: 'Puebla')
    described_class.resolve(state_name: state_name, city_name: city_name)
  end

  it 'reuses a city matching name regardless of accents and case' do
    city = create(:city, state: state, name: 'San Andres Cholula', es_name: 'San Andrés Cholula')

    expect { expect(resolve('  san andrés  CHOLULA ')).to eq([state, city]) }.not_to change(City, :count)
  end

  it 'reuses a city matching only es_name' do
    city = create(:city, state: state, name: 'Mexico City', es_name: 'Ciudad de México')

    expect { expect(resolve('ciudad de mexico')).to eq([state, city]) }.not_to change(City, :count)
  end

  it 'creates a new city keeping the input casing' do
    _, city = resolve('Ciudad  de Juárez')

    expect(city).to be_persisted
    expect(city.name).to eq('Ciudad de Juárez')
    expect(city.es_name).to eq('Ciudad de Juárez')
  end

  it 'returns no city for a blank name' do
    expect(resolve('')).to eq([state, nil])
  end

  it 'returns nothing for an unknown state' do
    expect(resolve('Puebla', state_name: 'Atlantis')).to eq([nil, nil])
  end

  it 'reuses the city created by a concurrent request instead of raising' do
    resolver = described_class.new
    winner = create(:city, state: state, name: 'Atlixco', es_name: 'Atlixco')
    calls = 0
    allow(resolver).to receive(:match_city).and_wrap_original do |original, *args|
      calls += 1
      calls == 1 ? nil : original.call(*args)
    end

    expect { expect(resolver.resolve(state_name: 'Puebla', city_name: 'Atlixco')).to eq([state, winner]) }
      .not_to change(City, :count)
  end
end
