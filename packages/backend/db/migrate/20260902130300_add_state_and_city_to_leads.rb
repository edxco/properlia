class AddStateAndCityToLeads < ActiveRecord::Migration[7.0]
  def change
    add_reference :leads, :state, type: :uuid, null: true, foreign_key: true
    add_reference :leads, :city, type: :uuid, null: true, foreign_key: true
  end
end
