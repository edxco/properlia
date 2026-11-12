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

RSpec.describe 'Property lead emails', type: :request do
  let(:property) { build_test_property(status: active_status) }
  let(:path) { "/api/v1/properties/#{property.id}/leads" }

  def html_sent
    html = nil
    allow(EmailService).to receive(:send_email) { |params| html ||= params[:html]; { success: true } }
    allow(EmailService).to receive(:validate_resend_configured!)
    yield
    html
  end

  before { allow(GeneralInfo).to receive(:instance).and_return(instance_double(GeneralInfo, email_to: 'admin@example.com')) }

  it 'shows WhatsApp, call and email buttons when the visitor consents' do
    html = html_sent do
      post path, params: { lead: { full_name: 'Ana', email: 'ana@example.com', phone: '5512345678', whatsapp_consent: true } }
    end

    expect(html).to include('wa.me/525512345678', 'tel:+5512345678', 'mailto:ana@example.com')
  end

  it 'hides the WhatsApp button without consent and email button without email' do
    html = html_sent do
      post path, params: { lead: { full_name: 'Ana', phone: '5512345678', whatsapp_consent: false } }
    end

    expect(html).not_to include('wa.me')
    expect(html).not_to include('mailto:')
    expect(html).to include('tel:')
  end

  it 'sends a confirmation to the visitor for every submission' do
    allow(EmailService).to receive(:send_property_lead_admin_email).and_return({ success: true })
    allow(EmailService).to receive(:send_property_lead_confirmation).and_return({ success: true })
    other = build_test_property(status: active_status, title: 'Otra casa')
    params = { lead: { full_name: 'Ana', email: 'ana@example.com' } }

    post path, params: params
    post "/api/v1/properties/#{other.id}/leads", params: params

    expect(EmailService).to have_received(:send_property_lead_confirmation).with(lead: having_attributes(property_id: property.id))
    expect(EmailService).to have_received(:send_property_lead_confirmation).with(lead: having_attributes(property_id: other.id))
  end

  it 'does not resend emails for an identical submission within 60 seconds' do
    allow(EmailService).to receive(:send_property_lead_admin_email).and_return({ success: true })
    allow(EmailService).to receive(:send_property_lead_confirmation).and_return({ success: true })
    params = { lead: { full_name: 'Ana', email: 'ana@example.com' } }

    2.times { post path, params: params }

    expect(EmailService).to have_received(:send_property_lead_confirmation).once
  end

  it 'skips the visitor confirmation when there is no email' do
    allow(EmailService).to receive(:validate_resend_configured!)
    allow(EmailService).to receive(:send_email)

    post path, params: { lead: { full_name: 'Ana', phone: '5512345678' } }

    expect(EmailService).to have_received(:send_email).once
  end

  it 'still creates the lead and sends the visitor email when the admin email fails' do
    allow(EmailService).to receive(:send_property_lead_admin_email).and_raise(StandardError, 'down')
    allow(EmailService).to receive(:send_property_lead_confirmation).and_return({ success: true })

    expect { post path, params: { lead: { full_name: 'Ana', email: 'ana@example.com' } } }.to change(Lead, :count).by(1)
    expect(response).to have_http_status(:created)
    expect(EmailService).to have_received(:send_property_lead_confirmation)
  end
end
