class RemoveVisitorConfirmationSentAtFromLeads < ActiveRecord::Migration[7.0]
  def change
    remove_index :leads, :visitor_confirmation_sent_at
    remove_column :leads, :visitor_confirmation_sent_at, :datetime
  end
end
