class OnHoldPropertiesReminderJob < ApplicationJob
  queue_as :default

  def perform
    properties = Property.on_hold_due_for_reminder.order(:on_hold_since).to_a
    return if properties.empty?

    result = EmailService.send_on_hold_reminder(properties: properties)
    raise "On-hold reminder email failed: #{result[:error]}" unless result[:success]

    Property.where(id: properties.map(&:id)).update_all(on_hold_reminded_at: Time.current)
  end
end
