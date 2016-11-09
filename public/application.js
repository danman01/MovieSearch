var MovieSearch = MovieSearch || {};

MovieSearch.App = {

  loading : document.getElementById("loading"),
  noResults : document.getElementById("noResults"),
  movieList : document.getElementById("movieList"),
  favoritesContainer : document.getElementById("favoritesContainer"),

  init: function() {
    MovieSearch.App.activate_movie_search();

    // Attach "onclick" event to showFavorites link
    document.getElementById("showFavorites").addEventListener("click", function(){
      MovieSearch.App.display_favorites();
    })
  },

  activate_movie_search : function(){
    var searchForm = document.getElementById("movieSearch");

    // Instead of submitting the form, we prevent form submission and request data from the omdb api
    searchForm.onsubmit = function(form){
      form.preventDefault();
      MovieSearch.App.reset_page();
      var title = form.srcElement.elements.namedItem("s").value;
      MovieSearch.App.omdb_api_request('s', title);
    }

    // Allow the user to submit via the button once this method has been loaded
    document.getElementById("searchButton").disabled=false;
  },

  omdb_api_request: function(kind, query){
    loading.style.display = "block";

    var url = 'https://www.omdbapi.com/?' + kind + '=' + query;
    var response;

    // Setup ajax request:
    var xhr = new XMLHttpRequest();

    // This forces the cache to expire so we get the data we want
    var cachebuster = '&' + new Date().getTime();

    xhr.open('POST', url + cachebuster);
    xhr.send(null);

    xhr.onload = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) 
          response = xhr.responseText
          console.log('Success: ' + response); 
          MovieSearch.App.update_movie_list(kind, JSON.parse(response))
        } else {
          response = xhr.status;
          console.log('Error: ' + response); // An error occurred during the request.
        }
    }
  },

  backend_api_request : function(method, params){
    loading.style.display = "block";

    var cachebuster = new Date().getTime();
    var paramString = "?" + cachebuster;
    if(params["name"] !=undefined && params["oid"] !=undefined){
      paramString += "&name="+params["name"]+"&oid="+params["oid"];
    }

    // We know these routes and http verbs from our backend app.rb
    var url = '/' + method 
      if(method == "favorites/list"){
        var kind = "GET";
      }
      else {
        var kind = "POST";
      }
    var response;

    // Setup ajax request:
    var xhr = new XMLHttpRequest();

    xhr.open(kind, url + paramString);
    xhr.send(null);

    xhr.onload = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          response = xhr.responseText
          console.log('Success: ' + response);
          json = JSON.parse(response)

          // We handle both getting favorites and posting to favorites. They both return json in a similar structre that we can turn into html
          var html = MovieSearch.App.build_favorites_html(json).innerHTML;
          favoritesContainer.innerHTML =  html;

          loading.style.display = "none";
        } else {
          response = xhr.status;
          console.log('Error: ' + response); // An error occurred during the request.
        }
      }
    }
  },

  update_movie_list : function (kind, response){
    if(kind == "s"){
      // search by entering a title
      MovieSearch.App.populate_list(response)
    } 
    else if(kind == "i"){
      // imdbId search
      MovieSearch.App.populate_details(response)
    }
  },

  populate_list : function (response){
    if(response.Search != undefined) {
      for(i=0; i < response.Search.length; i++){ 
        var html = MovieSearch.App.build_movie_html("basic", response.Search[i]);
        movieList.append(html);
      }
    }
    else {
      noResults.style.display="block";
    }
    loading.style.display = "none";
  },

  populate_details : function (response){

    var details = document.getElementById("detailsContainer");
    var html = MovieSearch.App.build_movie_html("full", response);
    details.style.display="block"
      document.getElementById("details").innerHTML=html.innerHTML;

    loading.style.display = "none";
  },

  hide_details : function () {
    // Not implemented
    document.getElementById("details").style.display="none";
  },

  // Allows for a "basic" or "full" set of movie details to be returned
  build_movie_html : function (level, result) {
    var el = document.createElement("li");
    for(prop in result){
      if(prop == "Title"){

        // setup title
        var detail = document.createElement('h3');
        var titleLink = document.createElement("a");
        titleLink.dataset.imdbId = result['imdbID'];
        titleLink.textContent = result[prop];

        // setup Full Details link
        var more = document.createElement("a");
        more.textContent = "Full Details"
          more.addEventListener("click", function( event ) {
            MovieSearch.App.show_movie_details( titleLink );
          });

        // setup Add Favorite link
        var favorite = document.createElement("a");
        favorite.textContent = "Add Favorite";
        favorite.addEventListener("click", function (event) {
          MovieSearch.App.add_favorite( titleLink );
        })

        // format the title
        var span = document.createElement("span");
        span.textContent = " | ";
        var br = document.createElement("br");

        detail.appendChild(titleLink);
        detail.appendChild(br);
        if(level == "basic"){
          detail.appendChild(more);
          detail.appendChild(span);
          detail.appendChild(favorite);
        }
      }
      else if(prop == "Poster" && result[prop] != "N/A"){

        // setup Poster image
        var detail = document.createElement('img');
        if(level == "basic"){
          detail.height = "100";
          detail.addEventListener("click", function( event ) {
            MovieSearch.App.show_movie_details( event.srcElement );
          });
        }
        detail.dataset.imdbId = result['imdbID']
        detail.src = result[prop];
      }
      else if(level=="full") {

        // setup Full details 
        var detail = document.createElement('p');
        detail.innerHTML = prop + ": " + result[prop];
      }
      el.append( detail ); 
    }
    return el;
  },

  show_movie_details : function (movie){
    MovieSearch.App.omdb_api_request("i", movie.dataset.imdbId);
  },

  add_favorite : function (movie){
    params={"name": movie.text, "oid": movie.dataset.imdbId}
    MovieSearch.App.backend_api_request("favorites", params );
  },

  display_favorites : function (){
    MovieSearch.App.backend_api_request( 'favorites/list',{} ); 
  },

  build_favorites_html : function (response_json){
    var html =document.createElement("ul");
    if(response_json.favorites.length > 0){
      for(i=0; i < response_json.favorites.length; i++){ 
        if(response_json.favorites[i]["result"] != undefined){
          var result = document.createElement("p")
          result.textContent = "Result: " + response_json.favorites[i]["result"]
          html.append(result);
        }
        var li = document.createElement("li");
        li.textContent = "Title: " + response_json.favorites[i]["name"] + " | imdb ID: " + response_json.favorites[i]["oid"];
        html.append(li);
      }
    } else {
      var p = document.createElement("p");
      p.textContent = "No favorites yet...";
      html.append(p);
    }
    return html;
  },

  reset_page : function (){
    noResults.style.display="none";
    movieList.innerHTML="";
  }

} 

// Make sure the DOM is loaded before setting up our functions
document.addEventListener('DOMContentLoaded', function(){ 
  MovieSearch.App.init();
});

