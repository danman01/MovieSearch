var MovieSearch = MovieSearch || {};

MovieSearch.App = {

  loading : document.getElementById("loading"),
  noResults : document.getElementById("noResults"),
  movieList : document.getElementById("movieList"),
  favoritesContainer : document.getElementById("favoritesContainer"),

    init: function() {
      MovieSearch.App.activate_movie_search();
      document.getElementById("showFavorites").addEventListener("click", function(){
        MovieSearch.App.display_favorites();
      })

    },

  activate_movie_search : function(){
    var searchForm = document.getElementById("movieSearch");
    searchForm.onsubmit = function(form){
      form.preventDefault();
      MovieSearch.App.reset_page();
      var title = form.srcElement.elements.namedItem("s").value;
      MovieSearch.App.omdb_api_request('s', title);
    }
    document.getElementById("searchButton").disabled=false;
  },

  omdb_api_request: function(kind, query){
    loading.style.display = "block";

    var url = 'https://www.omdbapi.com/?' + kind + '=' + query;
    var response;

    // setup ajax request:
    var xhr = new XMLHttpRequest();
    var cachebuster = '&' + new Date().getTime();
    xhr.open('POST', url + cachebuster);
    xhr.send(null);

    xhr.onload = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) 
          response = xhr.responseText
            console.log('Success: ' + response); // 'This is the returned text.'
        MovieSearch.App.update_movie_list(kind, JSON.parse(response))
      } else {
        response = xhr.status;
        console.log('Error: ' + response); // An error occurred during the request.
      }
    }
  },

  backend_api_request : function(method, params){
    loading.style.display = "block";

    var paramString = "?requester=app";
    if(params["name"] !=undefined && params["oid"] !=undefined){
      paramString = "&name=" + params["name"] + "&oid=" + params["oid"]; 
    }
    var url = '/' + method + paramString;
    if(method == "favorites/list"){
      var kind = "GET";
    }
    else {
      var kind = "POST";
    }
    var response;

    // setup ajax request:
    var xhr = new XMLHttpRequest();
    var cachebuster = '&' + new Date().getTime();
    xhr.open(kind, url + cachebuster);
    xhr.send(null);

    xhr.onload = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          response = xhr.responseText
          console.log('Success: ' + response); // 'This is the returned text.'
          var html = MovieSearch.App.build_favorites_html(JSON.parse(response)).innerHTML;
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
      MovieSearch.App.populate_list(response)
    } 
    else if(kind == "i"){
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
    document.getElementById("details").style.display="none";
  },

  build_movie_html : function (level, result) {
    var el = document.createElement("li");
    for(prop in result){
      if(prop == "Title"){
        var detail = document.createElement('h3');
        detail.innerHTML = "<a href='#' data-imdb-id='"+result['imdbID']+"'>" + result[prop] + "</a>";
        detail.addEventListener("click", function( event ) {
          MovieSearch.App.show_movie_details( event.srcElement );
        });
        var favorite = document.createElement("a");
        favorite.textContent = "Add Favorite";
        favorite.addEventListener("click", function (event) {
          MovieSearch.App.add_favorite( event.srcElement );
        })
        detail.appendChild(favorite);
      }
      else if(prop == "Poster" && result[prop] != "N/A"){
        var detail = document.createElement('img');
        if(level == "basic"){
          detail.height = "75";
        }
        detail.src = result[prop];
      }
      else if(level=="full") {
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
    params={"name": movie.parentElement.innterText, "oid": movie.dataset.imdbId}
    MovieSearch.App.backend_api_request("favorites", params );
  },

  display_favorites : function (){
    MovieSearch.App.backend_api_request( 'favorites/list',{} ); 
  },

  build_favorites_html : function (response_json){
    var html =document.createElement("ul");
    if(response_json.favorites.length > 0){
      for(i=0; i < response_json.favorites.length; i++){ 
        var li = document.createElement("li");
        li.textContent = response_json.favorites[i]["name"] + response_json.favorites[i]["oid"];
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

