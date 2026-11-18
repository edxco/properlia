require 'rails_helper'

RSpec.describe MediaUploadValidator do
  def fixture(name) = File.binread(Rails.root.join("spec/fixtures/files/#{name}"))
  def io_of(bytes) = StringIO.new(bytes.b)

  let(:mp4) { "\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isomiso2".b + ("\x00".b * 64) }
  let(:mov) { "\x00\x00\x00\x14ftypqt  \x00\x00\x00\x00qt  ".b + ("\x00".b * 64) }
  let(:mat) { 'MATLAB 5.0 MAT-file, Platform: x /etc/hostname'.b + ("\x00".b * 100) }

  def errors(bytes, kind: :images, **opts)
    described_class.errors_for([{ io: io_of(bytes) }], kind: kind, **opts)
  end

  describe 'images' do
    it 'accepts JPEG, PNG and WebP' do
      %w[sample.jpg sample.png sample.webp].each do |name|
        expect(errors(fixture(name))).to eq([]), "#{name} should be accepted"
      end
    end

    it 'rejects a MAT-file header declared as PNG' do
      attachable = { io: io_of(mat), filename: 'poc.png', content_type: 'image/png' }
      expect(described_class.errors_for([attachable], kind: :images).first).to match(/unsupported content/)
    end

    it 'rejects videos, text and empty files' do
      expect(errors(mp4)).to be_present
      expect(errors('plain text')).to be_present
      expect(errors('')).to include(a_string_matching(/is empty/))
    end

    it 'rejects GIF and SVG even though they are images' do
      gif = "GIF89a\x01\x00\x01\x00\x80\x00\x00".b + ("\x00".b * 32)
      svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
      expect(errors(gif)).to be_present
      expect(errors(svg)).to be_present
    end

    it 'ignores the declared content type and trusts the bytes' do
      attachable = { io: io_of(fixture('sample.png')), filename: 'x.txt', content_type: 'text/plain' }
      expect(described_class.errors_for([attachable], kind: :images)).to eq([])
    end
  end

  describe 'videos' do
    it 'accepts MP4 and MOV' do
      expect(errors(mp4, kind: :videos)).to eq([])
      expect(errors(mov, kind: :videos)).to eq([])
    end

    it 'rejects images' do
      expect(errors(fixture('sample.jpg'), kind: :videos)).to be_present
    end
  end

  describe 'limits' do
    it 'rejects files over the size limit' do
      stub_const('MediaUploadValidator::RULES',
                 { images: { types: MediaUploadValidator::IMAGE_TYPES, max_bytes: 10, max_files: 5 } })
      expect(errors(fixture('sample.png'))).to include(a_string_matching(/larger than/))
    end

    it 'rejects too many files, counting existing ones' do
      files = Array.new(3) { { io: io_of(fixture('sample.png')) } }
      expect(described_class.errors_for(files, kind: :images, max_files: 3)).to eq([])
      expect(described_class.errors_for(files, kind: :images, max_files: 3, existing: 1))
        .to include(a_string_matching(/too many images/))
    end
  end

  describe 'attachable types' do
    it 'rejects signed ids and other non-file values' do
      expect(described_class.errors_for(['eyJfcmFpbHMiOnt9fQ==--abc'], kind: :images))
        .to include(a_string_matching(/not an uploaded file/))
      expect(described_class.errors_for([123], kind: :images)).to be_present
    end

    it 'accepts uploaded files from Rack' do
      path = Rails.root.join('spec/fixtures/files/sample.png')
      expect(described_class.errors_for([Rack::Test::UploadedFile.new(path, 'image/png')], kind: :images)).to eq([])
    end

    it 'skips blobs that are already attached' do
      blob = ActiveStorage::Blob.new
      expect(described_class.errors_for([blob], kind: :images)).to eq([])
    end
  end

  describe '.detect' do
    it 'returns the detected type and rewinds the io' do
      io = io_of(fixture('sample.jpg'))
      expect(described_class.detect(io)).to eq('image/jpeg')
      expect(io.pos).to eq(0)
    end
  end
end
