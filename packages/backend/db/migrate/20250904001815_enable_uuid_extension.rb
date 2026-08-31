# db/migrate/20250903_enable_uuid_extension.rb
class EnableUuidExtension < ActiveRecord::Migration[7.0]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')
  end
end
