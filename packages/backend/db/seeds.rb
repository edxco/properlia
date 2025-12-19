# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# Property Types
puts "Creating property types..."
PropertyType.create!([
  { name: 'departament', es_name: 'departamento' },
  { name: 'house', es_name: 'casa' },
  { name: 'land', es_name: 'terreno' },
  { name: 'retail space', es_name: 'local comercial' },
  { name: 'warehouse', es_name: 'bodega o nave' }
])
puts "Created #{PropertyType.count} property types"

# Statuses
puts "Creating statuses..."
Status.create!([
  { name: 'rent', es_name: 'renta' },
  { name: 'sell', es_name: 'venta' }
])
puts "Created #{Status.count} statuses"
