class AddTitleEnToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :title_en, :string
  end
end
