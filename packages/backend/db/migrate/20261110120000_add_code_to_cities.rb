class AddCodeToCities < ActiveRecord::Migration[7.0]
  class MigrationCity < ActiveRecord::Base
    self.table_name = 'cities'
  end

  def up
    add_column :cities, :code, :string, limit: 3

    taken = []
    MigrationCity.reset_column_information
    MigrationCity.order(:created_at).each do |city|
      code = CityCodeGenerator.generate(city.es_name.presence || city.name, taken: taken)
      city.update_columns(code: code)
      taken << code
    end

    change_column_null :cities, :code, false
    add_index :cities, :code, unique: true
  end

  def down
    remove_column :cities, :code
  end
end
