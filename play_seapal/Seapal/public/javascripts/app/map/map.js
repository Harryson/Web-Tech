
var map = null;

var overlay = new google.maps.OverlayView();

var MODE = { DEFAULT: { value: 0, name: "default" }, ROUTE: { value: 1, name: "route" }, DISTANCE: { value: 2, name: "distance" }, NAVIGATION: { value: 3, name: "navigation" } };
var currentMode = MODE.DEFAULT;

var currentPositionMarker = null;
var followCurrentPosition = false;
var noToggleOfFollowCurrentPositionButton = false;

var temporaryMarker = null;
var temporaryMarkerInfobox = null;
var temporaryMarkerTimeout = null;

var fixedMarker = null;
var fixedMarkerInfoBox = null;
var fixedMarkerCount = 0;
var fixedMarkerArray = new Array();

var selectedMarker = null;

var currentPositionMarkerImage = new google.maps.MarkerImage('/assets/images/icons/boat.png',
    new google.maps.Size(50, 50), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(25, 40)  //offset point
);

var temporaryMarkerImage = new google.maps.MarkerImage('/assets/images/icons/cross_hair.png',
    new google.maps.Size(43, 43), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(22, 22)  //offset point
);

var fixedMarkerImage = new google.maps.MarkerImage('/assets/images/icons/flag6.png',
    new google.maps.Size(40, 40), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(9, 32)  //offset point
);

var routeMarkerImage = new google.maps.MarkerImage('/assets/images/icons/flag4.png',
    new google.maps.Size(40, 40), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(7, 34)  //offset point
);

var distanceMarkerImage = new google.maps.MarkerImage('/assets/images/icons/flag5.png',
    new google.maps.Size(40, 40), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(7, 34)  //offset point
);

var destinationMarkerImage = new google.maps.MarkerImage('/assets/images/icons/destination.png',
    new google.maps.Size(28, 31), //size
    new google.maps.Point(0, 0),  //origin point
    new google.maps.Point(7, 9)  //offset point
);

function MarkerWithInfobox(marker, infobox, counter) {
    this.reference = marker;
    this.infobox = infobox;
    this.counter = counter;
}

