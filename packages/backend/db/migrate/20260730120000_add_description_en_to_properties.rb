class AddDescriptionEnToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :description_en, :text
  end
end
