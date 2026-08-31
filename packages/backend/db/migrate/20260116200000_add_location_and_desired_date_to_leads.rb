class AddLocationAndDesiredDateToLeads < ActiveRecord::Migration[7.0]
  def change
    add_column :leads, :desired_date, :date
    add_column :leads, :neighborhood, :string
    add_column :leads, :city, :string
    add_column :leads, :state, :string
    add_reference :leads, :property_type, type: :uuid, foreign_key: true, index: true

    # Add indexes for common queries
    add_index :leads, :city
    add_index :leads, :state
  end
end