var overlayMaps = [
    {
        getTileUrl: function (coord, zoom) {
            return "http://tiles.openseamap.org/seamark/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenSeaMap",
        maxZoom: 18
    },{
        getTileUrl: function (coord, zoom) {
            return "http://www.openportguide.org/tiles/actual/wind_vector/5/" + zoom + "/" + coord.x + "/" + coord.y + ".png"
        },
        tileSize: new google.maps.Size(256, 256),
        name: "Wind",
        maxZoom: 7
    },{
        getTileUrl: function (coord, zoom) {
            return "http://www.openportguide.org/tiles/actual/air_temperature/5/" + zoom + "/" + coord.x + "/" + coord.y + ".png"
        },
        tileSize: new google.maps.Size(256, 256),
        name: "temperature",
        maxZoom: 7
    },{
        getTileUrl: function (coord, zoom) {
            return "http://www.openportguide.org/tiles/actual/significant_wave_height/5/" + zoom + "/" + coord.x + "/" + coord.y + ".png"
        },
        tileSize: new google.maps.Size(256, 256),
        name: "wave_height",
        maxZoom: 7
    },{
        getTileUrl: function (coord, zoom) {
            return "http://www.openportguide.org/tiles/actual/precipitation/5/" + zoom + "/" + coord.x + "/" + coord.y + ".png"
        },
        tileSize: new google.maps.Size(256, 256),
        name: "precipitation_height",
        maxZoom: 7
    }
];

// initialize map and all event listeners
function initialize() {

    // set different map types
    var mapTypeIds = ["roadmap", "satellite", "OSM"];

    // set map Options
    var mapOptions = {
        center: new google.maps.LatLng(47.65521295468833, 9.2010498046875),
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControlOptions: {
            mapTypeIds: mapTypeIds
        },
        disableDefaultUI: true,
        mapTypeControl: true
    };

    //set route menu position
    document.getElementById('followCurrentPositionContainer').style.width = document.body.offsetWidth + "px";
    document.getElementById('routeMenuContainer').style.width = document.body.offsetWidth + "px";
    document.getElementById('routeMenuContainer').style.display = "none";
    document.getElementById('distanceToolContainer').style.width = document.body.offsetWidth + "px";
    document.getElementById('distanceToolContainer').style.display = "none";
    document.getElementById('navigationContainer').style.width = document.body.offsetWidth + "px";
    document.getElementById('navigationContainer').style.display = "none";
    document.getElementById('chat').style.display = "none";

    // initialize map
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    
    // set client position
    currentPosition = new google.maps.LatLng(47.65521295468833, 9.2010498046875)

    var currentMarkerOptions = {
        center: currentPosition,
        map: map,
        icon: currentPositionMarkerImage
    }

    // initialize marker for current position

    currentPositionMarker = new google.maps.Marker(currentMarkerOptions);

    // set map types
    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));

    google.maps.event.addListener(currentPositionMarker, 'position_changed', function () {
        
        if (followCurrentPosition) {
            map.setCenter(currentPositionMarker.getPosition());
        }
        
        if (currentMode == MODE.NAVIGATION) {
            updateNavigation(currentPositionMarker.position, destinationMarker.position);
        }
    });

    overlay.draw = function () { };
    overlay.setMap(map);

    // click on map
    google.maps.event.addListener(map, 'click', function (event) {

        // handler for default mode
        if (currentMode == MODE.DEFAULT) {
            setTemporaryMarker(event.latLng);
        } else if (currentMode == MODE.ROUTE || currentMode == MODE.DISTANCE) {
            addRouteMarker(event.latLng);
        }
    });

    google.maps.event.addListener(map, 'center_changed', function () {
        if (followCurrentPosition && !noToggleOfFollowCurrentPositionButton) {
            toggleFollowCurrentPosition();
        } else {
            noToggleOfFollowCurrentPositionButton = false;
        }
    });
    // load google weather layer
    var weatherLayer = new google.maps.weather.WeatherLayer({
        temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
    });

    for (i = 0; i < overlayMaps.length; i++){
        map.overlayMapTypes.push(null);
    }

    // Toggel Weather Layers
    $('.toggleWeather').click(function(){
        var layerID = parseInt($(this).attr('value'));
        var tmpZoom = map.getZoom();
        if ($(this).attr('checked')){
            // add layers
            if(layerID == 6){ // google weather
                weatherLayer.setMap(map);
                if(tmpZoom > 12){
                    map.setZoom(12);
                }
                return;
            }
            var overlayMap = new google.maps.ImageMapType(overlayMaps[layerID]);
            map.overlayMapTypes.setAt(layerID, overlayMap);
            if(tmpZoom > 7 && layerID != 0){
                map.setZoom(7);
            }
        } else {
            if (map.overlayMapTypes.getLength() > 0){
                map.overlayMapTypes.setAt(layerID, null);
            }
            if(layerID == 6){ // google weather
                weatherLayer.setMap(null);
            }
        }
    });
    loadStatistics ();
}

// Add weather statistics -------------------------------------------------------------------------------------------
function loadStatistics () {
    var curd = new Date();
    var d = new Date(curd.getFullYear(), curd.getMonth(), curd.getDate());
    var s = Math.round(( d.getTime() ) /1000) - 3600*24*1;
    var lat = map.getCenter().lat();
    var lng = map.getCenter().lng();

    var url = "http://openweathermap.org/data/2.5/forecast?lat=" + lat
            + "&lon=" + lng + "&cnt=10&start=" + s;

    getWeather(url, function(JSONobject) {

        console.log(JSONobject);
        data = JSONobject.list;

        // showSimpleChart('windStatistic', data);
        showIconsChart('temperaturStatistics', data);
        // showBarsDouble('chart4', data);
        // showTempMinMax('chart2', data);
        // showIconsChart('chart3', data);

        // showTemp('chart5', data);
        showWind('windStatistics', data);
        showHourlyForecastChart();
        // chartSpeed('chart3', data);
        // showPolarSpeed('chart-wind', data);
        // showPolar('chart-wind', data);
        // chartDoublePress('chart-wind', data);
    });
}

