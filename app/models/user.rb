class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :billings, dependent: :restrict_with_error
  has_many :customers, dependent: :restrict_with_error
  has_many :services, dependent: :restrict_with_error
  has_many :staff_members, dependent: :restrict_with_error
  after_create :create_default_services
  after_create :create_default_staff

  private

  def create_default_staff
    StaffMember::DEFAULT_NAMES.each_with_index do |name, index|
      staff_members.create!(name: name, role: "Stylist", legacy_id: index + 1)
    end
  end

  def create_default_services
    Service::DEFAULTS.each_with_index do |attributes, index|
      services.create!(attributes.merge(legacy_id: index + 1))
    end
  end
end
