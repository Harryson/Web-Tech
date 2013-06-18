
var routeCount = 0;
var routeArray = new Array();
var currentRoute = null;
var destinationRoute = null;
var destinationMarker = null;
var draggedMarkerIndex = null;
var selectedRouteMarker = null;

var activePathOptions = {
    strokeColor: "#427F94",
    strokeOpacity: 1.0,
    strokeWeight: 3
}

var inactivePathOptions = {
    strokeColor: "#427F94",
    strokeOpacity: 0.5,
    strokeWeight: 2
}

var distanceToolOptions = {
    strokeColor: "#FDB771",
    strokeOpacity: 0.7,
    strokeWeight: 3
}

function Route(route) {
    this.route = route;
    this.markerArray = new Array();
    this.length = 0;
    
    routeCount++;
    this.name = "Route " + routeCount;
    this.markerInfobox = null;
}

// route context menu ------------------------------------------------ //
$(function () {
    $.contextMenu({
        selector: '#routeContextMenu_active',
        callback: function (key) {
            if (key == "deleteMarker") {
                deleteRouteMarker();
            } else if (key == "addMarker") {
                var position = selectedRouteMarker.position;
                var index;
                for (var i = currentRoute.markerArray.length; i > 0; i--) {
                    if (currentRoute.markerArray[i - 1].position == position) {
                        index = i;
                        break;
                    }
                }
                addRouteMarker(position, index);
            }
        },
        items: {
            "deleteMarker": { name: "Wegpunkt l&ouml;schen", icon: "deleteMarker" },
            "addMarker": { name: "Wegpunkt hinzuf&uuml;gen", icon: "addMarker" }
        }
    });
});

$(function () {
    $.contextMenu({
        selector: '#routeContextMenu_inactive',
        callback: function (key) {
            if (key == "selectRoute") {
                if (currentRoute != null) {
                    toggleDraggable(currentRoute);
                    currentRoute.route.setOptions(inactivePathOptions);
                }
                if (currentMode == MODE.DISTANCE) {
                    stopDistanceToolMode();
                }
                currentRoute = getRouteByMarker(selectedRouteMarker);
                currentMode = MODE.ROUTE;
                currentRoute.route.setOptions(activePathOptions);
                toggleDraggable(currentRoute);
                updateRouteDistance();
                document.getElementById('routeMenuContainer').style.display = "block";
            }
        },
        items: {
            "selectRoute": { name: "Diese Route ausw&auml;hlen", icon: "selectRoute" }
        }
    });
});

function addRouteMarker(position, index) {

    var path = currentRoute.route.getPath();

    var marker;
    
    if (currentMode == MODE.ROUTE) {
        marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: routeMarkerImage,
        draggable: true
        });
    } else {
        marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: distanceMarkerImage,
        draggable: true
        });
    }
      

    google.maps.event.addListener(marker, 'click', function (event) {
        selectedRouteMarker = getRouteMarker(event.latLng);
        var pixel = fromLatLngToPixel(event.latLng);
        if (getRouteByMarker(selectedRouteMarker) == currentRoute) {
            $('#routeContextMenu_active').contextMenu({ x: pixel.x, y: pixel.y });
        } else {
            $('#routeContextMenu_inactive').contextMenu({ x: pixel.x, y: pixel.y });
        }
    });

    google.maps.event.addListener(marker, 'dragstart', function (event) {
        selectedRouteMarker = getRouteMarker(event.latLng);
        var path = currentRoute.route.getPath();
        path.forEach(function (item, index) {
            if (path.getAt(index) == selectedRouteMarker.position) {
                draggedMarkerIndex = index;
            }
        });
    });

    google.maps.event.addListener(marker, 'drag', function (event) {
        var path = currentRoute.route.getPath();
        path.removeAt(draggedMarkerIndex);
        path.insertAt(draggedMarkerIndex, selectedRouteMarker.position);
        updateRouteDistance();
        
        if (currentRoute.markerArray.indexOf(selectedRouteMarker) == 0) {
        
        	if (currentMode == MODE.ROUTE) {
	        	currentRoute.markerInfobox = drawRouteInfobox(marker.position, currentRoute.name);
        	} else {
	        	currentRoute.markerInfobox = drawDistanceInfobox(marker.position);
        	}
        }
    });

    marker.setMap(map);

    if (index == null) {
        path.push(position);
        currentRoute.markerArray.push(marker);
    } else {
        if (index == currentRoute.markerArray.length) {
            index--;
        }

        var coords1, coords2;
        if (currentRoute.markerArray.length > 1) {
            coords1 = currentRoute.markerArray[index - 1].getPosition();
        } else {
            coords1 = currentRoute.markerArray[index].getPosition();
        }
        coords2 = currentRoute.markerArray[index].getPosition();

        var newPosition = new google.maps.LatLng((coords1.lat() + coords2.lat()) / 2, (coords1.lng() + coords2.lng()) / 2);

        path.insertAt(index, newPosition);
        marker.setPosition(newPosition);
        currentRoute.markerArray.splice(index, 0, marker);
    }

    updateRouteDistance();

}