function getWeather(weather, callback) {
    $.ajax({
        dataType : "jsonp",
        url : weather,
        success : callback
    });
}

var time_zone = 1000 * (new Date().getTimezoneOffset()) * (-60);

function getData(JSONtext)
{
    JSONobject = ParseJson(JSONtext);
    data = JSONobject.list;

    showSimpleChart('windStatistic', data);

    // showBarsDouble('chart4', data);
    // showTempMinMax('chart2', data);
    // showIconsChart('chart3', data); 

    // showTemp('chart5', data);
    // showWind('chart6', data);       

//  chartSpeed('chart3', data);
//  showPolarSpeed('chart-wind', data);
//  showPolar('chart-wind', data);
//  chartDoublePress('chart-wind', data);
}

function ParseJson(JSONtext)
{
    try{
        JSONobject = JSON.parse(JSONtext); 
    }catch(e){
        alert('JSONText')
        // ShowAlertMess('Error JSON');
        return;
    }

    if(JSONobject.cod != '200') {
        ShowAlertMess('Error '+ JSONobject.cod + ' ('+ JSONobject.message +')');
        return;
    }
    var mes = JSONobject.cod;
    if(JSONobject.calctime)
        mes = mes + ' ' + JSONobject.calctime;
    if(JSONobject.message)
        mes = mes + ' ' + JSONobject.message;
    console.log( mes );
    return JSONobject;
}

// ---------------------------------------------------------------------------------------------------
// temporary marker context menu ----------------------------------------- //
$(function () {
    $.contextMenu({
        selector: '#temporaryMarkerContextMenu',
        events: {
            hide: function () {
                startTimeout();
            }
        },
        callback: function (key, options) {
        
            if (key == "marker") {
                setFixedMarker(temporaryMarker.position)
            } else if (key == "startroute") {
                startNewRoute(temporaryMarker.position, false);
            } else if (key == "distance") {
                startNewRoute(temporaryMarker.position, true);
            } else if (key == "destination") {
            	startNewNavigation(currentPositionMarker.position, temporaryMarker.position);
            } else if (key == "weather") {
                loadPositionWeather(currentPositionMarker.position);
            } else if (key == "delete") {
                temporaryMarker.setMap(null);
                temporaryMarkerInfobox.setMap(null);
            }
        },
        items: {
            "marker": { name: "Markierung setzen", icon: "marker" },
            "startroute": { name: "Neue Route setzen", icon: "startroute" },
            "distance": { name: "Distanz messen", icon: "distance" },
            "destination": { name: "Zum Ziel machen", icon: "destination" },
            "weather": { name: "Wetter laden", icon: "destination"},
            "sep1": "---------",
            "delete": { name: "L&ouml;schen", icon: "delete" }
        }
    });
});

// fixed marker context menu ------------------------------------------------ //
$(function () {
    $.contextMenu({
        selector: '#fixedMarkerContextMenu',
        callback: function (key, options) {
            if (key == "destination") {

                startNewNavigation(currentPositionMarker.position, selectedMarker.reference.position);
            
            } else if (key == "delete") {
                selectedMarker.reference.setMap(null);
                selectedMarker.infobox.setMap(null);
                fixedMarkerArray.splice(fixedMarkerArray.indexOf(selectedMarker), 1);
            }
        },
        items: {
            "destination": { name: "Zum Ziel machen", icon: "destination" },
            "sep1": "---------",
            "delete": { name: "L&ouml;schen", icon: "delete" }
        }
    });
});

// helper functions --------------------------------------------------------- //

