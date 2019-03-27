"use strict";

var mapStyles = [
    {
        "elementType": "geometry",
        "stylers": [
        	{ "visibility": "off" }
		]
	},{
		"elementType": "labels",
		"stylers": [
			{ "visibility": "on" }
		]
	},{
		"featureType": "poi",
		"stylers": [
			{ "visibility": "off" }
		]
	},{
		"featureType": "landscape",
		"stylers": [
   			{ "visibility": "off" }
		]
	},{
		"featureType": "transit.line",
		"stylers": [
			{ "visibility": "off" }
		]
	},{
		"featureType": "road",
		"elementType": "geometry",
		"stylers": [
			{ "visibility": "on" }
		]
	},{
		"featureType": "water",
		"elementType": "geometry",
		"stylers": [
			{ "visibility": "simplified" }
		]
	},{
		"featureType": "transit",
		"elementType": "geometry",
		"stylers": [
			{ "visibility": "off" }
		]
	},{
		"featureType": "road",
		"elementType": "labels",
		"stylers": [
			{ "visibility": "on" }
		]
	},{
		"featureType": "transit",
		"elementType": "labels",
		"stylers": [
			{ "visibility": "off" }
		]
	},{
		"featureType": "water",
		"elementType": "labels",
		"stylers": [
			{ "visibility": "off" }
		]
	},{
		"featureType": "road.highway",
		"elementType": "geometry.fill"
	},{
		"featureType": "road.highway",
		"elementType": "geometry.stroke"
	},{
		"featureType": "road.highway",
		"elementType": "labels.text.fill"
	},{
		"featureType": "transit.station.bus",
		"stylers": [
			{ "visibility": "off" }
		]
	},{
		"featureType": "road",
		"elementType": "geometry.stroke"
	}
];

var _json = '';
var _index = -1;
var markerClusterer = null;
var map = null;

function initialize() {

	var center = new google.maps.LatLng(12.1000,26.0333);
	var minZoomLevel = 3;

	map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 3,
      center: center,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
	  scrollwheel: false,
      loginControl: false,
      zoomControl: true,
		mapTypeControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM,
			style: google.maps.ZoomControlStyle.SMALL
		},
      styles: mapStyles,
    });

    map.setCenter(center, 17);

	google.maps.event.addDomListener(map, 'idle', function() {
		center = map.getCenter();
	});

    google.maps.event.addDomListener(window, 'resize', function() {
	  map.setCenter(center);
	});

    google.maps.event.addListener(map, 'zoom_changed', function() {
	  if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
	});

    // refreshMap(map, data.locations);
    $.get('/portfolio/map/js/index.json', function (data) {
		_json = data.locations;
		refreshMap(map, data.locations);
	}, 'json');

}

	var	info = $('#info-canvas');
	   // _json = data.locations;

// markers setup
var image = {	url: 'images/purple-marker.png',
	size: new google.maps.Size(24, 34),
	origin: new google.maps.Point(0,0),
	anchor: new google.maps.Point(12, 0)
};
var shape = {
	coords: [1,18,1,26,10,33,16,33,24,25,24,17,13,1],
	type: 'poly'
};
var imageActive = {
	url: 'images/purple-active-marker.png',
	size: new google.maps.Size(43, 60),
	origin: new google.maps.Point(0,0),
	anchor: new google.maps.Point(22, 30)
};

var markers = [];

function refreshMap(map, locations) {
	if (markerClusterer) {
	  markerClusterer.clearMarkers();
	}	

	for (var i = 0; i < locations.length; ++i) {
      var latLng = new google.maps.LatLng(locations[i].lat,
          locations[i].lng)
      var marker = new google.maps.Marker({
	       position: latLng,
	       map: map,
	       icon: image,
	       shape: shape,
	       institution: locations[i].institution,
		   zIndex: locations[i].zIndex,
		   mType: 'standard'
      });
      google.maps.event.addListener(marker, 'click', (function(marker, index) {
		return function(){
			updateMarkers(marker);
			showDetail(locations, index);
			try {ga('send', 'event', 'fulbright-map', 'click');} catch(err) {}
		}
	  })(marker, i));
      markers.push(marker);
    }

	markerClusterer = new MarkerClusterer(map, markers, {
	 // maxZoom: -1,
	  gridSize: 30,
	});
}

function clearClusters(e) {
	e.preventDefault();
	e.stopPropagation();
	markerClusterer.clearMarkers();
}

google.maps.event.addDomListener(window, 'load', initialize);

/**
 * reset markers and set the clicked one to active
 * @param marker
 */
function updateMarkers(marker,setActive) {
	// reset all icons to the normal state
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].mType !== 'movie') {
			markers[i].setIcon(image);
			markers[i].setClickable(true);
		} else {
			markers[i].setIcon(imageMovie);
			markers[i].setClickable(true);
		}
	}
	function setActive(marker) {
		if (marker.mType !== 'movie') {
			marker.setIcon(imageActive);
		} else {
			marker.setIcon(imageMovieActive);
		}
		marker.setClickable(false);
	}
	setActive(marker); // callback
}

// *
//  * Populate the location detail
//  * @param index
//  * @param locations
 
function showDetail(locations, index) {
	_index = index;
    var	_el = $('#info-content'),
		_l = locations[index]
	;
	_el.html('');
    // $('#info-canvas').height('auto');
	_el.append('<h2>'+  _l.institution + '</h2>');
	_el.append('<p>'+  _l.location + '</p>');
	_el.append('<h3>Partnership</h3>');
	
	if ( _l.partnerships.length != null) {
      var partnerdata = '<ul>';
		for (var i = 0; i < _l.partnerships.length; i++) {
			if ( _l.partnerships[i].type === 'Customized Study Abroad') {
				if ( _l.partnerships[i].url != '') {
					partnerdata += '<li><a href="/portfolio">' + _l.partnerships[i].type + ' Program: ' + _l.partnerships[i].program + '</a> &#8211; ' + _l.partnerships[i].unit + '</li>';
				}
				else {
					partnerdata += '<li>' + _l.partnerships[i].type + ' Program: ' + _l.partnerships[i].program + ' &#8211; '+ _l.partnerships[i].unit + '</li>';
				}
				
			}
			else {
				if ( _l.partnerships[i].url != '') {
					partnerdata += '<li><a href="/portfolio">' + _l.partnerships[i].type + '</a> &#8211; '+ _l.partnerships[i].unit + '</li>';
				}
				else {
					partnerdata += '<li>' + _l.partnerships[i].type + ' &#8211; '+ _l.partnerships[i].unit + '</li>';
				}
			}
		}
		partnerdata += '</ul>'
		_el.append( partnerdata );
	}
}

$('#nav-button-prev').on("click",function(e) {
	_index--;
	if (_index < 0) { _index = _json.length - 1; }
	showDetail(_json, _index);
	updateMarkers(markers[_index]);
	map.setCenter({lat: _json[_index].lat, lng: _json[_index].lng});
	map.setZoom(6); 
});

$('#nav-button-next').on("click",function(e) {
	_index++;
	if (_index >= _json.length) { _index = 0; }
	showDetail(_json, _index);
	updateMarkers(markers[_index]);
	map.setCenter({lat: _json[_index].lat, lng: ( _json[_index].lng - 0.02 )});
	map.setZoom(6);
});