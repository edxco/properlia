class AddOnHoldTrackingToProperties < ActiveRecord::Migration[7.0]
  def up
    add_column :properties, :on_hold_since, :datetime
    add_column :properties, :on_hold_reminded_at, :datetime

    execute <<~SQL
      UPDATE properties
      SET on_hold_since = properties.updated_at
      FROM statuses
      WHERE statuses.id = properties.status_id AND statuses.name = 'on-hold'
    SQL
  end

  def down
    remove_column :properties, :on_hold_reminded_at
    remove_column :properties, :on_hold_since
  end
end
