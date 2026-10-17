class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  layout :layout_by_controller
  private

  def after_sign_in_path_for(resource)
    stored_location_for(resource) || workspace_dashboard_path
  end

  def layout_by_controller
    devise_controller? ? "devise" : "application"
  end
end
