class CreatePropertyFeatures < ActiveRecord::Migration[7.0]
  def change
    create_table :property_features, id: :uuid do |t|
      t.string :name, null: false
      t.string :es_name, null: false
      t.string :slug, null: false

      t.timestamps
    end

    add_index :property_features, :name, unique: true
    add_index :property_features, :es_name, unique: true
    add_index :property_features, :slug, unique: true
  end
end
