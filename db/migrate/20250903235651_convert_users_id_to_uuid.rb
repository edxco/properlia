# db/migrate/20250903_convert_users_id_to_uuid.rb
class ConvertUsersIdToUuid < ActiveRecord::Migration[7.0]
  def up
    # 1) Asegura la extensión para generar UUIDs (pgcrypto)
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    # 2) Agrega columna temporal uuid con default y NOT NULL
    add_column :users, :uuid, :uuid, default: "gen_random_uuid()", null: false

    # 3) Sustituye la PK:
    #    - Quita la columna id antigua (bigint)
    #    - Renombra uuid -> id
    #    - Declara la nueva PK
    remove_column :users, :id
    rename_column :users, :uuid, :id
    execute "ALTER TABLE users ADD PRIMARY KEY (id);"
  end

  def down
    # Revertir esto implica recrear un bigint id y re-mapear registros.
    # Para mantenerlo seguro y explícito:
    raise ActiveRecord::IrreversibleMigration, "users.id -> uuid no es reversible automáticamente"
  end
end
