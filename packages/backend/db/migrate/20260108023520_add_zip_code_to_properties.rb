class AddZipCodeToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :zip_code, :string
    add_index :properties, :zip_code
  end
end
