class AddEnabledToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :enabled, :boolean, default: true, null: false
    add_index  :users, :enabled
  end
end