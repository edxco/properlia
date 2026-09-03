require 'rails_helper'

RSpec.describe 'POST /api/v1/properties/generate_content', type: :request do
  let!(:property_type) { PropertyType.create!(name: 'house', es_name: 'casa') }
  let!(:listing_type) { ListingType.create!(name: 'sale', es_name: 'venta') }
  let!(:state) { State.create!(name: 'Puebla', es_name: 'Puebla') }
  let!(:city) { City.create!(state: state, name: 'Puebla', es_name: 'Puebla') }
  let(:user) { create(:user, role: 'user') }

  let(:auth_headers) do
    post '/users/sign_in', params: { user: { email: user.email, password: 'password123' } }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  let(:valid_params) do
    {
      property_type_id: property_type.id,
      listing_type_id: listing_type.id,
      neighborhood: 'Lomas de Angelópolis',
      city_id: city.id,
      state_id: state.id,
      price: 3_500_000,
      land_area: 200,
      built_area: 180,
      rooms: 3,
      bathrooms: 2
    }
  end

  it 'returns AI-drafted titles and descriptions in both languages' do
    fake_content = double(
      text: {
        title_es: 'Casa con alberca en Lomas de Angelópolis',
        title_en: 'House with pool in Lomas de Angelópolis',
        description_es: 'Hermosa casa...',
        description_en: 'Beautiful house...'
      }.to_json
    )
    fake_response = double(content: [fake_content])
    fake_client = double(messages: double(create: fake_response))
    allow(Anthropic::Client).to receive(:new).and_return(fake_client)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('ANTHROPIC_API_KEY').and_return('test-key')

    post '/api/v1/properties/generate_content', params: valid_params, headers: auth_headers, as: :json

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body['title_es']).to eq('Casa con alberca en Lomas de Angelópolis')
    expect(body['title_en']).to eq('House with pool in Lomas de Angelópolis')
    expect(body['description_es']).to eq('Hermosa casa...')
    expect(body['description_en']).to eq('Beautiful house...')
  end

  it 'preserves the advisor-selected feature order so the first one is the featured characteristic' do
    pool = PropertyFeature.create!(name: 'pool', es_name: 'alberca', slug: 'pool')
    garden = PropertyFeature.create!(name: 'garden', es_name: 'jardín', slug: 'garden')

    fake_content = double(
      text: {
        title_es: 'Casa con alberca en Lomas de Angelópolis',
        title_en: 'House with pool in Lomas de Angelópolis',
        description_es: 'Hermosa casa...',
        description_en: 'Beautiful house...'
      }.to_json
    )
    fake_response = double(content: [fake_content])
    fake_client = double(messages: double(create: fake_response))
    allow(Anthropic::Client).to receive(:new).and_return(fake_client)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('ANTHROPIC_API_KEY').and_return('test-key')

    expect(Ai::PropertyContentGenerator).to receive(:call) do |**args|
      expect(args[:features].map(&:id)).to eq([garden.id, pool.id])
    end.and_call_original

    post '/api/v1/properties/generate_content',
         params: valid_params.merge(property_feature_ids: [garden.id, pool.id]),
         headers: auth_headers, as: :json

    expect(response).to have_http_status(:ok)
  end

  it 'degrades gracefully when the AI service is unavailable, so manual entry still works' do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('ANTHROPIC_API_KEY').and_return(nil)

    post '/api/v1/properties/generate_content', params: valid_params, headers: auth_headers, as: :json

    expect(response).to have_http_status(:bad_gateway)
    expect(JSON.parse(response.body)['error']).to be_present
  end

  it 'requires property_type_id and listing_type_id' do
    post '/api/v1/properties/generate_content', params: valid_params.except(:property_type_id),
                                                  headers: auth_headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
  end
end
