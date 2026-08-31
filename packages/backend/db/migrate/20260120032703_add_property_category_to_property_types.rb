class AddPropertyCategoryToPropertyTypes < ActiveRecord::Migration[7.0]
  def change
        add_reference :property_types, :property_category, type: :uuid, null: true, foreign_key: true
  end
end
