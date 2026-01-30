module Api
  module V1
    module Admin
      class UsersController < ApplicationController
        before_action :authenticate_user!
        before_action { authorize_any!(:admin) }
        before_action :set_user, only: %i[show update disable]
        after_action { pagy_headers_merge(@pagy) if @pagy }

        # GET /api/v1/admin/users
        def index
          users = User.all

          # Filter by role
          users = users.where(role: params[:role]) if params[:role].present?

          # Filter by enabled status
          if params[:enabled].present?
            users = users.where(enabled: ActiveModel::Type::Boolean.new.cast(params[:enabled]))
          end

          # Search by email or name
          if params[:search].present?
            search_term = "%#{params[:search].downcase}%"
            users = users.where('LOWER(email) LIKE ? OR LOWER(name) LIKE ?', search_term, search_term)
          end

          @pagy, @users = pagy(users.order(created_at: :desc))

          render json: {
            data: @users.map { |user| user_json(user) },
            metadata: {
              count: @pagy.count,
              page: @pagy.page,
              pages: @pagy.pages,
              next: @pagy.next,
              prev: @pagy.prev
            }
          }
        end

        # GET /api/v1/admin/users/:id
        def show
          render_success(data: user_json(@user))
        end

        # POST /api/v1/admin/users
        def create
          user = User.new(user_params)

          if user.save
            render_success(
              data: user_json(user),
              message: 'Usuario creado exitosamente',
              status: :created
            )
          else
            render_error(
              errors: user.errors.full_messages,
              message: 'Error al crear usuario'
            )
          end
        end

        # PATCH/PUT /api/v1/admin/users/:id
        def update
          # Only update password if provided
          update_params = user_params
          update_params = update_params.except(:password, :password_confirmation) if update_params[:password].blank?

          if @user.update(update_params)
            render_success(
              data: user_json(@user),
              message: 'Usuario actualizado exitosamente'
            )
          else
            render_error(
              errors: @user.errors.full_messages,
              message: 'Error al actualizar usuario'
            )
          end
        end

        # PATCH /api/v1/admin/users/:id/disable
        def disable
          if @user.update(enabled: false)
            render_success(
              data: user_json(@user),
              message: 'Usuario deshabilitado exitosamente'
            )
          else
            render_error(
              errors: @user.errors.full_messages,
              message: 'Error al deshabilitar usuario'
            )
          end
        end

        private

        def set_user
          @user = User.find(params[:id])
        end

        def user_params
          params.require(:user).permit(:email, :name, :role, :password, :password_confirmation, :enabled)
        end

        def user_json(user)
          {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            enabled: user.enabled,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        end
      end
    end
  end
end
