$(document).ready(function(){

    var self = this;
    var sanjose, map, infoWindow;

    // List of my favorite places in San Francisco
var Model = [
    {
      "name": "Aqui Cal-Mex",
      "latlng": [37.2872782,-121.9464099]
    },
    {
      "name": "Hannah Coffee & Sweets",
      "latlng": [37.331574,-121.905534]
    },
    {
      "name": "Yard House",
      "latlng": [37.323022,-121.947505]
    },
    {
      "name": "Bill's Cafe",
      "latlng": [37.3283812,-121.9318303]
    },  
    {
      "name": "Bijan Bakery & Cafe",
      "latlng": [37.3324488,-121.8887316]
    },
    {
      "name": "Crema Coffee Roasting Company",
      "latlng": [37.3313523,-121.9082112]
    },
    {
      "name": "Panera Bread",
      "latlng": [37.340226,-121.903743]
    },
    {
      "name": "Cafe Pomegranate",
      "latlng": [37.33661,-121.88462]
    },
    {
      "name": "Caffe Frascati",
      "latlng": [37.331145,-121.8870726]
    },
    {
      "name": "SmokeEaters Hot Wings",
      "latlng": [37.3362316,-121.8881166]
    }
];

    //google.maps.event.addDomListener(window, 'load', initialize);

    
    //Knockout ViewModel

    var appViewModel = function() {
      var self = this;
      self.markers = ko.observableArray([]);
      self.allLocations = ko.observableArray([]);


      self.filter =  ko.observable("");
      self.search = ko.observable("");

      var map = initialize();
      // if google map is not displaying, alert the user
      if (!map) {
        alert("Currently Google Maps is not available. Please try again later!");
        return;
      }  
      self.map = ko.observable(map);
      fetchForsquare(self.allLocations, self.map(), self.markers);

      // Based on the search keywords filter the list view
      self.filteredArray = ko.computed(function() {
        return ko.utils.arrayFilter(self.allLocations(), function(item) {
          if (item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
            if(item.marker)
              item.marker.setMap(map); 
          } else {
            if(item.marker)
              item.marker.setMap(null);
          }     
          return item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
        });
      }, self);

      

      self.clickHandler = function(data) {
        centerLocation(data, self.map(), self.markers);
      };
    };

    // Initialize Google map based on predefined San Jose position
    function initialize() {

      var mapOptions = {
        center: new google.maps.LatLng(37.3708905,-121.9675525),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);  
    }


    // get location data from foursquare
    function fetchForsquare(allLocations, map, markers) {
      var locationDataArr = [];
      var foursquareUrl = "";
      var location = [];
      for (var place in Model) {
        foursquareUrl = 'https://api.foursquare.com/v2/venues/search' +
          '?client_id=2BIWS0KFSP1W12ARXFHNA20WHNGY0NMOAD3AFYM1ZGCFCF32' +
          '&client_secret=I2F4TTJ0HJOIAO2GCPP0T2NJBMMHFVMCLAQ4HIHF5U1JZCNG' +
          '&v=20130815' +
          '&m=foursquare' +
          '&ll=' + Model[place]["latlng"][0] + ',' + Model[place]["latlng"][1] + 
          '&query=' + Model[place]["name"] + 
          '&intent=match';

        $.getJSON(foursquareUrl, function(data) {         
          if(data.response.venues){
            var item = data.response.venues[0];
            console.log(item);
            allLocations.push(item);
            location = {lat: item.location.lat, lng: item.location.lng, name: item.name, loc: item.location.address + " " + item.location.city + ", " + item.location.state + " " + item.location.postalCode};
            locationDataArr.push(location);
            placeMarkers(allLocations, place, location, map, markers);
          } else {
            alert("Something went wrong, Could not retreive data from foursquare. Please try again!");
            return;
          }
        });    
      }
    }


    // place marker for the result locations on the map
  function placeMarkers(allLocations, place, data, map, markers) {
    var latlng = new google.maps.LatLng(data.lat, data.lng);
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      animation: google.maps.Animation.DROP,
      content: data.name + "<br>" + data.loc
    });
  
    // create infoWindow for each marker on the map
    var infoWindow = new google.maps.InfoWindow({
      content: marker.content
    });
    marker.infowindow = infoWindow;
    markers.push(marker);
    allLocations()[allLocations().length - 1].marker = marker;

    // show details info about location when user clicks on a marker
    google.maps.event.addListener(marker, 'click', function() {
      // close the open infowindow
      for (var i = 0; i < markers().length; i++) {
        markers()[i].infowindow.close(); 
      }
      infoWindow.open(map, marker);
    });

    // toggle bounce when user clicks on a location marker on google map
    google.maps.event.addListener(marker, 'click', function() {
      toggleBounce(marker);
    });
}

// Add bounce to a marker
function toggleBounce(marker) {  
  // Google map documentation shows to keep one "=" instead of two. Does not work with "=="
  if (marker.setAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 600);
  }
}

// clickHandler on location list view
function centerLocation(data, map, markers) {
  // close the open infowindow  
  for (var i = 0; i < markers().length; i++) {
    markers()[i].infowindow.close(); 
  }  
  map.setCenter(new google.maps.LatLng(data.location.lat, data.location.lng));
  map.setZoom(12);
  for (var i = 0; i < markers().length; i++) {  
    var content = markers()[i].content.split('<br>');
    if (data.name === content[0]) {     
      toggleBounce(markers()[i]);
    }
  }
}   

  ko.applyBindings(new appViewModel());
});