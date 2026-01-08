# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# Property Types
puts "Creating property types..."
property_types = [
  { name: 'departament', es_name: 'departamento' },
  { name: 'house', es_name: 'casa' },
  { name: 'land', es_name: 'terreno' },
  { name: 'retail space', es_name: 'local comercial' },
  { name: 'warehouse', es_name: 'bodega o nave' }
]

property_types.each do |pt|
  PropertyType.find_or_create_by!(name: pt[:name]) do |property_type|
    property_type.es_name = pt[:es_name]
  end rescue ActiveRecord::RecordInvalid
end
puts "Property types ready: #{PropertyType.count}"

# Statuses
puts "Creating statuses..."
statuses = [
  { name: 'rent', es_name: 'renta' },
  { name: 'sell', es_name: 'venta' }
]

statuses.each do |s|
  Status.find_or_create_by!(name: s[:name]) do |status|
    status.es_name = s[:es_name]
  end rescue ActiveRecord::RecordInvalid
end
puts "Statuses ready: #{Status.count}"

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
