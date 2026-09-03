require 'rails_helper'

RSpec.describe ProcessPropertyImagesJob do
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

  def attach_image(record)
    record.images.attach(
      io: File.open(Rails.root.join('spec/fixtures/files/sample.jpg')),
      filename: 'sample.jpg',
      content_type: 'image/jpeg'
    )
    record.images.last
  end

  before do
    attach_image(property)
    attach_image(property)
  end

  it 'only compresses the given attachment ids, not every image on the property' do
    old_attachment, new_attachment = property.images.to_a

    allow(ImageCompressor).to receive(:call)

    described_class.new.perform(property.id, [new_attachment.id])

    expect(ImageCompressor).to have_received(:call).with(new_attachment).once
    expect(ImageCompressor).not_to have_received(:call).with(old_attachment)
  end

  it 'does not raise when every given attachment compresses successfully' do
    allow(ImageCompressor).to receive(:call)

    expect { described_class.new.perform(property.id, property.images.pluck(:id)) }.not_to raise_error
  end

  it 'attempts every given attachment and still raises if any of them fail, so ActiveJob retries the job' do
    failing, succeeding = property.images.to_a

    allow(ImageCompressor).to receive(:call).with(failing).and_raise(StandardError, 'vips exploded')
    allow(ImageCompressor).to receive(:call).with(succeeding)

    expect do
      described_class.new.perform(property.id, [failing.id, succeeding.id])
    end.to raise_error(/#{failing.id}/)

    expect(ImageCompressor).to have_received(:call).with(succeeding)
  end

  it 'does nothing when the property no longer exists' do
    expect { described_class.new.perform('non-existent-id', ['whatever']) }.not_to raise_error
  end
end
