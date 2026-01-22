class CreatePropertiesPropertyFeaturesJoinTable < ActiveRecord::Migration[7.0]
  def change
    create_table :properties_property_features, id: false do |t|
      t.uuid :property_id, null: false
      t.uuid :property_feature_id, null: false
    end

    add_index :properties_property_features, [:property_id, :property_feature_id],
              unique: true, name: 'idx_props_prop_features_unique'
    add_index :properties_property_features, :property_feature_id,
              name: 'idx_props_prop_features_on_feature'

    add_foreign_key :properties_property_features, :properties
    add_foreign_key :properties_property_features, :property_features
  end
end
