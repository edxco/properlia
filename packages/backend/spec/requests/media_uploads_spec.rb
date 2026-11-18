require 'rails_helper'

RSpec.describe 'media upload hardening', type: :request do
  let(:png_path) { Rails.root.join('spec/fixtures/files/sample.png') }
  let(:mat_bytes) { 'MATLAB 5.0 MAT-file, Platform: x /etc/hostname'.b + ("\x00".b * 100) }

  def headers_for(user)
    post '/users/sign_in', params: { user: { email: user.email, password: 'password123' } }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  def mat_upload
    Rack::Test::UploadedFile.new(StringIO.new(mat_bytes), 'image/png', original_filename: 'poc.png')
  end

  describe 'POST /api/v1/leads/public' do
    it 'creates the lead but ignores images' do
      params = { lead: { full_name: 'Ana', email: 'a@example.com', source: 'website',
                         interest_operation: 'buy',
                         images: [Rack::Test::UploadedFile.new(png_path, 'image/png')] } }

      expect { post '/api/v1/leads/public', params: params }
        .to change(Lead, :count).by(1).and change(ActiveStorage::Blob, :count).by(0)
      expect(response).to have_http_status(:created)
      expect(Lead.last.images).not_to be_attached
    end
  end

  describe 'POST /rails/active_storage/direct_uploads' do
    it 'is not available' do
      payload = { blob: { filename: 'poc.png', content_type: 'image/png', byte_size: 6120,
                          checksum: 'AAAAAAAAAAAAAAAAAAAAAA==' } }

      expect { post '/rails/active_storage/direct_uploads', params: payload, as: :json }
        .not_to change(ActiveStorage::Blob, :count)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PUT /api/v1/properties/:id' do
    let(:property) { build_test_property(status: active_status) }
    let(:headers) { headers_for(create(:user, role: 'admin')) }

    it 'rejects a MAT-file declared as PNG with 422 and attaches nothing' do
      expect do
        put "/api/v1/properties/#{property.id}", params: { property: { images: [mat_upload] } }, headers: headers
      end.not_to change(ActiveStorage::Blob, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors'].first).to match(/unsupported content/)
      expect(property.reload.images.count).to eq(0)
    end

    it 'rejects a GIF with 422' do
      gif = Rack::Test::UploadedFile.new(StringIO.new("GIF89a\x01\x00\x01\x00\x80\x00\x00".b + ("\x00".b * 32)),
                                         'image/gif', original_filename: 'x.gif')

      expect do
        put "/api/v1/properties/#{property.id}", params: { property: { images: [gif] } }, headers: headers
      end.not_to change(ActiveStorage::Blob, :count)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'accepts a real PNG' do
      png = Rack::Test::UploadedFile.new(png_path, 'image/png')
      put "/api/v1/properties/#{property.id}", params: { property: { images: [png] } }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(property.reload.images.count).to eq(1)
    end
  end
end
