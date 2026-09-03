class AddStateAndCityToProperties < ActiveRecord::Migration[7.0]
  def change
    add_reference :properties, :state, type: :uuid, null: true, foreign_key: true
    add_reference :properties, :city, type: :uuid, null: true, foreign_key: true
  end
end
