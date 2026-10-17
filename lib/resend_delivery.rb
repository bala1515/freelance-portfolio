require "net/http"
require "json"

class ResendDelivery
  attr_accessor :settings

  def initialize(settings = {})
    @settings = settings
  end

  def deliver!(message)
    key = ENV.fetch("RESEND_API_KEY")
    raise "Missing Resend API key" if key.strip.empty?

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
    raise "Email provider rejected delivery (#{response.code})" unless response.is_a?(Net::HTTPSuccess)

    response
  end
end
