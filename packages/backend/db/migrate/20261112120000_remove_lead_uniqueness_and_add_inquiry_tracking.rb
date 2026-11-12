class RemoveLeadUniquenessAndAddInquiryTracking < ActiveRecord::Migration[7.0]
  def up
    remove_index :leads, name: :index_leads_unique_email_normalized
    remove_index :leads, name: :index_leads_unique_phone_e164
    add_index :leads, :email_normalized
    add_index :leads, :phone_e164

    add_column :leads, :whatsapp_consent, :boolean, default: false, null: false
    add_column :leads, :visitor_confirmation_sent_at, :datetime
    add_index :leads, :visitor_confirmation_sent_at

    add_column :properties, :leads_count, :integer, default: 0, null: false

    execute <<~SQL
      UPDATE properties
      SET leads_count = (SELECT COUNT(*) FROM leads WHERE leads.property_id = properties.id)
    SQL
  end

  def down
    remove_column :properties, :leads_count
    remove_index :leads, :visitor_confirmation_sent_at
    remove_column :leads, :visitor_confirmation_sent_at
    remove_column :leads, :whatsapp_consent
    remove_index :leads, :phone_e164
    remove_index :leads, :email_normalized
    add_index :leads, :email_normalized, name: :index_leads_unique_email_normalized, unique: true, where: "(email_normalized IS NOT NULL)"
    add_index :leads, :phone_e164, name: :index_leads_unique_phone_e164, unique: true, where: "(phone_e164 IS NOT NULL)"
  end
end
