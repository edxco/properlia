class AddImageOrderToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :image_order, :jsonb, default: [], null: false
  end
end
