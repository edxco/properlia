# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# Property Types with standardized UUIDs
# These UUIDs will remain consistent across all environments
puts "Creating property types..."
property_types = [
  { id: '0221da24-d7df-4052-a63d-2d16501ec360', name: 'departament', es_name: 'departamento' },
  { id: '6431658b-1ebc-4805-ac61-97bf39699353', name: 'house', es_name: 'casa' },
  { id: '23d3905f-a5c1-4372-995e-362b2c10f77f', name: 'land', es_name: 'terreno' },
  { id: '044af3c1-7cea-4ec5-86e7-07b10afdb147', name: 'retail space', es_name: 'local comercial' },
  { id: '37beb05a-ff6a-4138-8959-c2c9be60e6f5', name: 'warehouse', es_name: 'bodega o nave' }
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
