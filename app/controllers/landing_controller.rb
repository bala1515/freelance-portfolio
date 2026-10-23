class LandingController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :newbilling, :salon, :interior, :coaching]
  layout "landing"

  def index
  end

  def salon
    render layout: "salon"
  end

  def interior
    render layout: "interior"
  end

  def coaching
    render layout: "coaching"
  end

  def newbilling
    @seo_title = "Salon Billing App Case Study | Built by Bala"
    @seo_description = "Explore how Bala Bharathi built Newbilling: a Rails and React salon application connecting billing, customer memberships, staff, services, and reports."
    @canonical_url = "https://builtbybala.site/work/salon-billing-app"
  end
end
