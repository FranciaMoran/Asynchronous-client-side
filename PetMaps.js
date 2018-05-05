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

///////////////////////////////////////////////////////////////// 

function searchPage () {
  return `
  <p id="description-paragraph2">Enter search criteria and the location you would like to search below:</p>
  <form action="#" id="js-search-form">
    <select id="animal-type">
  <option value="dog">Dog</option>
  <option value="cat">Cat</option>
</select>
  <select id="age">
  <option value="Baby">Baby</option>
  <option value="Young">Young</option>
  <option value="Adult">Adult</option>
  <option value="Senior">Senior</option>
</select>
 <select id="B-or-S">
  <option value="S">Small</option>
  <option value="M">Medium</option>
  <option value="L">Large</option>
  <option value="XL">Extra-Large</option>
</select>
<select id="M-or-F">
  <option value="M">Male</option>
  <option value="F">Female</option>
</select>
      <br>
      <label for="query">Search Location  Here:</label>
            <input type="text" id="js-query" class="controls" name="search" aria-label="search-here" placeholder="enter location here">
            <button id="search-button" type="submit">Find Animals</button>
            <br>
      <span id="error"></span>
    </form>
      <p id="results-number">Results:</p>
      <div aria-live="assertive" id="animal-data"></div>
    <div aria-live="assertive" id="map"></div>
  `;
}

///////////////////////////////////////////////////////////////// 


function initAutocomplete() {
      $('#next-page').submit('#search-button', function(event){
        event.preventDefault();
        const queryTarget = $(event.currentTarget).find('#js-query');
    const queryT = queryTarget.val();
   
         queryTarget.val("");
         console.log(queryT);
          
    if (queryT){
      getPetFinderAPI(queryT);
      $('#error').text("");
    }
    else {
      $('#error').text("Please enter a location.");
    }
  });
}

/////////////////////////////////////////////////////////////////
function generateLocation () {
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 11,
          center: {lat: -34.397, lng: 150.644}
        });
        geocoder = new google.maps.Geocoder();
        var input = document.getElementById('js-query');
        var autocomplete = new google.maps.places.Autocomplete(input);

        document.getElementById('search-button').addEventListener('click', function() {
          
          geocodeAddress(geocoder, map);
          
        });
      }




  function geocodeAddress(geocoder, map) {
    var address = document.getElementById('js-query').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
              //`${eachPet.contact.address1.$t}`
              //('our-test-address')
              
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
  }
      
/////////////////////////////////////////////////////////////////    
      
      
      

        
function displayAnimalData (eachPet) {
  
  var eachPetAddress = eachPet.contact.address1.$t + eachPet.contact.city.$t + eachPet.contact.state.$t + eachPet.contact.zip.$t;
  
  geocoder.geocode({'address': eachPetAddress}, function(results, status) {
        if (status === 'OK') {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
              //`${eachPet.contact.address1.$t}`
              //('our-test-address')
              
          });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
           
        }
  });

  return `
      <div id="animal-results">
      <hr>
      <p>${eachPet.name.$t}</p>
      <img src="${eachPet.media.photos.photo[2].$t}"/>
      <p>${eachPet.description.$t}</p>
      <p id="our-test-address">${eachPet.contact.address1.$t}</p>
      <p>${eachPetAddress}</p>
          </div>
  `;
}      
      
          
      


  
function getPetFinderAPI (queryT) {
  let animalType = $('#animal-type').val();
  let theAge = $('#age').val();
  let theSize = $('#B-or-S').val();
  let theSex = $('#M-or-F').val();
    const settings = {
      url: PETFINDER_URL,
      data: {
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