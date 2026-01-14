# PDF Generation for Properties

This document explains how to use the PDF generation feature for property listings.

## Overview

The PDF generation system creates professional property brochures in 4 different templates based on property type:

- **Residential**: For houses and apartments (departamentos)
- **Commercial**: For retail spaces (locales comerciales)
- **Industrial**: For warehouses (bodegas o naves)
- **Land**: For land properties (terrenos)

## Features

### Included in PDFs
- ✅ Property images (up to 4 images in layouts)
- ✅ Property title, description, and price
- ✅ Key features (rooms, bathrooms, parking, area)
- ✅ Complete location information
- ✅ Property type, listing type, and status
- ✅ Contact information (phone, WhatsApp, email)
- ✅ QR code linking to property listing
- ✅ Bilingual support (English and Spanish)
- ✅ Branded design with Properlia header

### Template Differences

Each template emphasizes different property attributes:

| Template | Property Types | Key Features Emphasized |
|----------|---------------|------------------------|
| Residential | house, departament | Bedrooms, bathrooms, parking spaces, built area |
| Commercial | retail space | Built area, land area, parking, storefront access |
| Industrial | warehouse | Built area, land area, loading capacity, utilities |
| Land | land | Land area, development potential, location |

## API Endpoints

### 1. Download Property PDF

```
GET /api/v1/properties/:property_id/pdf
```

**Query Parameters:**
- `locale` (optional): Language for PDF. Options: `en` (English) or `es` (Spanish). Default: `es`
- `download` (optional): Set to `false` to view inline in browser. Default: `true`

**Example Requests:**

```bash
# Download PDF in Spanish (default)
curl -O http://localhost:3000/api/v1/properties/abc123/pdf

# Download PDF in English
curl -O "http://localhost:3000/api/v1/properties/abc123/pdf?locale=en"

# View PDF inline in browser (for preview)
curl "http://localhost:3000/api/v1/properties/abc123/pdf?download=false"
```

**Response:**
- Content-Type: `application/pdf`
- Filename: `{property_title}_{property_id}.pdf`

**Status Codes:**
- `200 OK` - PDF generated successfully
- `404 Not Found` - Property not found
- `500 Internal Server Error` - PDF generation failed

---

### 2. Email Property PDF

```
POST /api/v1/properties/:property_id/pdf/email
```

Generates a PDF and sends it via email to a specified recipient.

**Request Body (JSON):**

```json
{
  "email": "recipient@example.com",
  "locale": "es",
  "message": "Optional personal message to include in email"
}
```

**Parameters:**
- `email` (required): Recipient email address
- `locale` (optional): Language for PDF. Options: `en` or `es`. Default: `es`
- `message` (optional): Custom message to include in the email body

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/v1/properties/abc123/pdf/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "locale": "es",
    "message": "Gracias por tu interés en esta propiedad. Aquí está la información completa."
  }'
```

**Response:**

Success (200 OK):
```json
{
  "message": "PDF sent successfully"
}
```

Error (422 Unprocessable Entity):
```json
{
  "error": "Invalid email address"
}
```

**Status Codes:**
- `200 OK` - Email queued successfully
- `404 Not Found` - Property not found
- `422 Unprocessable Entity` - Invalid email address
- `500 Internal Server Error` - Failed to send email

---

## Frontend Integration

### React/Next.js Example

```typescript
import { propertiesApi } from '@properlia/shared';

// Download PDF
const downloadPDF = async (propertyId: string, locale: 'en' | 'es' = 'es') => {
  try {
    const url = `${API_BASE_URL}/api/v1/properties/${propertyId}/pdf?locale=${locale}`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to download PDF:', error);
  }
};

// Email PDF
const emailPDF = async (
  propertyId: string,
  recipientEmail: string,
  locale: 'en' | 'es' = 'es',
  message?: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/properties/${propertyId}/pdf/email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: recipientEmail,
          locale,
          message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send PDF');
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Failed to email PDF:', error);
  }
};

// Usage in component
export default function PropertyDetails({ property }) {
  return (
    <div>
      <h1>{property.title}</h1>

      {/* Download button */}
      <button onClick={() => downloadPDF(property.id, 'es')}>
        Descargar Folleto (PDF)
      </button>

      {/* Email button */}
      <button onClick={() => {
        const email = prompt('Email:');
        if (email) emailPDF(property.id, email, 'es');
      }}>
        Enviar por Correo
      </button>
    </div>
  );
}
```

---

## Service Usage (Backend)

### Generate PDF Programmatically

```ruby
# In a controller or service
property = Property.includes(:property_type, :status, :listing_type, :images, :videos)
                   .find(params[:id])

