(function() {
  var loading = document.getElementById("loading");
  var noResults = document.getElementById("noResults");
  var movieList = document.getElementById("movieList");


  function activate_movie_search(){
    var searchForm = document.getElementById("movieSearch");
    searchForm.onsubmit = function(form){
      form.preventDefault();
      reset_page();
      var title = form.srcElement.elements.namedItem("s").value;
      omdb_api_request('s', title);
    }
    document.getElementById("searchButton").disabled=false;
  }

  function omdb_api_request(kind, query){
    window.loading.style.display = "block";

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
        update_movie_list(kind, JSON.parse(response))
      } else {
        response = xhr.status;
        console.log('Error: ' + response); // An error occurred during the request.
      }
    }
  };

  function backend_api_request(method, name, imdbId){
    window.loading.style.display = "block";

    var url = '/' + method + '?name=' + name + '&oid='+ imdbId
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
        if (xhr.status === OK) 
          response = xhr.responseText
            console.log('Success: ' + response); // 'This is the returned text.'
        alert(JSON.parse(response));

        window.loading.style.display = "none";
      } else {
        response = xhr.status;
        console.log('Error: ' + response); // An error occurred during the request.
      }
    }
  };

  function update_movie_list(kind, response){
    if(kind == "s"){
      populate_list(response)
    } 
    else if(kind == "i"){
      populate_details(response)
    }
  }

  function populate_list(response){
    if(response.Search != undefined) {
      for(i=0; i < response.Search.length; i++){ 
        var html = build_movie_html("basic", response.Search[i]);
        window.movieList.append(html);
      }
    }
    else {
      window.noResults.style.display="block";
    }
    window.loading.style.display = "none";
  }

  function populate_details(response){

    var details = document.getElementById("detailsContainer");
    var html = build_movie_html("full", response);
    details.style.display="block"
    document.getElementById("details").innerHTML=html.innerHTML;

    window.loading.style.display = "none";
  }

  function hide_details() {
    document.getElementById("details").style.display="none";
  }
  

  function build_movie_html(level, result) {
    var el = document.createElement("li");
    for(prop in result){
      if(prop == "Title"){
        var detail = document.createElement('h3');
        detail.innerHTML = "<a href='#' data-imdb-id='"+result['imdbID']+"'>" + result[prop] + "</a>";
        detail.addEventListener("click", function( event ) {
          show_movie_details( event.srcElement );
        });
        var favorite = document.createElement("a");
        favorite.text = "Add Favorite";
        favorite.addEventListener("click", function (event) {
          add_favorite( event.srcElement );
        })
      }
      else if(prop == "Poster" && result[prop] != "N/A"){
        var detail = document.createElement('img');
        detail.src = result[prop];
      }
      else if(level=="full") {
        var detail = document.createElement('p');
        detail.innerHTML = prop + ": " + result[prop];
      }
      el.append( detail ); 
    }
    return el;
  }

  function show_movie_details(movie){
    omdb_api_request("i", movie.dataset.imdbId);
  }

  function add_favorite(movie){
    backend_api_request("favorites", movie.parentElement.innerText, movie.dataset.imdbId);
  }

  function favorite_movie(oid){
    // persist favorite to data.json
  }

  function display_favorites(){
    // show all favorites from data.json
  }

  function reset_page(){
    window.noResults.style.display="none";
    window.movieList.innerHTML="";

  }

  // Make sure the DOM is loaded before setting up our functions
  document.addEventListener('DOMContentLoaded', function(){ 
    activate_movie_search();
    document.getElementById("showFavorites").addEventListener("click", function(){

    backend_api_request( 'favorites/list',null,null ); 
    })
  })

})();
