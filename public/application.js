function activate_movie_search(){

  var searchForm = document.getElementById("movieSearch");
  console.log("got here");
  searchForm.onsubmit = function(form){
    var title = form.srcElement.elements.namedItem("s").value;
    console.log("form submitted with " + title);
    var response = search_api(title);
    update_page(response);
  }

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
    } else {
      response = xhr.status;
      console.log('Error: ' + response); // An error occurred during the request.
    }
  }

  return response;
};

function update_page(response){

  // update dom
  var title = response['title'];
  var html = _build_movie_html(title);

  var ul = document.getElementById("movieList");
  ul.appendChild(html);
}

function _build_movie_html(title) {
  // build elements for page
  var li = document.createElement("<li>");
  return li;
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


// Make sure the DOM is loaded before setting up our functions
document.addEventListener('DOMContentLoaded', function(){ 
  console.log("loaded");
  activate_movie_search();
})


