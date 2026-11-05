# Signed links from the on-hold reminder email. GET only renders a confirmation
# page (email scanners prefetch links); POST applies the action.
module Api
  module V1
    class OnHoldRemindersController < ApplicationController
      skip_before_action :authenticate_user!
      skip_before_action :reject_disabled_user!
      before_action :load_payload

      ACTION_LABELS = { 'keep' => 'Sigue apartada', 'sold' => 'Marcar como vendida' }.freeze

      # GET /api/v1/on_hold_reminders?token=...
      def show
        return render_page('Sin cambios', "La propiedad \"#{h(@property.title)}\" ya no está apartada.") unless @property.on_hold?

        render_page(
          'Confirmar acción',
          "Propiedad: <strong>#{h(@property.title)}</strong>",
          form: <<~FORM
            <form method="post" action="#{request.path}">
              <input type="hidden" name="token" value="#{h(params[:token])}">
              <button type="submit">#{ACTION_LABELS[@payload['action']]}</button>
            </form>
          FORM
        )
      end

      # POST /api/v1/on_hold_reminders
      def create
        return render_page('Sin cambios', "La propiedad \"#{h(@property.title)}\" ya no está apartada.") unless @property.on_hold?

        if @payload['action'] == 'sold'
          @property.update!(status: Status.sold)
          render_page('Listo', "La propiedad <strong>#{h(@property.title)}</strong> se marcó como vendida.")
        else
          @property.update_column(:on_hold_reminded_at, Time.current)
          render_page('Listo', "La propiedad <strong>#{h(@property.title)}</strong> sigue apartada. Te volveremos a preguntar en 3 días.")
        end
      end

      private

      def load_payload
        @payload = OnHoldReminderToken.verify(params[:token])
        @property = Property.find_by(id: @payload['property_id']) if @payload
        return if @property

        render_page('Enlace inválido o expirado',
                    "Actualiza el estatus desde el <a href=\"#{dashboard_url}\">dashboard</a>.",
                    status: :gone)
      end

      def render_page(title, body, form: '', status: :ok)
        render status: status, html: <<~HTML.html_safe
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>#{h(title)} · Properlia</title>
              <style>
                body { font-family: Arial, sans-serif; background: #f9fafb; color: #333; display: flex; justify-content: center; padding: 40px 16px; }
                .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; max-width: 420px; width: 100%; }
                h1 { color: #214c9b; font-size: 20px; }
                button { background: #214c9b; color: white; border: 0; border-radius: 5px; padding: 10px 20px; font-size: 15px; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>#{h(title)}</h1>
                <p>#{body}</p>
                #{form}
              </div>
            </body>
          </html>
        HTML
      end

      def dashboard_url
        "#{ENV.fetch('DASHBOARD_URL', 'http://localhost:3002').chomp('/')}/es/properties"
      end

      def h(value)
        ERB::Util.html_escape(value.to_s)
      end
    end
  end
end
