module Api
  module V1
    class LeadEventsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_lead
      before_action :set_lead_event, only: [:show]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/leads/:lead_id/events
      def index
        events = @lead.lead_events

        # Filter by event type
        events = events.by_type(params[:event_type]) if params[:event_type].present?

        @pagy, @events = pagy(events.recent)

        render json: {
          data: @events.map { |event| event_json(event) },
          metadata: {
            count: @pagy.count,
            page: @pagy.page,
            pages: @pagy.pages,
            next: @pagy.next,
            prev: @pagy.prev
          }
        }
      end

      # GET /api/v1/leads/:lead_id/events/:id
      def show
        render json: event_json(@lead_event)
      end

      # POST /api/v1/leads/:lead_id/events
      def create
        event = @lead.lead_events.new(event_params)

        if event.save
          render json: event_json(event), status: :created
        else
          render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_lead
        @lead = Lead.find(params[:lead_id])
      end

      def set_lead_event
        @lead_event = @lead.lead_events.find(params[:id])
      end

      def event_params
        params.require(:lead_event).permit(:event_type, metadata: {})
      end

      def event_json(event)
        {
          id: event.id,
          lead_id: event.lead_id,
          event_type: event.event_type,
          metadata: event.metadata,
          created_by_user_id: event.created_by_user_id,
          created_at: event.created_at,
          updated_at: event.updated_at
        }
      end
    end
  end
end
