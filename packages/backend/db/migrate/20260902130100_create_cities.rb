class CreateCities < ActiveRecord::Migration[7.0]
  def change
    create_table :cities, id: :uuid do |t|
      t.references :state, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.string :es_name, null: false

      t.timestamps
    end

    add_index :cities, [:state_id, :name], unique: true
    add_index :cities, [:state_id, :es_name], unique: true
  end
end
