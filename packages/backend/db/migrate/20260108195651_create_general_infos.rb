class CreateGeneralInfos < ActiveRecord::Migration[7.0]
  def change
    create_table :general_infos, id: :uuid do |t|
      t.string :phone, null: false
      t.string :whatsapp, null: false
      t.string :email_to, null: false
      t.integer :singleton_guard, default: 0, null: false

      t.timestamps
    end

    # Add unique index on singleton_guard to ensure only one record exists
    # This works across all databases (PostgreSQL, MySQL, SQLite)
    add_index :general_infos, :singleton_guard, unique: true
  end
end
