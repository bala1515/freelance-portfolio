class ContactMailer < ApplicationMailer
  def enquiry(enquiry)
    @enquiry = enquiry
    mail(
      from: ENV.fetch("CONTACT_FROM_EMAIL", "Built by Bala <contact@builtbybala.site>"),
      to: "balabharathiprofessional@gmail.com",
      reply_to: enquiry.email,
      subject: "New project enquiry from #{enquiry.name}"
    )
  end
end