// start marker timout
function startTimeout() {

    temporaryMarkerTimeout = setTimeout(function () {
        temporaryMarker.setMap(null);
        temporaryMarkerInfobox.setMap(null);
    }, 5000);
}

// stop marker timout
function stopTimeout() {
    clearTimeout(temporaryMarkerTimeout);
}

// draw temporaryMarkerInfobox 
function drawTemporaryMarkerInfobox(latLng) {
    customTxt = "<div class='markerInfoBox well' id='temporaryMarkerInfobox'>"
     + formatCoordinate(latLng.lat(), "lat") + " "
     + formatCoordinate(latLng.lng(), "long")
     + "</br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspDTM " + getDistance(latLng, currentPositionMarker.position) + "m</div>";
    //return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, -110, -60);
    //$('body').append("<span>" + latLng.lat() + " " + latLng.lng() + "</span><br>");
    return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, -113, -92);
}

// // draw fixedMarkerInfobox 
function drawFixedMarkerInfobox(latLng, counter) {

    customTxt = "<div class='markerInfoBox label' id='fixedMarkerInfobox'>"
     + "Markierung " + (counter) + "</div>";
    return new TxtOverlay(latLng, customTxt, "coordinate_info_box", map, 40, -29);
}

function getMarkerWithInfobox(event) {

    for (var i = 0; i < fixedMarkerArray.length; i++) {
        if (fixedMarkerArray[i].reference.position == event.latLng) {
            return fixedMarkerArray[i];
        }
    }
    return null;
}

function setTemporaryMarker(position) {

    var temporaryMarkerOptions = {
        position: position,
        map: map,
        icon: temporaryMarkerImage,
        draggable: true
    }

    // delete temp marker & infobox
    if (temporaryMarker != null) { temporaryMarker.setMap(null); }
    if (temporaryMarkerInfobox != null) { temporaryMarkerInfobox.setMap(null); }

    stopTimeout();
    temporaryMarker = new google.maps.Marker(temporaryMarkerOptions);

    // click on marker
    google.maps.event.addListener(temporaryMarker, 'click', function (event) {
        var pixel = fromLatLngToPixel(event.latLng);
        
        if (currentMode == MODE.DEFAULT) {
	        $('#temporaryMarkerContextMenu').contextMenu({ x: pixel.x, y: pixel.y });
        }
        
        stopTimeout();
    });

    // marker is dragged
    google.maps.event.addListener(temporaryMarker, 'drag', function (event) {
        temporaryMarkerInfobox.setMap(null);
        temporaryMarkerInfobox = drawTemporaryMarkerInfobox(event.latLng);
    });

    // marker drag start
    google.maps.event.addListener(temporaryMarker, 'dragstart', function (event) {
        stopTimeout();
    });

    // marker drag end
    google.maps.event.addListener(temporaryMarker, 'dragend', function (event) {
        startTimeout();
    });

    startTimeout();
    temporaryMarkerInfobox = drawTemporaryMarkerInfobox(position);
}

function setFixedMarker(position) {

    temporaryMarker.setMap(null);
    temporaryMarkerInfobox.setMap(null);
    stopTimeout();

    fixedMarkerCount++;
    var fixedMarkerOptions = {
        position: position,
        map: map,
        title: 'Markierung ' + fixedMarkerCount,
        icon: fixedMarkerImage,
        draggable: true
    }

    fixedMarker = new google.maps.Marker(fixedMarkerOptions);

    // click on fixed marker
    google.maps.event.addListener(fixedMarker, 'click', function (event) {
        selectedMarker = getMarkerWithInfobox(event);
        var pixel = fromLatLngToPixel(event.latLng);
        
        if (currentMode != MODE.NAVIGATION) {
	        $('#fixedMarkerContextMenu').contextMenu({ x: pixel.x, y: pixel.y });
        }
    });

    // marker is dragged
    google.maps.event.addListener(fixedMarker, 'drag', function (event) {
        selectedMarker = getMarkerWithInfobox(event);
        selectedMarker.infobox.setMap(null);
        selectedMarker.infobox = drawFixedMarkerInfobox(event.latLng, selectedMarker.counter);
    });

    fixedMarker.setMap(map);
    fixedMarkerInfoBox = drawFixedMarkerInfobox(temporaryMarker.position, fixedMarkerCount);
    fixedMarkerArray.push(new MarkerWithInfobox(fixedMarker, fixedMarkerInfoBox, fixedMarkerCount));
}

