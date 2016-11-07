(function() {
var loading = document.getElementById("loading");
var noResults = document.getElementById("noResults");
var ul = document.getElementById("movieList");


function activate_movie_search(){
  var searchForm = document.getElementById("movieSearch");
  searchForm.onsubmit = function(form){

    reset_page();
    var title = form.srcElement.elements.namedItem("s").value;
    console.log("form submitted with " + title);
    search_api(title);
  }
  document.getElementById("searchButton").disabled=false;
}

function search_api(title){
  // search OMDBapi with supplied title
  var url = 'http://www.omdbapi.com/?s=' + title;
  var response;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.send(null);

  xhr.onreadystatechange = function () {
    var DONE = 4; // readyState 4 means the request is done.
    var OK = 200; // status 200 is a successful return.
    if (xhr.readyState === DONE) {
      if (xhr.status === OK) 
        response = xhr.responseText
          console.log('Success: ' + response); // 'This is the returned text.'
        update_page(JSON.parse(response))
    } else {
      response = xhr.status;
      console.log('Error: ' + response); // An error occurred during the request.
    }
  }
};

function update_page(response){
  if(response.Search != undefined) {
    for(i=0; i < response.Search.length; i++){ 
      var html = _build_movie_html(response.Search[i]);
      window.ul.append(html);
    }
  }
  else {
    window.noResults.style.display="block";
  }
  window.loading.style.display = "none";
}

function _build_movie_html(result) {
  var el = document.createElement("li");
  for(prop in result){
    if(prop == "Title"){
      var detail = document.createElement('h3');
      detail.innerHTML = "<a href='#' data-onclick='showDetails'>" + result[prop] + "</a>";
    }
    else if(prop == "Poster" && result[prop] != "N/A"){
      var detail = document.createElement('img');
      detail.src = result[prop];
    }
    else {
      var detail = document.createElement('p');
      detail.innerHTML = prop + ": " + result[prop];
    }
    el.append( detail ); 
  }
  return el;
}

function show_movie_details(oid){
  // show more details
}

function favorite_movie(oid){
  // persist favorite to data.json
}

function display_favorites(){
  // show all favorites from data.json
}

function reset_page(){
  window.loading.style.display = "block";
  window.noResults.style.display="none";
  //window.ul.innerHTML="";

}

// Make sure the DOM is loaded before setting up our functions
document.addEventListener('DOMContentLoaded', function(){ 
  activate_movie_search();
})

})();
