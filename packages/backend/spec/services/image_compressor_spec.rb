require 'rails_helper'

RSpec.describe ImageCompressor do
  let(:property_type) { PropertyType.create!(name: 'house', es_name: 'casa') }
  let(:status) { Status.create!(name: 'active', es_name: 'activo') }
  let(:listing_type) { ListingType.create!(name: 'sale', es_name: 'venta') }
  let(:property) do
    Property.create!(
      title: 'Casa de prueba',
      address: 'Calle Falsa 123',
      price: 100,
      property_type: property_type,
      status: status,
      listing_type: listing_type
    )
  end
  let(:image) do
    {
      io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
      filename: 'sample.jpg',
      content_type: 'image/jpeg'
    }
  end

  def stub_vips(result:)
    pipeline = double('image_processing_pipeline')
    allow(pipeline).to receive_messages(resize_to_limit: pipeline, convert: pipeline, saver: pipeline)
    if result.is_a?(Exception)
      allow(pipeline).to receive(:call).and_raise(result)
    else
      allow(pipeline).to receive(:call).and_return(result)
    end
    allow(ImageProcessing::Vips).to receive(:source).and_return(pipeline)
  end

  before { property.images.attach(image) }

  it 'replaces the blob with a compressed JPEG and marks it as compressed' do
    stub_vips(result: StringIO.new('compressed-bytes'))
    attachment = property.images.first
    original_blob_id = attachment.blob.id

    described_class.call(attachment)
    attachment.reload

    expect(attachment.blob.id).not_to eq(original_blob_id)
    expect(attachment.blob.content_type).to eq('image/jpeg')
    expect(attachment.blob.metadata['compressed']).to be true
    expect(ActiveStorage::Blob.exists?(original_blob_id)).to be false
  end

  it 'skips attachments that are already marked as compressed' do
    attachment = property.images.first
    attachment.blob.update!(metadata: attachment.blob.metadata.merge(compressed: true))

    expect(ImageProcessing::Vips).not_to receive(:source)
    described_class.call(attachment)
  end

  it 'logs and re-raises when processing fails, leaving the original blob in place' do
    stub_vips(result: StandardError.new('vips exploded'))
    attachment = property.images.first
    original_blob_id = attachment.blob.id

    expect(Rails.logger).to receive(:error).with(/vips exploded/)
    expect { described_class.call(attachment) }.to raise_error(StandardError, 'vips exploded')

    expect(attachment.reload.blob.id).to eq(original_blob_id)
  end
end
