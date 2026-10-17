class ContactEnquiry
  include ActiveModel::Model
  attr_accessor :name, :email, :idea

  validates :name, presence: true, length: { maximum: 100 }, format: { without: /[\r\n]/ }
  validates :email, presence: true, length: { maximum: 254 }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :idea, presence: true, length: { maximum: 2000 }
end
