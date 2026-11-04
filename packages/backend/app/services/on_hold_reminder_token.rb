class OnHoldReminderToken
  ACTIONS = %w[keep sold].freeze
  PURPOSE = :on_hold_reminder
  EXPIRES_IN = 7.days

  class << self
    def generate(property, action)
      raise ArgumentError, "Unknown action: #{action}" unless ACTIONS.include?(action)

      verifier.generate({ 'property_id' => property.id, 'action' => action },
                        purpose: PURPOSE, expires_in: EXPIRES_IN)
    end

    # Returns { 'property_id' =>, 'action' => } or nil when invalid/expired
    def verify(token)
      payload = verifier.verified(token.to_s, purpose: PURPOSE)
      payload if payload.is_a?(Hash) && ACTIONS.include?(payload['action'])
    end

    private

    def verifier
      Rails.application.message_verifier(PURPOSE)
    end
  end
end
