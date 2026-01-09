class AddListingTypeToProperties < ActiveRecord::Migration[7.0]
  def change
    add_reference :properties, :listing_type, type: :uuid, null: false, foreign_key: true
  end
end
