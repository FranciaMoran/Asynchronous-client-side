'use strict';
const PETFINDER_URL = `https://api.petfinder.com/pet.find`;

var geocoder;
var map;

function getStartedButton() {
      $('#get-started').click(event => {
      event.preventDefault();
      $('#next-page').html(searchPage());
      generateLocation();
      });
}
 
$(getStartedButton)

function searchPage () {
  return `
</iframe aria-live="assertive" title="Area to search animals">
  <html lang="en">
    <main role="main">
      <p id="description-paragraph2"><b>Enter search criteria and the location you would like to search below:</b></p>
        <form action="#" id="js-search-form">
          <label id="labels" for="animal-type"><b>Animal:</b></label>
            <select id="animal-type" aria-live="assertive">
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          <label id="labels" for="age"><b>Age:</b></label>
            <select aria-live="assertive" id="age">
              <option value="Baby">Baby</option>
              <option value="Young">Young</option>
              <option value="Adult">Adult</option>
              <option value="Senior">Senior</option>
            </select>
          <label id="labels" for="B-or-S"><b>Size:</b></label>
            <select aria-live="assertive" id="B-or-S">
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">Extra-Large</option>
            </select>
          <label id="labels" for="M-or-F"><b>Sex:</b></label>
            <select aria-live="assertive" id="M-or-F">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <br>
          <label id="labels" for="js-query"><b>Search City Here:</b></label>
            <input type="text" id="js-query" class="controls" name="search" aria-label="search-here" placeholder="Enter city here">
              <button id="search-button" type="submit">Find Animals</button>
              <br>
              <span id="error"></span>
        </form>
        <div aria-live="assertive" id="map"></div>
        <div aria-live="assertive" id="animal-data"></div>
    </main>
  </html>
</iframe>
  `;
} 

function initAutocomplete() {
  $('#next-page').submit('#search-button', function(event){
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('#js-query');
    const queryT = queryTarget.val();
    queryTarget.val("");
    if (queryT){
      getPetFinderAPI(queryT);
      $('#error').text("")
    }
    else {
      $('#error').text("Please enter a location")
    }
  });
}
 
function generateLocation () {
    map = new google.maps.Map(document.getElementById('map'),
        {
          zoom: 11,
          center: {lat: -34.397, lng: 150.644}
        });
         geocoder = new google.maps.Geocoder();
        var input = document.getElementById('js-query');
        var autocomplete = new google.maps.places.Autocomplete(input);
        document.getElementById('search-button').addEventListener('click', function() {
          geocodeAddress(geocoder, map);
        });
};

function geocodeAddress(geocoder, map) {
    var address = document.getElementById('js-query').value;
    if (address) {
       geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
          } 
          else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
    }
}
      
function displayAnimalData (eachPet) {
  let eachPetAddress = "";
  if (eachPet.contact.address1.$t) {
    eachPetAddress += eachPet.contact.address1.$t; 
  }
  if (eachPet.contact.city.$t) {
    eachPetAddress += " " + eachPet.contact.city.$t;
  }
  if (eachPet.contact.state.$t) {
    eachPetAddress += " " + eachPet.contact.state.$t;
  }
  if (eachPet.contact.zip.$t) {
    eachPetAddress += " " + eachPet.contact.zip.$t;
  }
  geocoder.geocode({'address': eachPetAddress}, function(results, status) 
    {
    if (status === 'OK') {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });
    } 
    else {
            alert('Geocode was not successful for the following reason: ' + status);
    }
    let infoWindowString = `<div id="popup-box">
    <h1 id="first-heading">${eachPet.name.$t.replace(/-/g, ' ')}</h1>`;
    if (eachPet.media.photos) {
      infoWindowString += `<img id="animal-pics" src="${eachPet.media.photos.photo[2].$t}" alt="picture of the adoptable animal"/>`;
    }
    infoWindowString += `<p>${eachPetAddress}</p></div>`;
    let infoWindow = new google.maps.InfoWindow({
          content: infoWindowString  
      }); 
    google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(map, marker)
       });      
    $('#next-page').on("click", '#' + eachPet.name.$t.replace(/ /g, ''), function() {
                infoWindow.open(map, marker);
        }); 
    });

 try {
      let initialString1 = `
     <div id="animal-results">
      <hr>
      <h3 id=${eachPet.name.$t.replace(/ /g, '')}>${eachPet.name.$t}</h3>`;
      if (eachPet.media.photos.photo[2].$t) {
        initialString1 += `<img id="animal-pics" src="${eachPet.media.photos.photo[2].$t}" alt="picture of the adoptable animal"/>`;
      }
      if (eachPet.description.$t) {
      initialString1 += `<p class="description">${eachPet.description.$t}</p>`;
      }
      if (eachPetAddress) {
      initialString1 += `<p id="theAddresses">${eachPetAddress}</p>`;
      }
      initialString1 += `</div>`;
      return initialString1;
  } 
  
  catch (err)  {
      let initialString2 = `
      <div id="animal-results">
      <hr>
      <h3 id=${eachPet.name.$t.replace(/ /g, '')}>${eachPet.name.$t}</h3>`;
      if (eachPet.description.$t) {
        initialString2 += `<p class="description">${eachPet.description.$t}</p>`;
      }
      if (eachPetAddress) {
        initialString2 += `<p>${eachPetAddress}</p>`;
      }
      initialString2 += `</div>`;
      return initialString2;
      } 
}      
     
function getPetFinderAPI (queryT) {
  let animalType = $('#animal-type').val();
  let theAge = $('#age').val();
  let theSize = $('#B-or-S').val();
  let theSex = $('#M-or-F').val();
    const settings = {
      url: PETFINDER_URL,
      data: 
      {
      format: `json`,
      key: `194d0a2a4598ae25c7edd35d4640c37f`,
      location: queryT,
      animal: animalType,
      age: theAge,
      size: theSize,
      sex: theSex,
      count: 10
      },
      dataType: `jsonp`,
      type: `GET`,
      success: function (data){
        console.log(data);
        var resultsHTML = "";
        for (var i=0; i < data.petfinder.pets.pet.length; i++){
          var eachPet = data.petfinder.pets.pet[i];
          var eachPetHTML = displayAnimalData(eachPet);
          resultsHTML += eachPetHTML;
        }
        $('#animal-data').html(resultsHTML);
    }
    };
  $.ajax(settings);
}