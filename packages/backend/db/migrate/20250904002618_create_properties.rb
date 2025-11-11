class CreateProperties < ActiveRecord::Migration[7.0]
  def change
    # Ensure UUID extension is enabled
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    create_table :properties, id: :uuid do |t|
      # Highlighted property flag
      t.boolean :featured, null: false, default: false

      # Basic information
      t.string  :title,       null: false
      t.text    :description

      # Areas (square meters)
      t.decimal :land_area,   precision: 10, scale: 2
      t.decimal :built_area,  precision: 10, scale: 2

      # Physical attributes
      t.integer :rooms,           default: 0, null: false
      t.integer :bathrooms,       default: 0, null: false
      t.integer :half_bathrooms,  default: 0, null: false
      t.integer :parking_spaces,  default: 0, null: false

      # Commercial attributes
      t.string  :property_type,   null: false
      t.decimal :price,           precision: 12, scale: 2, null: false
      t.string  :status,          null: false, default: "en_venta" # sold, reserved, for_sale, for_rent

      # Location
      t.string  :address
      t.string  :city
      t.string  :state
      t.string  :coordinates      # e.g. "19.0436,-98.1981"

      # Media
      t.jsonb   :images,          null: false, default: []

      t.timestamps
    end

    # Indexes for search and filters
    add_index :properties, :featured
    add_index :properties, :property_type
    add_index :properties, :status
    add_index :properties, :city
    add_index :properties, :state
    add_index :properties, :price
    add_index :properties, :images, using: :gin

    # Constraints to avoid invalid values
    add_check_constraint :properties, "rooms >= 0",           name: "properties_rooms_non_negative"
    add_check_constraint :properties, "bathrooms >= 0",       name: "properties_bathrooms_non_negative"
    add_check_constraint :properties, "half_bathrooms >= 0",  name: "properties_half_bathrooms_non_negative"
    add_check_constraint :properties, "parking_spaces >= 0",  name: "properties_parking_spaces_non_negative"
    add_check_constraint :properties, "price >= 0",           name: "properties_price_non_negative"
    add_check_constraint :properties, "land_area >= 0",       name: "properties_land_area_non_negative",  validate: false
    add_check_constraint :properties, "built_area >= 0",      name: "properties_built_area_non_negative", validate: false
    add_check_constraint :properties, "(jsonb_typeof(images) = 'array')",
                         name: "properties_images_must_be_array"
  end
end
