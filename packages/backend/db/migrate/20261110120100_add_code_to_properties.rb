class AddCodeToProperties < ActiveRecord::Migration[7.0]
  class MigrationProperty < ActiveRecord::Base
    self.table_name = 'properties'
  end

  def up
    add_column :properties, :code_number, :bigserial
    add_column :properties, :code, :string

    MigrationProperty.reset_column_information
    city_codes = select_rows('SELECT id, code FROM cities').to_h
    type_names = select_rows('SELECT id, name FROM property_types').to_h

    MigrationProperty.order(:created_at, :id).each_with_index do |property, index|
      number = index + 1
      letter = PropertyType::CODE_LETTERS.fetch(PropertyType.segment_for(type_names[property.property_type_id]))
      code = PropertyCodeGenerator.format_code(city_code: city_codes[property.city_id], type_letter: letter, number: number)
      property.update_columns(code_number: number, code: code)
    end

    execute <<~SQL
      SELECT setval(pg_get_serial_sequence('properties', 'code_number'),
                    COALESCE((SELECT MAX(code_number) FROM properties), 0) + 1, false)
    SQL

    change_column_null :properties, :code, false
    add_index :properties, :code, unique: true
    add_index :properties, :code_number, unique: true
  end

  def down
    remove_column :properties, :code
    remove_column :properties, :code_number
  end
end
