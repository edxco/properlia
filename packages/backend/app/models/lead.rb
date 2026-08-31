class Lead < ApplicationRecord
  # Associations
  belongs_to :property, optional: true
  belongs_to :property_type, optional: true
  belongs_to :assigned_to, class_name: 'User', foreign_key: 'assigned_to_user_id', optional: true
  belongs_to :created_by, class_name: 'User', foreign_key: 'created_by_user_id', optional: true

  has_many :lead_events, dependent: :destroy
  has_many_attached :images

  # Enums
  enum :status, {
    new_lead: 0,
    contacted: 1,
    qualified: 2,
    proposal: 3,
    negotiation: 4,
    won: 5,
    lost: 6,
    unqualified: 7
  }, prefix: true

  enum :interest_operation, {
    buy: 0,
    rent: 1,
    invest: 2,
    sell: 3
  }, prefix: true

  # Validations
  validates :full_name, presence: true
  validates :source, presence: true
  validates :interest_operation, presence: true
  validates :email_normalized, uniqueness: { allow_nil: true, message: 'already has a consultation request' }
  validates :phone_e164, uniqueness: { allow_nil: true, message: 'already has a consultation request' }
  validate :email_or_phone_present

  # Callbacks
  before_validation :normalize_email, :normalize_phone

  # Scopes
  scope :pending_follow_up, -> { where('next_follow_up_at <= ?', Time.current) }
  scope :assigned_to, ->(user_id) { where(assigned_to_user_id: user_id) }
  scope :by_status, ->(status) { where(status: status) }
  scope :recent, -> { order(created_at: :desc) }

  # Instance methods
  def change_status!(new_status, user: nil, reason: nil)
    old_status = status
    return if old_status == new_status.to_s

    transaction do
      update!(status: new_status)
      record_event!(
        'status_changed',
        user: user,
        metadata: { from: old_status, to: new_status.to_s, reason: reason }.compact
      )
    end
  end

  def record_event!(event_type, user: nil, metadata: {})
    lead_events.create!(
      event_type: event_type,
      metadata: metadata,
      created_by_user_id: user&.id
    )
  end

  def record_contact!(user: nil, method: nil, notes: nil)
    transaction do
      update!(
        last_contacted_at: Time.current,
        contact_attempts: contact_attempts + 1
      )
      record_event!(
        'contacted',
        user: user,
        metadata: { method: method, notes: notes }.compact
      )
    end
  end

  def assign_to!(user, assigned_by: nil)
    old_assignee_id = assigned_to_user_id
    transaction do
      update!(assigned_to_user_id: user.id)
      record_event!(
        'assigned',
        user: assigned_by,
        metadata: { from_user_id: old_assignee_id, to_user_id: user.id }.compact
      )
    end
  end

  private

  def email_or_phone_present
    if email_normalized.blank? && phone_e164.blank?
      errors.add(:base, 'Either email or phone must be provided')
    end
  end

  def normalize_email
    return if email.blank?

    self.email_normalized = email.downcase.strip
  end

  def normalize_phone
    return if phone.blank?

    # Basic normalization - remove non-digits except leading +
    cleaned = phone.gsub(/[^\d+]/, '')
    self.phone_e164 = cleaned.start_with?('+') ? cleaned : "+#{cleaned}"
  end
end
