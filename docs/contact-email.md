# Contact enquiries

The form posts to Rails Action Mailer. The recipient is balabharathiprofessional@gmail.com; Reply-To is the validated visitor email. Input validation, CSRF protection, five requests per IP per ten minutes, and delivery error responses are included.

Production delivery provider integration is pending approval. Keep CONTACT_EMAIL_ENABLED unset until the delivery provider is configured. Production requests otherwise return an unavailable message rather than falsely claiming success. Render free blocks standard SMTP ports. A supported HTTPS email provider needs setup before live delivery.

CONTACT_FROM_EMAIL must use the approved provider's verified sender. Never commit API keys. The optional email-address link remains mailto; the form uses Rails.

Run `bin/rails test test/controllers/contact_enquiries_test.rb` and `bin/rails zeitwerk:check` in Ubuntu. Tests use the test mail adapter and do not send externally.
