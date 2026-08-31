class AddPropertyTypeRelationshipToProperties < ActiveRecord::Migration[7.0]
  def up
    # Add the new foreign key column
    add_reference :properties, :property_type, type: :uuid, foreign_key: true

    # Migrate existing data from string column to the new relationship
    # This matches property_type string values with PropertyType records by name
    execute <<-SQL
      UPDATE properties
      SET property_type_id = property_types.id
      FROM property_types
      WHERE LOWER(properties.property_type) = property_types.name
    SQL

    # Remove the old index
    remove_index :properties, :property_type if index_exists?(:properties, :property_type)

    # Remove the old string column
    remove_column :properties, :property_type, :string
  end

  def down
    # Add back the old string column
    add_column :properties, :property_type, :string, null: false, default: ''
    add_index :properties, :property_type

    # Migrate data back from relationship to string column
    execute <<-SQL
      UPDATE properties
      SET property_type = property_types.name
      FROM property_types
      WHERE properties.property_type_id = property_types.id
    SQL

    # Remove the foreign key and column
    remove_reference :properties, :property_type, foreign_key: true
  end
end
