# Resend Email Integration

This document describes the Resend email integration for the Properlia backend API.

## Overview

Resend is integrated into the Rails backend to handle all email sending functionality. The integration provides a secure, centralized way to send emails for contact forms, property inquiries, and welcome messages.

## Architecture

- **Location**: Backend (Rails API)
- **Service**: `EmailService` class in `app/services/email_service.rb`
- **Controller**: `Api::V1::EmailsController` in `app/controllers/api/v1/emails_controller.rb`
- **Configuration**: `config/initializers/resend.rb`

## Setup

### 1. Install Dependencies

Run bundle install to install the Resend gem:

```bash
cd packages/backend
bundle install
```

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx          # Your Resend API key
RESEND_FROM_EMAIL=noreply@yourdomain.com # Verified sender email
FRONTEND_URL=http://localhost:3001       # Frontend URL for links in emails
```

#### Getting Your Resend API Key:

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your domain or use the test email `onboarding@resend.dev` for development
3. Generate an API key from the dashboard
4. Add it to your environment variables

### 3. Restart the Backend

After adding environment variables, restart your backend service:

```bash
docker-compose restart backend
```

## API Endpoints

### 1. Send Contact Form Email

Send an email from a contact form submission.

**Endpoint**: `POST /api/v1/emails/contact`

**Authentication**: None required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in learning more about your properties.",
  "subject": "Contact Form Submission" // optional
}
```

**Response**:
```json
{
  "message": "Contact form sent successfully",
  "id": "email_id_from_resend"
}
```

**Example Usage (Frontend)**:
```typescript
const response = await fetch('http://localhost:3000/api/v1/emails/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, I have a question...',
  })
});
```

### 2. Send Property Inquiry Email

Send an inquiry about a specific property.

**Endpoint**: `POST /api/v1/emails/property-inquiry`

**Authentication**: None required

**Request Body**:
```json
{
  "property_id": 123,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890", // optional
  "message": "I'd like to schedule a viewing."
}
```

**Response**:
```json
{
  "message": "Property inquiry sent successfully",
  "id": "email_id_from_resend"
}
```

### 3. Send Welcome Email

Send a welcome email to the currently authenticated user.

**Endpoint**: `POST /api/v1/emails/welcome`

**Authentication**: Required (JWT token)

**Request Body**: None

**Response**:
```json
{
  "message": "Welcome email sent successfully",
  "id": "email_id_from_resend"
}
```

## Email Service Methods

The `EmailService` class provides three main methods:

### `send_contact_form`

```ruby
EmailService.send_contact_form(
  name: "John Doe",
  email: "john@example.com",
  message: "Contact message here",
  subject: "Optional custom subject"
)
```

### `send_property_inquiry`

```ruby
EmailService.send_property_inquiry(
  property_id: 123,
  property_title: "Beautiful Villa",
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "+1234567890",
  message: "Inquiry message here"
)
```

### `send_welcome_email`

```ruby
EmailService.send_welcome_email(
  user_email: "user@example.com",
  user_name: "John Doe"
)
```

## Email Templates

All email templates are HTML-based and include:
- Professional styling with inline CSS
- Responsive design
- Branded header with Properlia colors
- Clear content structure
- Proper formatting for readability

Templates are defined in the `EmailService` class and can be customized as needed.

## Error Handling

The integration includes comprehensive error handling:

- **Missing API Key**: Logs warning on initialization, returns error on send attempts
- **Invalid Email Format**: Validated before sending
- **Missing Required Fields**: Returns 400 Bad Request
- **Resend API Errors**: Caught and returned with error details
- **Property Not Found**: Returns 404 Not Found for property inquiries

## Testing

### Using cURL

**Test contact form**:
```bash
curl -X POST http://localhost:3000/api/v1/emails/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

**Test property inquiry**:
```bash
curl -X POST http://localhost:3000/api/v1/emails/property-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "message": "I am interested in this property"
  }'
```

### Development Mode

In development, you can use Resend's test email `onboarding@resend.dev` as the `RESEND_FROM_EMAIL` without domain verification.

## Production Considerations

### Domain Verification

1. Add your domain in the Resend dashboard
2. Add the required DNS records to verify ownership
3. Update `RESEND_FROM_EMAIL` to use your verified domain

### Email Deliverability

- Use a verified domain for better deliverability
- Set up SPF, DKIM, and DMARC records
- Monitor bounce rates and spam complaints in Resend dashboard

### Rate Limits

Resend has different rate limits based on your plan:
- **Free**: 100 emails/day, 1 email/second
- **Pro**: Higher limits available

Monitor your usage in the Resend dashboard.

### Security

- Never expose `RESEND_API_KEY` in client-side code
- Always validate and sanitize user input
- Use environment variables for all sensitive configuration
- Consider adding rate limiting to prevent abuse

## Monitoring

### Logs

Email sending is logged in the Rails logs:
```
Email sent successfully: {id: "xxx", ...}
```

Errors are also logged:
```
Resend API error: Invalid API key
Failed to send email: Connection timeout
```

### Resend Dashboard

Monitor all sent emails in the Resend dashboard:
- Delivery status
- Open rates (if tracking enabled)
- Click rates (if tracking enabled)
- Bounce and spam reports

## Troubleshooting

### "RESEND_API_KEY is not configured"

Ensure the `RESEND_API_KEY` environment variable is set and the backend service has been restarted.

### "Invalid API key"

Double-check your API key in the Resend dashboard and ensure it's correctly set in your environment variables.

### Emails not being received

1. Check Resend dashboard for delivery status
2. Verify sender email domain is verified (production)
3. Check spam/junk folders
4. Review Rails logs for errors

### "Property not found"

Ensure the `property_id` in the request corresponds to an existing property in the database.

## Future Enhancements

Potential improvements to consider:

- Email templates with React Email or MJML
- Email queuing with Sidekiq for better performance
- Email tracking (opens, clicks)
- Unsubscribe functionality
- Email preferences management
- Transactional email notifications (password resets, booking confirmations, etc.)
- Email templates in database for easy editing
- A/B testing for email content

## Support

For Resend-specific issues, refer to:
- [Resend Documentation](https://resend.com/docs)
- [Resend Ruby SDK](https://github.com/resendlabs/resend-ruby)

For project-specific issues, contact the development team.
