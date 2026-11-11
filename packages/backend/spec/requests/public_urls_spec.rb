require 'rails_helper'

RSpec.describe 'Public property URLs', type: :request do
  let(:state) { State.create!(name: 'Puebla', es_name: 'Puebla') }
  let(:city) { City.create!(state: state, name: 'San Andres Cholula', es_name: 'San Andrés Cholula') }
  let!(:property) do
    build_test_property(status: active_status, state: state, city: city,
                        title: 'Casa en Venta en Zavaleta', title_en: 'House for Sale in Zavaleta')
  end

  describe 'GET /api/v1/properties/by_code/:code' do
    it 'finds a property by its exact code, ignoring case' do
      get "/api/v1/properties/by_code/#{property.code.downcase}"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['id']).to eq(property.id)
    end

    it 'does not match a code prefix' do
      get "/api/v1/properties/by_code/#{property.code[0..-2]}"

      expect(response).to have_http_status(:not_found)
    end

    it 'hides properties that are not publicly visible' do
      property.update!(status: sold_status)

      get "/api/v1/properties/by_code/#{property.code}"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'property payload' do
    it 'includes localized public URLs and location slugs' do
      get "/api/v1/properties/#{property.id}"

      body = JSON.parse(response.body)
      code = property.code.downcase
      expect(body['public_url']['es']).to end_with("/es/propiedades/casa-en-venta-en-zavaleta-#{code}")
      expect(body['public_url']['en']).to end_with("/en/properties/house-for-sale-in-zavaleta-#{code}")
      expect(body['city']).to include('slug' => 'san-andres-cholula', 'slug_en' => 'san-andres-cholula')
    end
  end

  describe 'GET /api/v1/public_paths' do
    it 'lists public properties and location slugs' do
      build_test_property(status: sold_status, state: state, city: city)

      get '/api/v1/public_paths'

      body = JSON.parse(response.body)
      expect(body['properties'].map { |p| p['id'] }).to eq([property.id])
      expect(body['properties'].first).to include(
        'code' => property.code,
        'slug_es' => "casa-en-venta-en-zavaleta-#{property.code.downcase}",
        'city_id' => city.id,
        'listing_type' => 'sale'
      )
      expect(body['states'].first).to include('slug' => 'puebla', 'previous_slugs' => [])
      expect(body['cities'].first).to include('slug' => 'san-andres-cholula', 'state_id' => state.id)
    end
  end
end