# Generate PDF
service = PdfGeneratorService.new(
  property,
  locale: :es,
  base_url: 'https://properlia.com'
)

pdf_data = service.generate

# Save to file
File.write('property_brochure.pdf', pdf_data)

# Or send as download
send_data pdf_data,
          filename: "#{property.title}.pdf",
          type: 'application/pdf',
          disposition: 'attachment'
```

### Send PDF via Email

```ruby
# Using PropertyMailer
PropertyMailer.send_pdf(
  property: property,
  recipient_email: 'client@example.com',
  pdf_data: pdf_data,
  locale: :es,
  message: 'Thank you for your interest!'
).deliver_later
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Frontend URL for QR code generation
FRONTEND_URL=http://localhost:3001

# Or in production
FRONTEND_URL=https://properlia.com
```

### Docker Setup

The PDF generation requires the following gems, which are already included:

```ruby
gem 'prawn', '~> 2.4'        # PDF generation
gem 'prawn-table', '~> 0.2'  # Tables in PDFs
gem 'rqrcode', '~> 2.0'      # QR code generation
```

After adding new gems or updating the service, rebuild the Docker containers:

```bash
make dev-build
```

---

## Testing

### Manual Testing with cURL

```bash
# 1. Get list of properties
curl http://localhost:3000/api/v1/properties

# 2. Download PDF for a specific property
curl -O "http://localhost:3000/api/v1/properties/PROPERTY_ID/pdf"

# 3. Download PDF in English
curl -O "http://localhost:3000/api/v1/properties/PROPERTY_ID/pdf?locale=en"

# 4. Email PDF
curl -X POST http://localhost:3000/api/v1/properties/PROPERTY_ID/pdf/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "locale": "es"}'
```

### Testing in Rails Console

```ruby
# Access Rails console
docker-compose exec backend bundle exec rails console

# Find a property
property = Property.includes(:property_type, :status, :listing_type).first

# Generate PDF
service = PdfGeneratorService.new(property, locale: :es)
pdf_data = service.generate

# Save to temp file
File.write('/tmp/test_property.pdf', pdf_data)

puts "PDF generated! Size: #{pdf_data.bytesize} bytes"
```

---

## Troubleshooting

### Common Issues

#### 1. Missing Property Type Association

**Error:** `undefined method 'name' for nil:NilClass`

**Solution:** Ensure properties have a valid `property_type_id`:

```ruby
property.update!(property_type_id: PropertyType.find_by(name: 'house').id)
```

#### 2. Images Not Loading

**Error:** Images appear as "Image unavailable"

**Causes:**
- Active Storage not configured correctly
- S3 credentials missing
- Images not attached to property

**Solution:** Check Active Storage configuration and ensure images are attached:

```ruby
# Check if images are attached
property.images.attached? # Should return true

# Check Active Storage service
Rails.application.config.active_storage.service # Should be :local or :amazon
```

#### 3. QR Code Generation Fails

**Error:** QR code not appearing in PDF

**Solution:** Ensure `FRONTEND_URL` is set in environment variables:

```bash
export FRONTEND_URL=http://localhost:3001
```

#### 4. Email Not Sending

**Causes:**
- Resend API key not configured
- Invalid recipient email

**Solution:** Check email configuration and logs:

```ruby
# Check general info email settings
GeneralInfo.instance.email_to # Should return valid email

# Test email manually
PropertyMailer.send_pdf(
  property: property,
  recipient_email: 'test@example.com',
  pdf_data: pdf_data,
  locale: :es
).deliver_now
```

---

## Property Type Mapping

The system automatically selects the appropriate template based on the property's `property_type.name`:

| Database Value | Spanish Name | Template Used |
|---------------|--------------|---------------|
| `house` | casa | Residential |
| `departament` | departamento | Residential |
| `retail space` | local comercial | Commercial |
| `warehouse` | bodega o nave | Industrial |
| `land` | terreno | Land |

---

## Future Enhancements

Potential improvements for the PDF generation system:

- [ ] Add custom branding per agency/user
- [ ] Support for custom logo upload
- [ ] More layout options for images
- [ ] Include property comparison in PDFs
- [ ] Add floor plans section
- [ ] Virtual tour QR codes
- [ ] Multilingual support (add more languages)
- [ ] PDF templates customization via admin panel
- [ ] Watermark support for images
- [ ] Analytics tracking (PDF downloads/emails)

---

## Support

For issues or questions:

1. Check logs: `make dev-logs`
2. Access Rails console: `make shell-backend`
3. Review this documentation
4. Open an issue in the project repository

---

## License

© 2025 Properlia. All rights reserved.