// removes selected route marker
function deleteRouteMarker() {

    selectedRouteMarker.setMap(null);
    
    var index = currentRoute.markerArray.indexOf(selectedRouteMarker);
    
    currentRoute.markerArray.splice(currentRoute.markerArray.indexOf(selectedRouteMarker), 1);
    var path = currentRoute.route.getPath();
    path.forEach(function (item, index) {
        if (path.getAt(index) == selectedRouteMarker.position) {
            path.removeAt(index);
        }
    });
    
    if (index == 0) {
    
    	 if (currentMode == MODE.ROUTE || currentMode == MODE.DISTANCE ) {
    	 	
    	 	if (currentRoute.markerArray.length == 0) {
    	 	
	    	 	currentRoute.markerInfobox.setMap(null);
	    	 	stopRouteMode();
	    	 	return;
	    	 	
    	 	} else {
	    	 	currentRoute.markerInfobox = drawRouteInfobox(currentRoute.markerArray[index].position, currentRoute.name);
    	 	}
	    	 
	     } else {
		     currentRoute.markerInfobox = drawDistanceInfobox(currentRoute.markerArray[index].position);
		 }
    }
    
    updateRouteDistance();
}

function updateRouteDistance() {

    currentRoute.length = 0;

    for (var i = 0; i < currentRoute.markerArray.length - 1; i++) {
        currentRoute.length += getDistance(currentRoute.markerArray[i].position, currentRoute.markerArray[i + 1].position);
    }

    if (currentMode == MODE.DISTANCE) {
        document.getElementById("distanceTool_number").innerHTML = currentRoute.length;
    } else {
        document.getElementById("route_distance_number").innerHTML = currentRoute.length;
    }
}

// draw fixedMarkerInfobox 
function drawRouteInfobox(latLng, name) {

    if (currentRoute.markerInfobox != null) {
        currentRoute.markerInfobox.setMap(null);
    }

    customTxt = "<div class='markerInfoBox label label-info' id='fixedMarkerInfobox'>"
     + name + "</div>";
    return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, 40, -29);
}

// draw fixedMarkerInfobox
function drawDistanceInfobox(latLng) {

    if (currentRoute.markerInfobox != null) {
        currentRoute.markerInfobox.setMap(null);
    }

    customTxt = "<div class='markerInfoBox label label-warning' id='fixedMarkerInfobox'>Distance</div>";
    return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, 40, -29);
}

function startNewRoute(position, isDistanceToolRoute) {

    var route;

    if (isDistanceToolRoute) {
        route = new google.maps.Polyline(distanceToolOptions);
        document.getElementById('distanceToolContainer').style.display = "block";
        currentMode = MODE.DISTANCE;
    } else {
        route = new google.maps.Polyline(activePathOptions);
        document.getElementById('routeMenuContainer').style.display = "block";
        currentMode = MODE.ROUTE;
        
    }

    // delete temp marker & infobox
    if (temporaryMarker != null) { temporaryMarker.setMap(null); }
    if (temporaryMarkerInfobox != null) { temporaryMarkerInfobox.setMap(null); }

    // initialize new route
    currentRoute = new Route(route);
    route.setMap(map);
    
    if (!isDistanceToolRoute) {
        currentRoute.markerInfobox = drawRouteInfobox(position, currentRoute.name);
    } else {
	    currentRoute.markerInfobox = drawDistanceInfobox(position);
    }
    
    routeArray.push(currentRoute);
    addRouteMarker(position);
}

