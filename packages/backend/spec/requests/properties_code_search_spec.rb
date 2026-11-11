require 'rails_helper'

RSpec.describe 'GET /api/v1/properties search by code', type: :request do
  let(:state) { State.create!(name: 'Puebla', es_name: 'Puebla') }
  let(:city) { City.create!(state: state, name: 'Puebla', es_name: 'Puebla') }

  it 'finds a property by its public code' do
    target = build_test_property(status: active_status, city: city)
    build_test_property(status: active_status, title: 'Otra casa')

    get '/api/v1/properties', params: { search: target.code.downcase }

    ids = JSON.parse(response.body)['data'].map { |p| p['id'] }
    expect(ids).to eq([target.id])
  end

  it 'returns the code in the property payload' do
    property = build_test_property(status: active_status, city: city)

    get "/api/v1/properties/#{property.id}"

    expect(JSON.parse(response.body)['code']).to eq(property.code)
  end
end
