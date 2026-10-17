require "net/http"
require "json"

class ResendDelivery
  attr_accessor :settings

  def initialize(settings = {})
    @settings = settings
  end

  def deliver!(message)
    key = ENV.fetch("RESEND_API_KEY", "").strip
    if key.empty?
      Rails.logger.error("Resend delivery configuration error: RESEND_API_KEY is missing or blank")
      raise "Missing Resend API key"
    end

    uri = URI("https://api.resend.com/emails")
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{key}"
    request["Content-Type"] = "application/json"
    request.body = {
      from: message[:from].to_s,
      to: message.to,
      reply_to: message.reply_to,
      subject: message.subject,
      text: message.text_part ? message.text_part.decoded : message.body.decoded
    }.to_json
    response = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 5, read_timeout: 15, write_timeout: 5) do |http|
      http.request(request)
    end
    unless response.is_a?(Net::HTTPSuccess)
      # Do not log response bodies: they can echo addresses or submitted content.
      Rails.logger.error("Resend delivery rejected: HTTP #{response.code}")
      raise "Email provider rejected delivery (#{response.code})"
    end

    response
  end
end
