require 'json'

file_path = File.exist?('BeautyConnect_Full_API.postman_collection.json') ? 'BeautyConnect_Full_API.postman_collection.json' : 'docs/api/BeautyConnect_Full_API.postman_collection.json'
data = JSON.parse(File.read(file_path))

def walk(items, prefix = "")
  items.each do |item|
    if item['item']
      walk(item['item'], "#{prefix}#{item['name']} > ")
    else
      name = "#{prefix}#{item['name']}"
      method = item.dig('request', 'method') || 'GET'
      url = item.dig('request', 'url', 'raw') || item.dig('request', 'url')
      if name =~ /Customer|Booking|Cart|Flow/i || url.to_s =~ /cart|booking/i
        puts "#{name} [#{method}] #{url}"
      end
    end
  end
end

walk(data['item'])
