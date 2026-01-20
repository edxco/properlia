class CreatePropertyCategories < ActiveRecord::Migration[7.0]
  def change
    create_table :property_categories, id: :uuid do |t|
      t.string "name", null: false
      t.string "es_name", null: false
      t.string "slug", null: false
      t.timestamps

      t.index ["slug"], name: "index_property_categories_on_slug", unique: true
    end
  end
end
