module Api
  module V1
    class LeadsController < ApplicationController
      skip_before_action :authenticate_user!, only: %i[public_create]
      skip_before_action :reject_disabled_user!, only: %i[public_create]
      before_action :set_lead, only: %i[show update change_status assign record_contact]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/leads
      def index
        leads = Lead.all

        # Filter by status
        leads = leads.by_status(params[:status]) if params[:status].present?

        # Filter by assigned user
        leads = leads.assigned_to(params[:assigned_to_user_id]) if params[:assigned_to_user_id].present?

        # Filter by interest operation
        if params[:interest_operation].present?
          leads = leads.where(interest_operation: params[:interest_operation])
        end

        # Filter by property
        leads = leads.where(property_id: params[:property_id]) if params[:property_id].present?

        # Filter by source
        leads = leads.where(source: params[:source]) if params[:source].present?

        # Filter pending follow-ups
        if ActiveModel::Type::Boolean.new.cast(params[:pending_follow_up])
          leads = leads.pending_follow_up
        end

        @pagy, @leads = pagy(leads.recent)

        render json: {
          data: @leads.map { |lead| lead_json(lead) },
          metadata: {
            count: @pagy.count,
            page: @pagy.page,
            pages: @pagy.pages,
            next: @pagy.next,
            prev: @pagy.prev
          }
        }
      end

      # GET /api/v1/leads/:id
      def show
        render json: lead_json(@lead, include_events: true)
      end

      # POST /api/v1/leads
      def create
        lead = Lead.new(lead_params)

        if lead.save
          lead.record_event!('created', metadata: { source: lead.source })
          render json: lead_json(lead), status: :created
        else
          render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/leads/:id
      def update
        if @lead.update(lead_params)
          render json: lead_json(@lead), status: :ok
        else
          render json: { errors: @lead.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/leads/:id/change_status
      def change_status
        new_status = params[:status]
        reason = params[:reason]

        unless Lead.statuses.key?(new_status)
          return render json: { error: "Invalid status: #{new_status}" }, status: :unprocessable_entity
        end

        @lead.change_status!(new_status, reason: reason)
        render json: lead_json(@lead, include_events: true), status: :ok
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # POST /api/v1/leads/:id/assign
      def assign
        user = User.find(params[:user_id])
        @lead.assign_to!(user)
        render json: lead_json(@lead), status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :not_found
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # POST /api/v1/leads/:id/record_contact
      def record_contact
        @lead.record_contact!(
          method: params[:method],
          notes: params[:notes]
        )
        render json: lead_json(@lead, include_events: true), status: :ok
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # POST /api/v1/leads/public - Public endpoint for website forms
      def public_create
        lead = Lead.new(public_lead_params)

        if lead.save
          lead.record_event!('created', metadata: { source: lead.source })

          # Send consultation emails for buyer/seller forms
          send_consultation_emails(lead) if %w[buyer_form seller_form].include?(lead.source)

          render json: { message: 'Lead created successfully', id: lead.id }, status: :created
        else
          render json: { errors: lead.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_lead
        @lead = Lead.find(params[:id])
      end

      def lead_params
        params.require(:lead).permit(
          :full_name, :email, :phone, :source, :property_id, :property_type_id,
          :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term,
          :referrer_url, :landing_url, :interest_operation, :interest_property_type,
          :min_budget, :max_budget, :score, :notes, :assigned_to_user_id,
          :next_follow_up_at, :consent_marketing,
          :desired_date, :neighborhood, :city, :state,
          source_detail: {},
          images: []
        )
      end

      def public_lead_params
        params.require(:lead).permit(
          :full_name, :email, :phone, :source, :property_type_id,
          :interest_operation, :max_budget, :notes, :interest_property_type,
          :desired_date, :neighborhood, :city, :state,
          :consent_marketing,
          source_detail: {},
          images: []
        )
      end

      def send_consultation_emails(lead)
        form_type = lead.source == 'buyer_form' ? 'buyer' : 'seller'

        # Send email to admin (general_info.email_to)
        Thread.new do
          EmailService.send_consultation_admin_email(lead: lead, form_type: form_type)
        rescue StandardError => e
          Rails.logger.error "Failed to send consultation admin email: #{e.message}"
        end

        # Send confirmation email to user (if email provided)
        if lead.email.present?
          Thread.new do
            EmailService.send_consultation_confirmation_email(lead: lead, form_type: form_type)
          rescue StandardError => e
            Rails.logger.error "Failed to send consultation confirmation email: #{e.message}"
          end
        end
      end

      def lead_json(lead, include_events: false)
        json = {
          id: lead.id,
          full_name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          source_detail: lead.source_detail,
          status: lead.status,
          interest_operation: lead.interest_operation,
          interest_property_type: lead.interest_property_type,
          min_budget: lead.min_budget,
          max_budget: lead.max_budget,
          score: lead.score,
          notes: lead.notes,
          city: lead.city,
          state: lead.state,
          neighborhood: lead.neighborhood,
          desired_date: lead.desired_date,
          assigned_to_user_id: lead.assigned_to_user_id,
          next_follow_up_at: lead.next_follow_up_at,
          last_contacted_at: lead.last_contacted_at,
          contact_attempts: lead.contact_attempts,
          consent_marketing: lead.consent_marketing,
          property_id: lead.property_id,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          created_at: lead.created_at,
          updated_at: lead.updated_at
        }

        if lead.property
          json[:property] = {
            id: lead.property.id,
            title: lead.property.title
          }
        end

        if include_events
          json[:events] = lead.lead_events.recent.map { |event| lead_event_json(event) }
        end

        json
      end

      def lead_event_json(event)
        {
          id: event.id,
          event_type: event.event_type,
          metadata: event.metadata,
          created_by_user_id: event.created_by_user_id,
          created_at: event.created_at
        }
      end
    end
  end
end
