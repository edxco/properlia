class DropStateAndCityStringColumns < ActiveRecord::Migration[7.0]
  def change
    remove_index :properties, :city
    remove_index :properties, :state
    remove_column :properties, :city, :string
    remove_column :properties, :state, :string

    remove_index :leads, :city
    remove_index :leads, :state
    remove_column :leads, :city, :string
    remove_column :leads, :state, :string
  end
end
