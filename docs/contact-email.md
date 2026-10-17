# Contact enquiries

The form posts to Rails Action Mailer. The recipient is balabharathiprofessional@gmail.com; Reply-To is the validated visitor email. Input validation, CSRF protection, five requests per IP per ten minutes, and delivery error responses are included.

Production uses Resend over HTTPS. Keep CONTACT_EMAIL_ENABLED unset until Resend is configured. Production requests otherwise return an unavailable message rather than falsely claiming success. Render free blocks standard SMTP ports.

## Enable on Render

1. In Resend, add and verify builtbybala.site as a sending domain. Add the exact DNS records supplied by Resend in Namecheap without modifying the Render A and www CNAME records.
2. Create a sending API key in Resend.
3. Set Render environment variables RESEND_API_KEY, CONTACT_FROM_EMAIL (Built by Bala <contact@builtbybala.site>), and CONTACT_EMAIL_ENABLED (true). The sender must belong to the verified domain.
4. Deploy this integration, then submit a test enquiry. Check Resend delivery events and the recipient inbox/spam folder. Provider acceptance does not guarantee inbox placement.

CONTACT_FROM_EMAIL must use the approved provider's verified sender. Never commit API keys. The optional email-address link remains mailto; the form uses Rails.

Run `bin/rails test test/controllers/contact_enquiries_test.rb` and `bin/rails zeitwerk:check` in Ubuntu. Tests use the test mail adapter and do not send externally.
