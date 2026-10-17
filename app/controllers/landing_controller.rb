class LandingController < ApplicationController
  skip_before_action :authenticate_user!, only: :index
  layout "landing"

  def index
  end
end