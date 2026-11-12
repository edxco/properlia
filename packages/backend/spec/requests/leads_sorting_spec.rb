require 'rails_helper'

RSpec.describe 'GET /api/v1/leads sorting', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) do
    post '/users/sign_in', params: { user: { email: user.email, password: 'password123' } }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end
  let(:alpha) { build_test_property(status: active_status, title: 'Alfa') }
  let(:zeta) { build_test_property(status: active_status, title: 'Zeta') }

  before do
    Lead.create!(full_name: 'Bruno', email: 'b@example.com', source: 'property_form', interest_operation: :buy,
                 property: zeta, created_at: 3.days.ago)
    Lead.create!(full_name: 'ana', email: 'a@example.com', source: 'buyer_form', interest_operation: :buy,
                 property: alpha, created_at: 2.days.ago)
    Lead.create!(full_name: 'Carla', email: 'c@example.com', source: 'manual', interest_operation: :buy,
                 created_at: 1.day.ago)
  end

  def names(params = {})
    get '/api/v1/leads', params: params, headers: auth_headers
    JSON.parse(response.body)['data'].map { |lead| lead['full_name'] }
  end

  it 'defaults to newest first' do
    expect(names).to eq(%w[Carla ana Bruno])
  end

  it 'sorts by name case-insensitively in both directions' do
    expect(names(sort: 'full_name', direction: 'asc')).to eq(%w[ana Bruno Carla])
    expect(names(sort: 'full_name', direction: 'desc')).to eq(%w[Carla Bruno ana])
  end

  it 'sorts by property title with leads without property last' do
    expect(names(sort: 'property', direction: 'asc')).to eq(%w[ana Bruno Carla])
    expect(names(sort: 'property', direction: 'desc')).to eq(%w[Bruno ana Carla])
  end

  it 'ignores columns outside the whitelist' do
    expect(names(sort: 'password; DROP TABLE leads', direction: 'asc')).to eq(%w[Carla ana Bruno])
  end

  it 'filters by property' do
    expect(names(property_id: alpha.id)).to eq(%w[ana])
  end
end
