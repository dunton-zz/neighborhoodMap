var map, markers; 

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.784623, lng: -73.948598},
		zoom: 13,
		mapTypeControl: false
	});
};

var locations = [
          {title: 'Carmines', location: {lat: 40.791240, lng: -73.973989}},
          {title: 'Home', location: {lat: 40.789550, lng: -73.970588}},
          {title: 'Barney Greengrass', location: {lat: 40.788043, lng: -73.974504}},
          {title: 'Symphony Space', location: {lat: 40.794131, lng: -73.972696}},
          {title: 'The Gin Mill', location: {lat: 40.784957, lng: -73.977559}},
          {title: 'Milk Bar Upper West Side', location: {lat: 40.787410, lng: -73.971401}},
          {title: 'Mitchell\'s Wines & Liquor Store', location: {lat: 40.787958, lng: -73.975590}}
        ];

function showListings(markers) {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < markers.length; i++) {
    	markers[i].setMap(map);
    	bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
};

function hideListings(markers) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
};

function populateInfoWindow(marker, infowindow) {

	if (infowindow.marker != marker) {
		infowindow.setContent('');
		infowindow.marker = marker;

		infowindow.addListener('closeclick', function() {
			infowindow.marker = null;
		});

		var streetViewService = new google.maps.StreetViewService();
		var radius = 50;

		function getStreetView(data, status) {
			if (status == google.maps.StreetViewStatus.OK) {
				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(
					nearStreetViewLocation, marker.position);
				infowindow.setContent('<div>' +marker.title + '</div><div id="pano"></div>');
				var panoramaOptions = {
					position: nearStreetViewLocation,
					pov: {
						heading: heading,
						pitch: 30
					}
				};
				var panorama = new google.maps.StreetViewPanorama(
					document.getElementById('pano'), panoramaOptions);
			}
			else {
				infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View</div>');
			}
		}
		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		infowindow.open(map, marker);
	}
	
};



var appViewModel = function(data) {
	
	var self = this;
	self.markers = ko.observableArray([]);
	self.allLocations = ko.observableArray([]);
	self.filter = ko.observable("");
	self.search = ko.observable("");


	var map = initMap();
	self.map = ko.observable(map);
	var Infowindow = new google.maps.InfoWindow();

	var defaultIcon = makeMarkerIcon('0091ff');

	var highlightedIcon = makeMarkerIcon('FFFF24');

	for (var i = 0; i < data.length; i++){
		var title = data[i].title;
		var position = data[i].location

		var marker = new google.maps.Marker({
			title: title,
			position: position,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon,
			id: i
		});

		var toggleBounce = function() {
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			}
			else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}
		};

		self.markers.push(marker);
		//self.allMarkers.push(marker);


		marker.addListener('click', function() {
			populateInfoWindow(this, Infowindow)
		})

		marker.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});

	}

	
	
	self.filterList = ko.computed(function() {
		return ko.utils.arrayFilter(self.allLocations(), function(item) {
			if (item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !==-1) {
				if (item.marker)
					item.marker.setMap(map);
			} else {
				if(item.marker)
					item.marker.setMap(null);
			}
			return item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
		});
	}, self);
	
	

	function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
    };

    showListings(data);


    

}


ko.applyBindings(new appViewModel(locations));

