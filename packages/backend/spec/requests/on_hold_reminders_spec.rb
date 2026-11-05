require 'rails_helper'

RSpec.describe 'On-hold reminders', type: :request do
  let!(:property) { build_test_property(status: on_hold_status) }

  before { sold_status }

  it 'GET renders a confirmation page without changing the property' do
    get '/api/v1/on_hold_reminders', params: { token: OnHoldReminderToken.generate(property, 'sold') }

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('<form method="post"')
    expect(property.reload.status).to eq(on_hold_status)
  end

  it 'POST sold marks the property as sold' do
    post '/api/v1/on_hold_reminders', params: { token: OnHoldReminderToken.generate(property, 'sold') }

    expect(response).to have_http_status(:ok)
    expect(property.reload.status).to eq(sold_status)
    expect(property.on_hold_since).to be_nil
  end

  it 'POST keep snoozes the reminder' do
    post '/api/v1/on_hold_reminders', params: { token: OnHoldReminderToken.generate(property, 'keep') }

    expect(property.reload.status).to eq(on_hold_status)
    expect(property.on_hold_reminded_at).to be_within(5.seconds).of(Time.current)
  end

  it 'is a no-op when the property is no longer on hold' do
    token = OnHoldReminderToken.generate(property, 'keep')
    property.update!(status: sold_status)

    post '/api/v1/on_hold_reminders', params: { token: token }
    expect(response.body).to include('ya no está apartada')
    expect(property.reload.status).to eq(sold_status)
  end

  it 'returns 410 for an invalid token' do
    post '/api/v1/on_hold_reminders', params: { token: 'bogus' }
    expect(response).to have_http_status(:gone)
  end
end
