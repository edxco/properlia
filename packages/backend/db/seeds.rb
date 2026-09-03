# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# Admin dummy user (dashboard login) - local development only, never stage/production
if Rails.env.development?
  puts "Creating admin user..."
  admin_email = ENV.fetch("ADMIN_SEED_EMAIL", "admin@properlia.com")
  admin_password = ENV.fetch("ADMIN_SEED_PASSWORD", "password123")

  admin = User.find_or_initialize_by(email: admin_email)
  admin.assign_attributes(
    name: "Admin",
    role: "admin",
    enabled: true
  )
  if admin.new_record?
    admin.password = admin_password
    admin.password_confirmation = admin_password
  end
  admin.save!
  puts "Admin user ready: #{admin.email} / role=#{admin.role}"
else
  puts "Skipping admin dummy user seed (Rails.env=#{Rails.env})"
end

# Property Types with standardized UUIDs
# These UUIDs will remain consistent across all environments
puts "Creating property types..."
PROPERTY_TYPE_IDS = {
  department: '0221da24-d7df-4052-a63d-2d16501ec360',
  house: '6431658b-1ebc-4805-ac61-97bf39699353',
  land: '23d3905f-a5c1-4372-995e-362b2c10f77f',
  retail_space: '044af3c1-7cea-4ec5-86e7-07b10afdb147',
  warehouse: '37beb05a-ff6a-4138-8959-c2c9be60e6f5',
  doctor_office: '7f91886c-4822-4a9d-9f44-867c8702951b',
  office: '1b89a6d4-83e3-4c55-9852-64f33060d034'
}.freeze

property_types = [
  { id: PROPERTY_TYPE_IDS[:department], name: 'department', es_name: 'departamento' },
  { id: PROPERTY_TYPE_IDS[:house], name: 'house', es_name: 'casa' },
  { id: PROPERTY_TYPE_IDS[:land], name: 'land', es_name: 'terreno' },
  { id: PROPERTY_TYPE_IDS[:retail_space], name: 'retail space', es_name: 'local comercial' },
  { id: PROPERTY_TYPE_IDS[:warehouse], name: 'warehouse', es_name: 'bodega o nave' },
  { id: PROPERTY_TYPE_IDS[:doctor_office], name: 'doctor office', es_name: 'consultorio' },
  { id: PROPERTY_TYPE_IDS[:office], name: 'office', es_name: 'oficina' }
]

property_types.each do |pt|
  PropertyType.find_or_create_by!(id: pt[:id]) do |property_type|
    property_type.name = pt[:name]
    property_type.es_name = pt[:es_name]
  end
end
puts "Property types ready: #{PropertyType.count}"

# Statuses with standardized UUIDs
# These UUIDs will remain consistent across all environments
puts "Creating statuses..."
statuses = [
  { id: '4470cd78-8e77-40de-b702-15c6b4ca473d', es_name: 'activa', name: 'active' },
  { id: '8f3bd072-51dd-4d16-b1b5-5bcc11e372f1', es_name: 'apartada', name: 'on-hold' },
  { id: '9f3b6e4a-2c7d-4a8a-9c1d-6e7f8a2b5c31', es_name: 'vendida', name: 'sold' },
  { id: 'c1a8e5d4-9b62-4f3e-8a71-2d6c9f0e4b58', es_name: 'rentada', name: 'leased' },
  { id: '7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64', es_name: 'suspendida', name: 'suspended' },
  { id: 'e2b6a9d1-5c4f-4e7a-8b3d-0f9a6c1e52d8', es_name: 'expirada', name: 'expired' }
]

statuses.each do |s|
  Status.find_or_create_by!(id: s[:id]) do |status|
    status.name = s[:name]
    status.es_name = s[:es_name]
  end
end
puts "Statuses ready: #{Status.count}"

# Listing Types with standardized UUIDs
# These UUIDs will remain consistent across all environments
puts "Creating listing types..."
listing_types = [
  { id: 'a7f8e2d1-3c4b-5a6e-9f8d-7c1b2a3e4f5d', es_name: 'preventa', name: 'pre-sale' },
  { id: 'b8e9f3d2-4c5a-6b7e-0f9e-8d2c3b4e5f6a', es_name: 'venta', name: 'sale' },
  { id: 'c9f0e4d3-5c6b-7a8e-1f0e-9d3c4b5e6f7b', es_name: 'renta', name: 'rent' }
]

listing_types.each do |lt|
  ListingType.find_or_create_by!(id: lt[:id]) do |listing_type|
    listing_type.name = lt[:name]
    listing_type.es_name = lt[:es_name]
  end
end
puts "Listing types ready: #{ListingType.count}"

