require 'sinatra'
require 'json'
require 'pry'

class App < Sinatra::Application 
  get '/' do
    send_file ('views/index.html')
  end

  get '/favorites/list' do
    response.header['Content-Type'] = 'application/json'
    send_file 'data.json' #File.join(settings.public_folder, 'data.json')
  end

  post '/favorites' do
    file = JSON.parse(File.read('data.json'))
    logger.info "Params: \n #{params}"
    logger.info "Request body: \n #{request.body.read}"
    unless params["name"] && params["oid"]
      return 'Invalid Request'
    end
    movie = { "name": params["name"], "oid": params["oid"] }
    
    # make sure we don't add the favorite twice
    includes = false
    file["favorites"].each { |fav| includes = true if fav.values.include?(params["oid"]) }
    if includes
      status = "Favorite already in list!"
    else
      file["favorites"] << movie
      status = "Favorite added!"
    end
    
    File.write('data.json',JSON.pretty_generate(file))

    {"favorites": [movie.merge!({"result": status})]}.to_json
  end
end
