class CreateLeadsAndLeadEvents < ActiveRecord::Migration[7.0]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :leads, id: :uuid do |t|
      # Identidad / contacto
      t.string :full_name, null: false
      t.string :email
      t.string :phone
      t.string :email_normalized
      t.string :phone_e164

      # Fuente / contexto
      t.string :source, null: false
      t.jsonb :source_detail, null: false, default: {}
      t.uuid :property_id
      t.string :utm_source
      t.string :utm_medium
      t.string :utm_campaign
      t.string :utm_content
      t.string :utm_term
      t.text :referrer_url
      t.text :landing_url

      # Calificación y tracking comercial
      t.integer :status, null: false, default: 0
      t.integer :interest_operation, null: false # enum buy/rent/invest
      t.string  :interest_property_type
      t.numeric :min_budget
      t.numeric :max_budget
      t.integer :score, null: false, default: 0
      t.text :notes

      # Seguimiento (multi-agente)
      t.uuid :assigned_to_user_id
      t.uuid :created_by_user_id
      t.datetime :next_follow_up_at
      t.datetime :last_contacted_at
      t.integer :contact_attempts, null: false, default: 0

      # Consentimiento
      t.boolean :consent_marketing, null: false, default: false
      t.datetime :consent_at

      t.timestamps
    end

    add_foreign_key :leads, :properties, column: :property_id
    add_foreign_key :leads, :users, column: :assigned_to_user_id
    add_foreign_key :leads, :users, column: :created_by_user_id

    # Constraints
    add_check_constraint :leads,
      "(email_normalized IS NOT NULL OR phone_e164 IS NOT NULL)",
      name: "leads_require_email_or_phone"

    add_check_constraint :leads,
      "(min_budget IS NULL OR max_budget IS NULL OR min_budget <= max_budget)",
      name: "leads_budget_range_ok"

    add_check_constraint :leads,
      "(min_budget IS NULL OR min_budget >= 0) AND (max_budget IS NULL OR max_budget >= 0)",
      name: "leads_budget_non_negative"

    # Dedupe (unique parcial)
    add_index :leads, :email_normalized, unique: true,
      where: "email_normalized IS NOT NULL",
      name: "index_leads_unique_email_normalized"

    add_index :leads, :phone_e164, unique: true,
      where: "phone_e164 IS NOT NULL",
      name: "index_leads_unique_phone_e164"

    # Índices de seguimiento
    add_index :leads, [:status, :created_at], name: "index_leads_on_status_created_at"
    add_index :leads, [:assigned_to_user_id, :status], name: "index_leads_on_assigned_status"
    add_index :leads, :next_follow_up_at
    add_index :leads, :property_id
    add_index :leads, :interest_operation
    add_index :leads, :utm_campaign

    create_table :lead_events, id: :uuid do |t|
      t.uuid :lead_id, null: false
      t.string :event_type, null: false
      t.jsonb :metadata, null: false, default: {}
      t.uuid :created_by_user_id
      t.timestamps
    end

    add_foreign_key :lead_events, :leads
    add_foreign_key :lead_events, :users, column: :created_by_user_id

    add_index :lead_events, [:lead_id, :created_at], name: "index_lead_events_on_lead_created_at"
    add_index :lead_events, [:event_type, :created_at], name: "index_lead_events_on_type_created_at"
  end
end
