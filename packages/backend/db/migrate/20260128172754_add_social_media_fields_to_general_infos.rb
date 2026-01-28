class AddSocialMediaFieldsToGeneralInfos < ActiveRecord::Migration[7.0]
  def change
    add_column :general_infos, :instagram, :string
    add_column :general_infos, :tiktok, :string
    add_column :general_infos, :linkedin, :string
    add_column :general_infos, :facebook, :string
    add_column :general_infos, :email_contact, :string
  end
end