function getDistance(coord1, coord2) {
    return Math.round(google.maps.geometry.spherical.computeDistanceBetween(coord1, coord2));
}

function fromLatLngToPixel(latLng) {

    var pixel = overlay.getProjection().fromLatLngToContainerPixel(latLng);
    pixel.x += document.getElementById('map_canvas').offsetLeft;
    pixel.y += document.getElementById('map_canvas').offsetTop;
    return pixel;
}

function toggleFollowCurrentPosition() {
    followCurrentPosition = !followCurrentPosition;
    if (followCurrentPosition) {
        document.getElementById("followCurrentPositionbutton").value = "Eigener Position nicht mehr folgen";
        noToggleOfFollowCurrentPositionButton = true;
        map.setCenter(currentPositionMarker.getPosition());
    } else {
        document.getElementById("followCurrentPositionbutton").value = "Eigener Position folgen";
    }
    document.getElementById('followCurrentPositionContainer').style.width = document.body.offsetWidth + "px";
}

function showHourlyForecastChart()
{

    var curdate = new Date( (new Date()).getTime()- 180 * 60 * 1000 );

    var cnt=0;

    var time = new Array();
    var tmp = new Array();
    var wind = new Array();
    var prcp = new Array();

    for(var i = 0; i <  forecast.length; i ++){

        var dt = new Date(forecast[i].dt * 1000);
    
        if( curdate  > dt ) continue;
        if(cnt > 10)        break;
        cnt++;

        tmp.push( Math.round(10*(forecast[i].main.temp))/10  );
        time.push( new Date( forecast[i].dt * 1000 + time_zone) );
        wind.push(forecast[i].speed);

        var p=0;
        if(forecast[i]['rain'] && forecast[i]['rain']['3h'])    p += forecast[i]['rain']['3h'];
        if(forecast[i]['snow'] && forecast[i]['snow']['3h'])    p += forecast[i]['snow']['3h'];
        prcp.push( Math.round( p * 10 ) / 10 );
    }

    $('#weatherStatistics').highcharts({
            chart: {
                zoomType: 'xy'
            },
            title: NaN,

            xAxis: {
                categories: time,
                type: 'datetime',
                labels: {
                    formatter: function() {
                        return Highcharts.dateFormat('%H:%M', this.value);
                    }                   
                }
            },
            yAxis: [
            {
                labels: {
                    format: '{value}°C',
                    style: {
                        color: 'blue'
                    }
                },
                opposite: true, 
                title:NaN
            },{
                labels: {
                    format: '{value}mm',
                    style: {
                        color: '#4572A7'
                    }
                },
                opposite: true,             
                title: NaN
            }],
            tooltip: {
                useHTML: true,
                shared: true,                
                formatter: function() {
                    var s = '<small>'+ Highcharts.dateFormat('%d %b. %H:%M', this.x) +'</small><table>';
                    $.each(this.points, function(i, point) {
                            s += '<tr><td style="color:'+point.series.color+'">'+ point.series.name +': </td>'+
                            '<td style="text-align: right"><b>'+point.y +'</b></td></tr>';
                    });
                    return s+'</table>';
                }
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 410,
                verticalAlign: 'top',
                y: 0,
                floating: true,
                backgroundColor: '#FFFFFF'
            }, 
            series: [
            {
                name: 'Precipitation',
                type: 'column',   
                color: '#A0A0A0',      
                yAxis: 1,
                data: prcp
            },{
                name: 'Temperature',
                type: 'spline',
                color: 'blue',
                data: tmp
            }]
        });
};