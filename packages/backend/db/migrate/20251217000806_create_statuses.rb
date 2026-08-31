class CreateStatuses < ActiveRecord::Migration[7.0]
  def change
    create_table :statuses, id: :uuid do |t|
      t.string :name, null: false
      t.string :es_name, null: false

      t.timestamps
    end

    add_index :statuses, :name, unique: true
    add_index :statuses, :es_name, unique: true
  end
end
