require 'rails_helper'

RSpec.describe 'POST /api/v1/properties/:id/leads', type: :request do
  let(:property) { build_test_property(status: active_status) }
  let(:path) { "/api/v1/properties/#{property.id}/leads" }
  let(:lead_params) { { full_name: 'Ana Perez', email: 'ana@example.com', phone: '5512345678', whatsapp_consent: true } }

  it 'creates a lead linked to the property and bumps the counter' do
    expect { post path, params: { lead: lead_params } }.to change(Lead, :count).by(1)

    expect(response).to have_http_status(:created)
    lead = Lead.last
    expect(lead.property_id).to eq(property.id)
    expect(lead.source).to eq('property_form')
    expect(lead.whatsapp_consent).to be(true)
    expect(property.reload.leads_count).to eq(1)
  end

  it 'allows the same contact to submit for different properties' do
    other = build_test_property(status: active_status, title: 'Otra casa')

    post path, params: { lead: lead_params }
    expect { post "/api/v1/properties/#{other.id}/leads", params: { lead: lead_params } }.to change(Lead, :count).by(1)
    expect(response).to have_http_status(:created)
  end

  it 'ignores an identical submission within 60 seconds' do
    post path, params: { lead: lead_params }

    expect { post path, params: { lead: lead_params } }.not_to change(Lead, :count)
    expect(response).to have_http_status(:created)
  end

  it 'accepts the same contact and property again after 60 seconds' do
    post path, params: { lead: lead_params }

    travel 61.seconds do
      expect { post path, params: { lead: lead_params } }.to change(Lead, :count).by(1)
    end
    expect(property.reload.leads_count).to eq(2)
  end

  it 'requires a name and an email or phone' do
    post path, params: { lead: { full_name: 'Ana' } }

    expect(response).to have_http_status(:unprocessable_entity)
  end

  it 'silently drops honeypot submissions' do
    expect { post path, params: { lead: lead_params, website: 'spam.example' } }.not_to change(Lead, :count)
  end
end
