require 'sinatra'
require 'json'

class App < Sinatra::Application 
  get '/' do
    send_file ('views/index.html')
  end

  get '/favorites' do
    response.header['Content-Type'] = 'application/json'
    send_file 'data.json' #File.join(settings.public_folder, 'data.json')
  end

  post '/favorites' do
    logger.info "post received...\n params: #{params}"
    logger.info "request body: \n #{request.body.read}"
    file = JSON.parse(File.read('data.json'))
    unless params[:name] && params[:oid]
      return 'Invalid Request'
    end
    movie = { "name": params[:name], "oid": params[:oid] }
    file[:favorites] << movie
    logger.info file.to_json
    File.write('data.json',JSON.pretty_generate(file))
    movie.to_json
  end
end
