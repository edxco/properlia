class AddExclusiveListingToProperties < ActiveRecord::Migration[7.0]
  def change
    add_column :properties, :exclusive_listing, :boolean, default: true, null: false
  end
end
