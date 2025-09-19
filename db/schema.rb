# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2025_09_04_002618) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "properties", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "featured", default: false, null: false
    t.string "title", null: false
    t.text "description"
    t.decimal "land_area", precision: 10, scale: 2
    t.decimal "built_area", precision: 10, scale: 2
    t.integer "rooms", default: 0, null: false
    t.integer "bathrooms", default: 0, null: false
    t.integer "half_bathrooms", default: 0, null: false
    t.integer "parking_spaces", default: 0, null: false
    t.string "property_type", null: false
    t.decimal "price", precision: 12, scale: 2, null: false
    t.string "status", default: "en_venta", null: false
    t.string "address"
    t.string "city"
    t.string "state"
    t.string "coordinates"
    t.jsonb "images", default: [], null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["city"], name: "index_properties_on_city"
    t.index ["featured"], name: "index_properties_on_featured"
    t.index ["images"], name: "index_properties_on_images", using: :gin
    t.index ["price"], name: "index_properties_on_price"
    t.index ["property_type"], name: "index_properties_on_property_type"
    t.index ["state"], name: "index_properties_on_state"
    t.index ["status"], name: "index_properties_on_status"
    t.check_constraint "bathrooms >= 0", name: "properties_bathrooms_non_negative"
    t.check_constraint "built_area >= 0::numeric", name: "properties_built_area_non_negative"
    t.check_constraint "half_bathrooms >= 0", name: "properties_half_bathrooms_non_negative"
    t.check_constraint "jsonb_typeof(images) = 'array'::text", name: "properties_images_must_be_array"
    t.check_constraint "land_area >= 0::numeric", name: "properties_land_area_non_negative"
    t.check_constraint "parking_spaces >= 0", name: "properties_parking_spaces_non_negative"
    t.check_constraint "price >= 0::numeric", name: "properties_price_non_negative"
    t.check_constraint "rooms >= 0", name: "properties_rooms_non_negative"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "role"
    t.string "jti", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
