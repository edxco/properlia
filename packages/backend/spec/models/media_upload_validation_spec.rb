require 'rails_helper'

RSpec.describe 'media upload validation on models' do
  let(:png) { File.binread(Rails.root.join('spec/fixtures/files/sample.png')) }
  let(:mat) { 'MATLAB 5.0 MAT-file, Platform: x /etc/hostname'.b + ("\x00".b * 100) }

  def attachable(bytes, name: 'x.png', type: 'image/png')
    { io: StringIO.new(bytes), filename: name, content_type: type }
  end

  describe Lead do
    let(:lead) { Lead.create!(full_name: 'Ana', email: 'a@example.com', source: 'manual', interest_operation: :buy) }

    it 'accepts a real PNG' do
      lead.images.attach(attachable(png))
      expect(lead.reload.images.count).to eq(1)
    end

    it 'rejects a MAT-file declared as PNG before anything is uploaded' do
      lead
      expect { lead.images.attach(attachable(mat)) }.not_to change(ActiveStorage::Blob, :count)
      expect(lead.errors[:images]).to include(a_string_matching(/unsupported content/))
      expect(lead.reload.images.count).to eq(0)
    end

    it 'allows at most 10 images' do
      lead.images.attach(Array.new(11) { attachable(png) })
      expect(lead.errors[:images]).to include(a_string_matching(/too many images \(maximum 10\)/))
      expect(lead.reload.images.count).to eq(0)
    end
  end

  describe Property do
    let(:property) { build_test_property(status: active_status) }

    it 'accepts a real PNG as an image' do
      property.images.attach(attachable(png))
      expect(property.reload.images.count).to eq(1)
    end

    it 'rejects an image file attached as a video' do
      expect { property.videos.attach(attachable(png, name: 'v.mp4', type: 'video/mp4')) }
        .not_to change(ActiveStorage::Blob, :count)
      expect(property.errors[:videos]).to be_present
    end

    it 'rejects a MAT-file declared as PNG' do
      expect { property.images.attach(attachable(mat)) }.not_to change(ActiveStorage::Blob, :count)
      expect(property.errors[:images]).to be_present
    end

    it 'rejects a GIF, which the older image/ prefix check would allow' do
      gif = "GIF89a\x01\x00\x01\x00\x80\x00\x00".b + ("\x00".b * 32)
      expect { property.images.attach(attachable(gif, name: 'x.gif', type: 'image/gif')) }
        .not_to change(ActiveStorage::Blob, :count)
      expect(property.errors[:images]).to include(a_string_matching(/unsupported content/))
    end
  end
end
