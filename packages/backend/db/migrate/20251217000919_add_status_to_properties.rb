class AddStatusToProperties < ActiveRecord::Migration[7.0]
  def change
    add_reference :properties, :status, foreign_key: true, type: :uuid

    # Remove the old status string column and its index
    remove_index :properties, :status
    remove_column :properties, :status, :string
  end
end
