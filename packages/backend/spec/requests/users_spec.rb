# spec/requests/users_spec.rb
require 'rails_helper'

RSpec.describe 'Users', type: :request do
  describe 'POST /users' do
    it 'crea el usuario, responde 201/200 y no usa sesión' do
      email = 'new@user.com'
      params = { user: { email: email, password: 'password123' } }

      post '/users', params: params, as: :json

      # 201 (creado) o 200 (algunos controllers devuelven OK con cuerpo)
      expect(response).to have_http_status(:created).or have_http_status(:ok)

      # Se creó en la BD (evita depender del formato exacto del JSON)
      user = User.find_by(email: email)
      expect(user).to be_present
      expect(user.id).to be_present # UUID en Proper API

      # Si hay JSON, valida estructura flexible y coherente
      if response.body.present?
        body = JSON.parse(response.body) rescue {}
        extracted_id =
          body.dig('data', 'user', 'id') ||
          body.dig('user', 'id') ||
          body['id']

        # Si tu endpoint no devuelve el usuario, este check será nil y no fallará;
        # pero si lo devuelve, nos aseguramos que coincida.
        if extracted_id
          expect(extracted_id).to eq(user.id) # UUID esperado
        end

        # Opcional: valida email si viene en el payload
        extracted_email =
          body.dig('data', 'user', 'email') ||
          body.dig('user', 'email') ||
          body['email']
        if extracted_email
          expect(extracted_email).to eq(email)
        end

        # Content-Type sólo si hubo cuerpo JSON
        expect(response.content_type).to include('application/json')
      end

      # API-only: no debe setear cookie de sesión
      expect(response.headers['Set-Cookie']).to be_nil.or match(/^\z/)
    end
  end
end

