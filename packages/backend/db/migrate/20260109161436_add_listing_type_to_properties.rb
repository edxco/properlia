class AddListingTypeToProperties < ActiveRecord::Migration[7.0]
  def change
    # Add column allowing nulls first
    add_reference :properties, :listing_type, type: :uuid, null: true, foreign_key: true

    # Set a default listing type for existing properties
    reversible do |dir|
      dir.up do
        default_listing_type = execute("SELECT id FROM listing_types LIMIT 1").first
        if default_listing_type
          execute("UPDATE properties SET listing_type_id = '#{default_listing_type['id']}' WHERE listing_type_id IS NULL")
        end
      end
    end

    # Now add the not-null constraint
    change_column_null :properties, :listing_type_id, false
  end
end