# States (the 32 Mexican states, including Mexico City) with standardized UUIDs
# These UUIDs will remain consistent across all environments
puts "Creating states..."
states = [
  { id: 'd2839c02-6342-4419-b4fa-b6fb7b7f869b', name: 'Aguascalientes', es_name: 'Aguascalientes' },
  { id: '5cc9d28f-9c40-46f9-9955-a8bacccde615', name: 'Baja California', es_name: 'Baja California' },
  { id: '56b6ab08-2af4-4255-b73c-df0eb2fc0a97', name: 'Baja California Sur', es_name: 'Baja California Sur' },
  { id: 'adbd9bdb-d27a-4a2e-a74b-4f697cb4286c', name: 'Campeche', es_name: 'Campeche' },
  { id: '2df2fb8d-3ba7-48ef-b441-86252e64b30d', name: 'Chiapas', es_name: 'Chiapas' },
  { id: 'b8faca15-caf9-4f37-a215-a9cbc465813d', name: 'Chihuahua', es_name: 'Chihuahua' },
  { id: 'a6fba6a4-40c0-4c5d-b740-c20605a89648', name: 'Mexico City', es_name: 'Ciudad de México' },
  { id: 'e570cd27-ee47-4c5b-91b8-52c29a4e9b5f', name: 'Coahuila', es_name: 'Coahuila' },
  { id: '516a8fa2-7fe7-4cf6-b4c1-3189e4a99ae4', name: 'Colima', es_name: 'Colima' },
  { id: 'd3b58783-656a-4ee1-a034-a7a738139951', name: 'Durango', es_name: 'Durango' },
  { id: 'feea1a40-fc3c-4f47-ba28-d0feeb424695', name: 'Guanajuato', es_name: 'Guanajuato' },
  { id: 'b453dbc4-1b79-4194-8686-5dc9d747ac23', name: 'Guerrero', es_name: 'Guerrero' },
  { id: 'bac94fbd-e4f0-423f-8f7e-f9b5e68ed8bf', name: 'Hidalgo', es_name: 'Hidalgo' },
  { id: 'aa49ac7e-7fd4-4fe4-af0e-907d5264cd85', name: 'Jalisco', es_name: 'Jalisco' },
  { id: '08c7299d-82b5-49e1-9ab6-d455e2593f0a', name: 'State of Mexico', es_name: 'Estado de México' },
  { id: '115552b0-291d-41df-b3e2-f9332b95f937', name: 'Michoacan', es_name: 'Michoacán' },
  { id: 'fd61d5a8-5670-4886-81d7-01f6b22580b3', name: 'Morelos', es_name: 'Morelos' },
  { id: '382fc6a3-4127-4951-801c-08ad70b2ac24', name: 'Nayarit', es_name: 'Nayarit' },
  { id: '72e4f770-16d4-428a-8f2f-b8ac64e2edb9', name: 'Nuevo Leon', es_name: 'Nuevo León' },
  { id: 'd7f58812-6cf0-4914-8cd5-829052b9326d', name: 'Oaxaca', es_name: 'Oaxaca' },
  { id: '18806e68-2870-4fb3-8294-62448b8bbe8d', name: 'Puebla', es_name: 'Puebla' },
  { id: 'f3f96243-81d3-40d4-a518-9cdf26fe3b6e', name: 'Queretaro', es_name: 'Querétaro' },
  { id: '1c0f17e8-5426-4772-af51-161c8d18e74b', name: 'Quintana Roo', es_name: 'Quintana Roo' },
  { id: '3b4d92e1-2756-4e95-a5dd-e0dd83a5f89d', name: 'San Luis Potosi', es_name: 'San Luis Potosí' },
  { id: 'c7913ec1-eb97-46b1-ba0d-638e5a448526', name: 'Sinaloa', es_name: 'Sinaloa' },
  { id: 'ca131814-ba8e-4038-a722-e1a88f1299c2', name: 'Sonora', es_name: 'Sonora' },
  { id: 'e5083e79-852c-4c20-afa7-b2b92b48a9ae', name: 'Tabasco', es_name: 'Tabasco' },
  { id: '22d46033-5839-4e05-a54e-56e9ca9581b2', name: 'Tamaulipas', es_name: 'Tamaulipas' },
  { id: 'd0ca64bc-50ac-4167-bc33-fab34b5473a1', name: 'Tlaxcala', es_name: 'Tlaxcala' },
  { id: '4b56b52f-2a0d-418e-b134-78d3e1f6c1c3', name: 'Veracruz', es_name: 'Veracruz' },
  { id: 'c9735b42-e475-468e-8950-205c75fefcc2', name: 'Yucatan', es_name: 'Yucatán' },
  { id: 'c143a96c-57e6-470d-824d-1c3ef7a50d2e', name: 'Zacatecas', es_name: 'Zacatecas' }
]

states.each do |s|
  State.find_or_create_by!(id: s[:id]) do |state|
    state.name = s[:name]
    state.es_name = s[:es_name]
  end
end
puts "States ready: #{State.count}"

# Cities for Puebla with standardized UUIDs
# These UUIDs will remain consistent across all environments
puts "Creating cities for Puebla..."
PUEBLA_STATE_ID = '18806e68-2870-4fb3-8294-62448b8bbe8d'

