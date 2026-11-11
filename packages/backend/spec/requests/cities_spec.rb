require 'rails_helper'

RSpec.describe 'POST /api/v1/cities', type: :request do
  let!(:state) { create(:state) }
  let(:user) { create(:user, role: 'user') }

  let(:auth_headers) do
    post '/users/sign_in', params: { user: { email: user.email, password: 'password123' } }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  it 'returns 422 for a duplicate city in the same state' do
    create(:city, state: state, name: 'Puebla', es_name: 'Puebla')

    post '/api/v1/cities', params: { city: { state_id: state.id, name: 'Puebla', es_name: 'Puebla' } },
                           headers: auth_headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it 'returns 422 when the unique index rejects a racing insert' do
    allow_any_instance_of(City).to receive(:save).and_raise(ActiveRecord::RecordNotUnique)

    post '/api/v1/cities', params: { city: { state_id: state.id, name: 'Atlixco', es_name: 'Atlixco' } },
                           headers: auth_headers, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['errors']).to eq(['City already exists'])
  end
end
