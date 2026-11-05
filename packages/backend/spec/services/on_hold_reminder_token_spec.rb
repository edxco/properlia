require 'rails_helper'

RSpec.describe OnHoldReminderToken do
  let(:property) { build_test_property(status: on_hold_status) }

  it 'round-trips the property id and action' do
    token = described_class.generate(property, 'sold')
    expect(described_class.verify(token)).to eq('property_id' => property.id, 'action' => 'sold')
  end

  it 'rejects tampered or expired tokens' do
    token = described_class.generate(property, 'keep')
    expect(described_class.verify("#{token}x")).to be_nil

    travel 8.days do
      expect(described_class.verify(token)).to be_nil
    end
  end

  it 'rejects unknown actions' do
    expect { described_class.generate(property, 'delete') }.to raise_error(ArgumentError)
  end
end
