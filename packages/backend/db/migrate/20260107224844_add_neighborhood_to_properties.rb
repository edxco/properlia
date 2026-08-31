class AddNeighborhoodToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :neighborhood, :string
    add_index :properties, :neighborhood
  end
end
