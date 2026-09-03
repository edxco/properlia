# app/controllers/api/v1/states_controller.rb
module Api
  module V1
    class StatesController < ApplicationController
      skip_before_action :authenticate_user!, only: %i[index show]
      skip_before_action :reject_disabled_user!, only: %i[index show]
      before_action :set_state, only: %i[show update destroy]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/states
      def index
        pagy_options = {}
        pagy_options[:limit] = params[:items].to_i if params[:items].present? && params[:items].to_i.positive?

        @pagy, @states = pagy(State.all.order(:es_name), **pagy_options)

        render json: {
          data: @states,
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
          }
        }
      end

      # GET /api/v1/states/:id
      def show
        render json: @state
      end

      # POST /api/v1/states
      def create
        state = State.new(state_params)

        if state.save
          render json: state, status: :created
        else
          render json: { errors: state.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/states/:id
      def update
        if @state.update(state_params)
          render json: @state, status: :ok
        else
          render json: { errors: @state.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/states/:id
      def destroy
        if @state.cities.exists? || @state.properties.exists? || @state.leads.exists?
          render json: {
            error: 'Cannot delete state because it has cities, properties, or leads assigned'
          }, status: :unprocessable_entity
        elsif @state.destroy
          render json: { message: 'State deleted successfully' }, status: :ok
        else
          render json: { errors: @state.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_state
        @state = State.find(params[:id])
      end

      def state_params
        params.require(:state).permit(:name, :es_name)
      end
    end
  end
end
