require 'rails_helper'

RSpec.describe PublicSlugs do
  describe 'State' do
    it 'assigns lowercase, accent-free, hyphenated slugs on create' do
      state = State.create!(name: 'Mexico City', es_name: 'Ciudad de México')

      expect(state.slug).to eq('ciudad-de-mexico')
      expect(state.slug_en).to eq('mexico-city')
    end

    it 'keeps slugs when the name changes' do
      state = State.create!(name: 'Puebla', es_name: 'Puebla')
      state.update!(es_name: 'Puebla de Zaragoza')

      expect(state.reload.slug).to eq('puebla')
    end

    it 'remembers previous slugs on an explicit slug change' do
      state = State.create!(name: 'Mexico City', es_name: 'Ciudad de México')
      state.update!(slug: 'CDMX')

      expect(state.reload.slug).to eq('cdmx')
      expect(state.previous_slugs).to eq(['ciudad-de-mexico'])
    end

    it 'rejects reserved slugs' do
      state = State.create!(name: 'Puebla', es_name: 'Puebla')

      expect(state.update(slug: 'contacto')).to be(false)
      expect(state.errors[:slug]).to include('is reserved')
    end

    it 'avoids reserved slugs on create' do
      state = State.create!(name: 'Properties', es_name: 'Propiedades')

      expect(state.slug).to eq('propiedades-estado')
      expect(state.slug_en).to eq('properties-state')
    end
  end

  describe 'City' do
    let(:state) { create(:state) }

    it 'scopes slug uniqueness to the state' do
      first = City.create!(state: state, name: 'San Andres', es_name: 'San Andrés')
      second = City.create!(state: state, name: 'San Andres.', es_name: 'San Andrés.')
      other_state = City.create!(state: create(:state), name: 'San Andres', es_name: 'San Andrés')

      expect(first.slug).to eq('san-andres')
      expect(second.slug).to eq('san-andres-2')
      expect(other_state.slug).to eq('san-andres')
    end
  end
end
