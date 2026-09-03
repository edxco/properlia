require 'rails_helper'

RSpec.describe ProcessLeadImagesJob do
  let(:lead) do
    Lead.create!(
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      source: 'buyer_form',
      interest_operation: 'buy'
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
    attach_image(lead)
    attach_image(lead)
  end

  it 'only compresses the given attachment ids, not every image on the lead' do
    old_attachment, new_attachment = lead.images.to_a

    allow(ImageCompressor).to receive(:call)

    described_class.new.perform(lead.id, [new_attachment.id])

    expect(ImageCompressor).to have_received(:call).with(new_attachment).once
    expect(ImageCompressor).not_to have_received(:call).with(old_attachment)
  end

  it 'attempts every given attachment and still raises if any of them fail, so ActiveJob retries the job' do
    failing, succeeding = lead.images.to_a

    allow(ImageCompressor).to receive(:call).with(failing).and_raise(StandardError, 'vips exploded')
    allow(ImageCompressor).to receive(:call).with(succeeding)

    expect do
      described_class.new.perform(lead.id, [failing.id, succeeding.id])
    end.to raise_error(/#{failing.id}/)

    expect(ImageCompressor).to have_received(:call).with(succeeding)
  end

  it 'does nothing when the lead no longer exists' do
    expect { described_class.new.perform('non-existent-id', ['whatever']) }.not_to raise_error
  end
end