function stopRouteMode() {
    
    if (currentRoute.markerArray.length == 1 && currentMode == MODE.ROUTE) {
        currentRoute.markerArray[0].setMap(null);
    } else { 
        currentRoute.route.setOptions(inactivePathOptions);
        toggleDraggable(currentRoute);  
    }
    
    currentRoute = null;
    currentMode = MODE.DEFAULT;

    document.getElementById('routeMenuContainer').style.display = "none";
    document.getElementById('distanceToolContainer').style.display = "none";

}

function startNewNavigation(start, destination) {
	
	document.getElementById('navigationContainer').style.display = "block";
    currentMode = MODE.NAVIGATION;
	
	// delete temp marker & infobox
    if (temporaryMarker != null) { temporaryMarker.setMap(null); }
    if (temporaryMarkerInfobox != null) { temporaryMarkerInfobox.setMap(null); }
    
    var pathCoordinates = [start, destination];
    
    destinationRoute = new google.maps.Polyline({
	    path: pathCoordinates,
	    strokeColor: "#27F646",
	    strokeOpacity: 0.7,
	    strokeWeight: 3
    });
    
    destinationMarker = new google.maps.Marker({
        position: destination,
        map: map,
        icon: destinationMarkerImage,
        draggable: true
    });
    
    google.maps.event.addListener(destinationMarker, 'drag', function (event) {
        
        updateNavigation(currentPositionMarker.position, destinationMarker.position);
        
    });
    
    updateNavigationDistance(currentPositionMarker.position, destinationMarker.position);
    
    destinationMarker.setMap(map);
    destinationRoute.setMap(map);
  
}

function updateNavigation(start, destination) {

    destinationRoute.setMap(null);
        
    updateNavigationDistance(start, destination);
        
    var pathCoordinates = [start, destination];
    
    destinationRoute = new google.maps.Polyline({
        path: pathCoordinates,
        strokeColor: "#27F646",
        strokeOpacity: 0.7,
        strokeWeight: 3
    });
	    
    destinationRoute.setMap(map);
}

function updateDestinationMarker(newPosition) {

    destinationMarker.setPosition(newPosition);
 
}

function updateNavigationDistance(start, destination) {
	
	var distance = 0;

    distance = getDistance(start, destination);
   
    document.getElementById("navigation_number").innerHTML = distance;
}

function stopNavigationMode() {
	currentMode = MODE.DEFAULT;
	destinationMarker.setMap(null);
    destinationRoute.setMap(null);
    navigationRoute = null;
    document.getElementById('navigationContainer').style.display = "none";
}

function stopDistanceToolMode() {
    deleteRoute();
}

function deleteRoute() {

    currentRoute.route.setMap(null);
    currentRoute.markerInfobox.setMap(null);

    for (var i = 0; i < currentRoute.markerArray.length; i++) {
        currentRoute.markerArray[i].setMap(null);
    }
    routeArray.splice(routeArray.indexOf(currentRoute), 1);
    stopRouteMode();
}

function saveRoute() {
    alert('Save Route!')
}

function toggleDraggable(route) {

    for (var i = 0; i < route.markerArray.length; i++) {
        route.markerArray[i].setDraggable(!route.markerArray[i].getDraggable());
    }
}

function getRouteMarker(latLng) {

    for (var i = 0; i < routeArray.length; i++) {
        for (var j = 0; j < routeArray[i].markerArray.length; j++) {
            if (routeArray[i].markerArray[j].position == latLng) {
                return routeArray[i].markerArray[j];
            }
        }
    }
    return null;
}

function getRouteByMarker(marker) {

    for (var i = 0; i < routeArray.length; i++) {
        for (var j = 0; j < routeArray[i].markerArray.length; j++) {
            if (routeArray[i].markerArray[j] == marker) {
                return routeArray[i];
            }
        }
    }
    return null;
}