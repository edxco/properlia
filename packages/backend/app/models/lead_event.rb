class LeadEvent < ApplicationRecord
  # Associations
  belongs_to :lead
  belongs_to :created_by, class_name: 'User', foreign_key: 'created_by_user_id', optional: true

  # Validations
  validates :event_type, presence: true

  # Common event types
  EVENT_TYPES = %w[
    status_changed
    contacted
    assigned
    note_added
    email_sent
    call_made
    meeting_scheduled
    proposal_sent
    follow_up_scheduled
  ].freeze

  # Scopes
  scope :by_type, ->(type) { where(event_type: type) }
  scope :recent, -> { order(created_at: :desc) }
  scope :chronological, -> { order(created_at: :asc) }

  # Instance methods
  def status_change?
    event_type == 'status_changed'
  end

  def from_status
    metadata['from'] if status_change?
  end

  def to_status
    metadata['to'] if status_change?
  end
end
