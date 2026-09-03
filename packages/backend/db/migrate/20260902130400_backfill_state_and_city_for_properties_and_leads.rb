class BackfillStateAndCityForPropertiesAndLeads < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  class MigState < ActiveRecord::Base
    self.table_name = 'states'
  end

  class MigCity < ActiveRecord::Base
    self.table_name = 'cities'
  end

  class MigProperty < ActiveRecord::Base
    self.table_name = 'properties'
  end

  class MigLead < ActiveRecord::Base
    self.table_name = 'leads'
  end

  def up
    unless table_exists?(:unmatched_state_city_backfill)
      create_table :unmatched_state_city_backfill, id: :uuid do |t|
        t.string :source_table, null: false
        t.uuid :source_id, null: false
        t.string :original_state
        t.string :original_city
        t.timestamps
      end
    end

    states = MigState.all.to_a
    unmatched_count = 0

    [MigProperty, MigLead].each do |klass|
      klass.find_each do |record|
        next if record.state.blank? && record.city.blank?

        state = find_state(states, record.state)

        if state.nil?
          UnmatchedStateCityBackfillRow.create!(
            source_table: klass.table_name,
            source_id: record.id,
            original_state: record.state,
            original_city: record.city
          )
          unmatched_count += 1
          next
        end

        city = find_or_create_city(state, record.city)
        record.update_columns(state_id: state.id, city_id: city&.id)
      end
    end

    if unmatched_count.positive?
      Rails.logger.warn(
        "[BackfillStateAndCity] #{unmatched_count} row(s) could not be matched to a " \
        "seeded state - see the unmatched_state_city_backfill table. Fix these by hand " \
        "(update the source row's state_id/city_id, or add a missing state) BEFORE " \
        "running the column-drop migration."
      )
    end
  end

  def down
    drop_table :unmatched_state_city_backfill, if_exists: true
  end

  private

  class UnmatchedStateCityBackfillRow < ActiveRecord::Base
    self.table_name = 'unmatched_state_city_backfill'
  end

  def find_state(states, raw)
    return nil if raw.blank?

    normalized = normalize(raw)
    states.find { |s| normalize(s.name) == normalized || normalize(s.es_name) == normalized }
  end

  def find_or_create_city(state, raw)
    return nil if raw.blank?

    normalized = normalize(raw)
    existing = MigCity.where(state_id: state.id).to_a.find { |c| normalize(c.name) == normalized }
    return existing if existing

    display_name = raw.to_s.strip.split(/\s+/).map(&:capitalize).join(' ')
    MigCity.create!(state_id: state.id, name: display_name, es_name: display_name)
  end

  def normalize(str)
    str.to_s.unicode_normalize(:nfd).gsub(/[\u0300-\u036f]/, '').downcase.strip
  end
end
