require 'rails_helper'

RSpec.describe OnHoldPropertiesReminderJob do
  it 'sends one digest for due properties and stamps on_hold_reminded_at' do
    due = build_test_property(status: on_hold_status)
    due.update_columns(on_hold_since: 4.days.ago)
    not_due = build_test_property(status: on_hold_status)

    expect(EmailService).to receive(:send_on_hold_reminder)
      .with(properties: [due]).once.and_return(success: true)

    described_class.perform_now

    expect(due.reload.on_hold_reminded_at).to be_within(5.seconds).of(Time.current)
    expect(not_due.reload.on_hold_reminded_at).to be_nil
  end

  it 'does nothing when no properties are due' do
    expect(EmailService).not_to receive(:send_on_hold_reminder)
    described_class.perform_now
  end

  it 'does not stamp properties when the email fails' do
    due = build_test_property(status: on_hold_status)
    due.update_columns(on_hold_since: 4.days.ago)
    allow(EmailService).to receive(:send_on_hold_reminder).and_return(success: false, error: 'boom')

    expect { described_class.perform_now }.to raise_error(/boom/)
    expect(due.reload.on_hold_reminded_at).to be_nil
  end
end