puebla_cities = [
  { id: '06faf67b-9019-47ec-bb1b-f352c49df4f5', name: 'Puebla', es_name: 'Puebla' },
  { id: 'a2ab8864-12c4-4173-b432-2b82c4a9e36d', name: 'Tehuacan', es_name: 'Tehuacán' },
  { id: '19af4f1a-fa72-4ed9-941c-6d11f6d91fa2', name: 'San Andres Cholula', es_name: 'San Andrés Cholula' },
  { id: '13801309-0e23-4539-a5c4-a3cb7fa1cfc9', name: 'San Pedro Cholula', es_name: 'San Pedro Cholula' },
  { id: 'c540e5e0-375d-4cd1-816b-0a17081b9df5', name: 'Atlixco', es_name: 'Atlixco' },
  { id: 'a63f7159-6f80-4d14-b722-41d60c5f1f0b', name: 'San Martin Texmelucan', es_name: 'San Martín Texmelucan' },
  { id: '412f864c-5080-45ad-868c-e025fc5f46bc', name: 'Teziutlan', es_name: 'Teziutlán' },
  { id: 'f09312d9-2800-424f-b16d-1c69e3e2edf9', name: 'Huauchinango', es_name: 'Huauchinango' },
  { id: 'd68a9094-a760-40e8-9ec7-50d31e6be0c4', name: 'Zacatlan', es_name: 'Zacatlán' },
  { id: 'b7ae6e3d-6b17-44ae-9ce2-16e7b4d96e76', name: 'Cuautlancingo', es_name: 'Cuautlancingo' },
  { id: '8154706c-5e42-415b-a673-00391ada66b1', name: 'Santa Clara Ocoyucan', es_name: 'Santa Clara Ocoyucan' }
]

puebla_cities.each do |c|
  City.find_or_create_by!(id: c[:id]) do |city|
    city.state_id = PUEBLA_STATE_ID
    city.name = c[:name]
    city.es_name = c[:es_name]
  end
end
puts "Cities ready: #{City.where(state_id: PUEBLA_STATE_ID).count}"

# General Info (Contact Information)
puts "Creating general info..."
if GeneralInfo.exists?
  puts "General info already exists, skipping..."
else
  GeneralInfo.create!(
    phone: '+52 1234567890',
    whatsapp: '+52 1234567890',
    email_to: 'contact@properlia.com',
    singleton_guard: 0
  )
  puts "General info created successfully"
end
puts "General info ready"

# Property Category IDs (fixed UUIDs for consistency across environments)
RESIDENTIAL_CATEGORY_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
COMMERCIAL_CATEGORY_ID  = "70928012-73a7-4790-9556-9a25b29b6e82"
INDUSTRIAL_CATEGORY_ID  = "e49a8880-60b6-4550-9831-2746498c09d5"

puts "--- Seeding Property Categories ---"

categories = [
  {
    id: RESIDENTIAL_CATEGORY_ID,
    slug: "residential",
    name: "Residential",
    es_name: "Residencial"
  },
  {
    id: COMMERCIAL_CATEGORY_ID,
    slug: "commercial",
    name: "Commercial",
    es_name: "Comercial"
  },
  {
    id: INDUSTRIAL_CATEGORY_ID,
    slug: "industrial",
    name: "Industrial",
    es_name: "Industrial"
  }
]

categories.each do |cat_data|
  category = PropertyCategory.find_or_initialize_by(id: cat_data[:id])
  category.update!(
    slug: cat_data[:slug],
    name: cat_data[:name],
    es_name: cat_data[:es_name]
  )
  puts "Seeded Category: #{category.name} / #{category.es_name}"
end

puts "\n--- Linking Property Types to Categories (Many-to-Many) ---"

# Define which categories each property type belongs to
# Land belongs to ALL THREE categories (residential, commercial, industrial)
property_type_category_mappings = {
  # Residential only
  PROPERTY_TYPE_IDS[:house] => [RESIDENTIAL_CATEGORY_ID],
  PROPERTY_TYPE_IDS[:department] => [RESIDENTIAL_CATEGORY_ID],

  # Commercial only
  PROPERTY_TYPE_IDS[:retail_space] => [COMMERCIAL_CATEGORY_ID],
  PROPERTY_TYPE_IDS[:office] => [COMMERCIAL_CATEGORY_ID],
  PROPERTY_TYPE_IDS[:doctor_office] => [COMMERCIAL_CATEGORY_ID],

  # Industrial only
  PROPERTY_TYPE_IDS[:warehouse] => [INDUSTRIAL_CATEGORY_ID],

  # Land belongs to ALL categories (residential, commercial, industrial)
  PROPERTY_TYPE_IDS[:land] => [RESIDENTIAL_CATEGORY_ID, COMMERCIAL_CATEGORY_ID, INDUSTRIAL_CATEGORY_ID]
}

property_type_category_mappings.each do |property_type_id, category_ids|
  property_type = PropertyType.find(property_type_id)

  # Clear existing associations and set new ones
  property_type.property_category_ids = category_ids

  category_names = property_type.property_categories.pluck(:name).join(", ")
  puts "  - #{property_type.name} -> [#{category_names}]"
end

puts "\nSuccess: All property types and categories are mapped."
puts "Note: Land is linked to Residential, Commercial, AND Industrial categories."

