require 'rails_helper'

RSpec.describe Property, type: :model do
  describe 'on-hold tracking' do
    it 'sets on_hold_since when the status becomes on-hold' do
      property = build_test_property(status: active_status)
      expect(property.on_hold_since).to be_nil

      property.update!(status: on_hold_status)
      expect(property.on_hold_since).to be_present
    end

    it 'clears on-hold fields when leaving on-hold' do
      property = build_test_property(status: on_hold_status, on_hold_reminded_at: 1.day.ago)
      property.update!(status: sold_status)

      expect(property.on_hold_since).to be_nil
      expect(property.on_hold_reminded_at).to be_nil
    end

    it 'does not touch on_hold_since on unrelated updates' do
      property = build_test_property(status: on_hold_status)
      original = property.on_hold_since
      property.update!(title: 'Otra')
      expect(property.reload.on_hold_since).to be_within(1.second).of(original)
    end
  end

  describe '.on_hold_due_for_reminder' do
    it 'returns on-hold properties whose last reminder or start is 3+ days old' do
      due_new = build_test_property(status: on_hold_status)
      due_new.update_columns(on_hold_since: 4.days.ago)
      due_reminded = build_test_property(status: on_hold_status)
      due_reminded.update_columns(on_hold_since: 10.days.ago, on_hold_reminded_at: 3.days.ago - 1.minute)
      recent = build_test_property(status: on_hold_status)
      recent.update_columns(on_hold_since: 1.day.ago)
      recently_reminded = build_test_property(status: on_hold_status)
      recently_reminded.update_columns(on_hold_since: 10.days.ago, on_hold_reminded_at: 1.day.ago)
      active = build_test_property(status: active_status)
      active.update_columns(on_hold_since: 10.days.ago)

      expect(Property.on_hold_due_for_reminder).to contain_exactly(due_new, due_reminded)
    end
  end
end
