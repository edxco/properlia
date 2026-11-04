namespace :properties do
  desc 'Email the admin about on-hold (apartada) properties due for a status check'
  task on_hold_reminders: :environment do
    OnHoldPropertiesReminderJob.perform_now
  end
end
