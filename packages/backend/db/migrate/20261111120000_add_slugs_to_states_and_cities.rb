class AddSlugsToStatesAndCities < ActiveRecord::Migration[7.0]
  class MigrationState < ActiveRecord::Base
    self.table_name = 'states'
  end

  class MigrationCity < ActiveRecord::Base
    self.table_name = 'cities'
  end

  def up
    %i[states cities].each do |table|
      add_column table, :slug, :string
      add_column table, :slug_en, :string
      add_column table, :previous_slugs, :string, array: true, default: [], null: false
    end

    MigrationState.reset_column_information
    MigrationCity.reset_column_information

    backfill(MigrationState.order(:created_at, :id).to_a)
    MigrationCity.order(:created_at, :id).group_by(&:state_id).each_value { |cities| backfill(cities) }

    %i[states cities].each do |table|
      change_column_null table, :slug, false
      change_column_null table, :slug_en, false
    end

    add_index :states, :slug, unique: true
    add_index :states, :slug_en, unique: true
    add_index :cities, %i[state_id slug], unique: true
    add_index :cities, %i[state_id slug_en], unique: true
  end

  def down
    %i[states cities].each do |table|
      remove_column table, :slug
      remove_column table, :slug_en
      remove_column table, :previous_slugs
    end
  end

  private

  def backfill(records)
    taken = { slug: [], slug_en: [] }
    records.each do |record|
      slug = Slugger.unique(Slugger.slugify(record.es_name.presence || record.name), taken[:slug])
      slug_en = Slugger.unique(Slugger.slugify(record.name.presence || record.es_name), taken[:slug_en])
      record.update_columns(slug: slug, slug_en: slug_en)
      taken[:slug] << slug
      taken[:slug_en] << slug_en
    end
  end
end
