require 'rails_helper'

RSpec.describe CityCodeGenerator do
  {
    'Puebla' => 'PUE',
    'Tehuacán' => 'TEH',
    'San Andrés Cholula' => 'SAC',
    'San Pedro Cholula' => 'SPC',
    'Atlixco' => 'ATL',
    'San Martín Texmelucan' => 'SMT',
    'Teziutlán' => 'TEZ',
    'Huauchinango' => 'HUA',
    'Zacatlán' => 'ZAC',
    'Cuautlancingo' => 'CUA',
    'Santa Clara Ocoyucan' => 'SCO',
    'Heroica Puebla de Zaragoza' => 'HPZ',
    'Ciudad Juárez' => 'CJU'
  }.each do |name, code|
    it "builds #{code} for #{name}" do
      expect(described_class.generate(name, taken: [])).to eq(code)
    end
  end

  it 'falls back to another code when the first choice is taken' do
    expect(described_class.generate('Puebla', taken: %w[PUE])).to eq('PUB')
  end

  it 'keeps looking until it finds a free code' do
    taken = %w[PUE PUB PUL PUA]
    code = described_class.generate('Puebla', taken: taken)

    expect(code).to match(/\APU[A-Z0-9]\z/)
    expect(taken).not_to include(code)
  end
end
