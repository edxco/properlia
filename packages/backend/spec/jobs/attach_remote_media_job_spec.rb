require 'rails_helper'

RSpec.describe AttachRemoteMediaJob do
  let(:property) { build_test_property(status: active_status) }
  let(:url) { 'https://drive.google.com/uc?id=abc' }
  let(:png) { File.binread(Rails.root.join('spec/fixtures/files/sample.png')) }
  let(:mp4) { "\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2".b + ("\x00".b * 64) }
  let(:mat) { 'MATLAB 5.0 MAT-file, Platform: x /etc/hostname'.b + ("\x00".b * 100) }

  def stub_download(body, content_type: 'image/png')
    response = Net::HTTPOK.new('1.1', '200', 'OK')
    allow(response).to receive(:body).and_return(body)
    allow(response).to receive(:[]) { |key| key == 'content-type' ? content_type : nil }
    allow_any_instance_of(described_class).to receive(:fetch_with_redirects).and_return(response)
  end

  before { allow(ImageCompressor).to receive(:call) }

  it 'attaches a real image and stores the detected content type, not the remote header' do
    stub_download(png, content_type: 'application/octet-stream')

    described_class.perform_now(property.id, [url], [])

    expect(property.reload.images.count).to eq(1)
    expect(property.images.first.content_type).to eq('image/png')
  end

  it 'refuses a MAT-file served as image/png' do
    stub_download(mat)

    expect { described_class.perform_now(property.id, [url], []) }.not_to change(ActiveStorage::Blob, :count)
    expect(property.reload.images.count).to eq(0)
  end

  it 'refuses a GIF even though it is an image' do
    stub_download("GIF89a\x01\x00\x01\x00\x80\x00\x00".b + ("\x00".b * 32), content_type: 'image/gif')

    expect { described_class.perform_now(property.id, [url], []) }.not_to change(ActiveStorage::Blob, :count)
    expect(property.reload.images.count).to eq(0)
  end

  it 'attaches an MP4 as a video' do
    stub_download(mp4, content_type: 'video/mp4')

    described_class.perform_now(property.id, [], [url])

    expect(property.reload.videos.count).to eq(1)
  end

  it 'refuses an image fetched as a video' do
    stub_download(png)

    described_class.perform_now(property.id, [], [url])

    expect(property.reload.videos.count).to eq(0)
  end
end
