class CreatePropertyCategoriesPropertyTypesJoinTable < ActiveRecord::Migration[7.0]
  def change
    # ===========================================
    # Join table: PropertyType <-> PropertyCategory
    # Defines which categories are AVAILABLE for each property type
    # (e.g., Land can be listed under residential, commercial, or industrial)
    # ===========================================
    create_table :property_categories_property_types, id: false do |t|
      t.uuid :property_category_id, null: false
      t.uuid :property_type_id, null: false
    end

    add_index :property_categories_property_types,
              [:property_category_id, :property_type_id],
              unique: true,
              name: 'idx_prop_cat_prop_type_unique'

    add_index :property_categories_property_types,
              :property_type_id,
              name: 'idx_prop_cat_prop_type_on_type'

    add_foreign_key :property_categories_property_types,
                    :property_categories,
                    column: :property_category_id

    add_foreign_key :property_categories_property_types,
                    :property_types,
                    column: :property_type_id

    # Remove the old single category foreign key from property_types
    remove_reference :property_types, :property_category, foreign_key: true, type: :uuid

    # ===========================================
    # Join table: Property <-> PropertyCategory
    # User SELECTS which categories apply to each listing
    # (e.g., a Land listing might be residential + commercial)
    # ===========================================
    create_table :properties_property_categories, id: false do |t|
      t.uuid :property_id, null: false
      t.uuid :property_category_id, null: false
    end

    add_index :properties_property_categories,
              [:property_id, :property_category_id],
              unique: true,
              name: 'idx_props_prop_cats_unique'

    add_index :properties_property_categories,
              :property_category_id,
              name: 'idx_props_prop_cats_on_category'

    add_foreign_key :properties_property_categories,
                    :properties,
                    column: :property_id

    add_foreign_key :properties_property_categories,
                    :property_categories,
                    column: :property_category_id
  end
end
