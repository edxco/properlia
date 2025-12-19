# app/controllers/api/v1/statuses_controller.rb
module Api
  module V1
    class StatusesController < ApplicationController
      skip_before_action :authenticate_user!, only: [:index, :show]
      before_action :set_status, only: %i[show update destroy]
      after_action { pagy_headers_merge(@pagy) if @pagy }

      # GET /api/v1/statuses
      def index
        @pagy, @statuses = pagy(Status.all.order(created_at: :asc))

        render json: {
          data: @statuses,
          metadata: {
            count: @pagy.count,
            page:  @pagy.page,
            pages: @pagy.pages,
            next:  @pagy.next,
            prev:  @pagy.prev
          }
        }
      end

      # GET /api/v1/statuses/:id
      def show
        render json: @status
      end

      # POST /api/v1/statuses
      def create
        status = Status.new(status_params)

        if status.save
          render json: status, status: :created
        else
          render json: { errors: status.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/statuses/:id
      def update
        if @status.update(status_params)
          render json: @status, status: :ok
        else
          render json: { errors: @status.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/statuses/:id
      def destroy
        if @status.properties.exists?
          render json: {
            error: 'Cannot delete status because it is assigned to one or more properties',
            properties_count: @status.properties.count
          }, status: :unprocessable_entity
        elsif @status.destroy
          render json: { message: 'Status deleted successfully' }, status: :ok
        else
          render json: { errors: @status.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_status
        @status = Status.find(params[:id])
      end

      def status_params
        params.require(:status).permit(:name, :es_name)
      end
    end
  end
end
