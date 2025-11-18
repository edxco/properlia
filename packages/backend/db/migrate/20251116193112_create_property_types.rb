class CreatePropertyTypes < ActiveRecord::Migration[7.0]
  def change
    create_table :property_types, id: :uuid do |t|
      t.string :name, null: false
      t.string :es_name, null: false

      t.timestamps
    end

    add_index :property_types, :name, unique: true
    add_index :property_types, :es_name, unique: true
  end
end
