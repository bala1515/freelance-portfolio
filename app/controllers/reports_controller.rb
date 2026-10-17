class ReportsController < ApplicationController
  def index
  end

  def summary
    render json: WorkspaceReport.new(current_user, period: params[:period].presence || "daily", date: params[:date]).call
  rescue ArgumentError => error
    render json: { errors: [error.message] }, status: :unprocessable_entity
  end
end