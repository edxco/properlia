require 'rails_helper'

RSpec.describe 'DELETE /api/v1/leads/:id', type: :request do
  let(:lead) do
    Lead.create!(full_name: 'Ana', email: 'a@example.com', source: 'manual', interest_operation: :buy)
  end

  def headers_for(user)
    post '/users/sign_in', params: { user: { email: user.email, password: 'password123' } }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  it 'lets an admin hard delete a lead and its events' do
    admin = create(:user, role: 'admin')
    lead.lead_events.create!(event_type: 'note', description: 'x') if LeadEvent.column_names.include?('description')
    headers = headers_for(admin)
    lead

    expect { delete "/api/v1/leads/#{lead.id}", headers: headers }.to change(Lead, :count).by(-1)
    expect(response).to have_http_status(:ok)
  end

  it 'forbids non-admin users' do
    headers = headers_for(create(:user, role: 'staff'))
    lead

    expect { delete "/api/v1/leads/#{lead.id}", headers: headers }.not_to change(Lead, :count)
    expect(response).to have_http_status(:forbidden)
  end

  it 'requires authentication' do
    lead
    expect { delete "/api/v1/leads/#{lead.id}" }.not_to change(Lead, :count)
    expect(response).to have_http_status(:unauthorized)
  end
end
