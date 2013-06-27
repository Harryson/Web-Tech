
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
        showIconsChart('temperaturStatistics', data);
        showWind('windStatistics', data);
        $('#tableOrt1').empty();
        $('#tableOrt2').empty();
        $('#tableOrt1').append(JSONobject.city.name);
        $('#tableOrt2').append(JSONobject.city.name);
        $('#tableLand').empty();
        $('#tableLand').append(JSONobject.city.country);
        $('#tableLat').empty();
        $('#tableLat').append(JSONobject.city.coord.lat);
        $('#tableLng').empty();
        $('#tableLng').append(JSONobject.city.coord.lon);
        $('#tableTemp1').empty();
        $('#tableTemp2').empty();
        $('#tableTemp1').append(parseInt(JSONobject.list[5].main.temp - 273, 10) + " °C");
        $('#tableTemp2').append(parseInt(JSONobject.list[5].main.temp - 273, 10) + " °C");
        $('#tableLuft').empty();
        $('#tableLuft').append(JSONobject.list[5].main.humidity + " %");
        $('#tableWolken').empty();
        $('#tableWolken').append(JSONobject.list[5].clouds.all);
        $('#tableLuftdruck').empty();
        $('#tableLuftdruck').append(JSONobject.list[5].main.pressure + " hPa");
        $('#tableWind').empty();
        $('#tableWind').append(JSONobject.list[5].wind.speed + " m/s");

        $('#littleWeatherImage').attr("src","/assets/images/WeatherIcons/" + JSONobject.list[5].weather[0].icon + ".png");

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

    // showSimpleChart('windStatistic', data);
    // showBarsDouble('weatherStatistics', data);
    // showTempMinMax('temperaturStatistics', data);
    // showIconsChart('weatherStatistics', data);
    
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
                loadStatistics();
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
// daily = [{"dt":1372244400,"temp":{"day":12.64,"min":5.46,"max":12.64,"night":5.46,"eve":12.64,"morn":12.64},"pressure":960.29,"humidity":80,"weather":[{"id":802,"main":"Clouds","description":"scattered clouds","icon":"03d"}],"speed":1.41,"deg":59,"clouds":36},{"dt":1372330800,"temp":{"day":12.79,"min":9.03,"max":12.89,"night":9.03,"eve":11.29,"morn":9.79},"pressure":956.78,"humidity":80,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":2.31,"deg":288,"clouds":80,"rain":1},{"dt":1372417200,"temp":{"day":13.3,"min":7.35,"max":13.3,"night":7.35,"eve":11.84,"morn":9.59},"pressure":954.83,"humidity":93,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":1.77,"deg":290,"clouds":56,"rain":0.5},{"dt":1372503600,"temp":{"day":11.51,"min":10.35,"max":11.63,"night":10.35,"eve":11.34,"morn":10.65},"pressure":953.9,"humidity":100,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":2.76,"deg":220,"clouds":92,"rain":10.5},{"dt":1372590000,"temp":{"day":13.55,"min":10.96,"max":13.55,"night":10.96,"eve":12.48,"morn":11.05},"pressure":958.18,"humidity":93,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":2.61,"deg":267,"clouds":92,"rain":6},{"dt":1372676400,"temp":{"day":19.07,"min":12.49,"max":20.06,"night":12.97,"eve":18.94,"morn":12.49},"pressure":955.39,"humidity":89,"weather":[{"id":800,"main":"Clear","description":"sky is clear","icon":"01d"}],"speed":1.16,"deg":30,"clouds":0},{"dt":1372762800,"temp":{"day":17.57,"min":12.44,"max":17.57,"night":12.44,"eve":17.47,"morn":12.67},"pressure":959.76,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":2.64,"deg":258,"clouds":69,"rain":3.61},{"dt":1372849200,"temp":{"day":20.25,"min":12.74,"max":20.25,"night":12.74,"eve":20.1,"morn":14.03},"pressure":960.2,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":0.69,"deg":171,"clouds":25,"rain":1.7},{"dt":1372935600,"temp":{"day":21.4,"min":14.33,"max":21.4,"night":14.33,"eve":21.14,"morn":15.04},"pressure":959.34,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":0.66,"deg":97,"clouds":0,"rain":0.69},{"dt":1373022000,"temp":{"day":20.5,"min":11.63,"max":20.5,"night":11.63,"eve":16.8,"morn":16.81},"pressure":958.54,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":3.76,"deg":304,"clouds":10,"rain":1.79},{"dt":1373108400,"temp":{"day":16.1,"min":8.29,"max":16.1,"night":8.29,"eve":15.21,"morn":12.27},"pressure":959.32,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":2.02,"deg":297,"clouds":59},{"dt":1373194800,"temp":{"day":18.58,"min":11.38,"max":18.58,"night":11.38,"eve":18.13,"morn":11.88},"pressure":958.02,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":1.9,"deg":271,"clouds":1,"rain":0.73},{"dt":1373281200,"temp":{"day":20.83,"min":13.61,"max":20.83,"night":13.61,"eve":20.19,"morn":14.81},"pressure":955.98,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":2.07,"deg":36,"clouds":0,"rain":0.65},{"dt":1373367600,"temp":{"day":22.82,"min":14.65,"max":22.82,"night":14.65,"eve":22.75,"morn":15.03},"pressure":952.02,"humidity":0,"weather":[{"id":800,"main":"Clear","description":"sky is clear","icon":"01d"}],"speed":2.53,"deg":72,"clouds":0},{"dt":1373454000,"temp":{"day":23.47,"min":17.18,"max":23.47,"night":17.18,"eve":21.02,"morn":17.42},"pressure":945.07,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":1.63,"deg":144,"clouds":91,"rain":11.63},{"dt":1373540400,"temp":{"day":17.18,"min":17.18,"max":17.18,"night":17.18,"eve":17.18,"morn":17.18},"pressure":944.89,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":1.92,"deg":237,"clouds":65,"rain":7.03}];
function showDailyChart(daily)
{

    var time = new Array();
    var tmp = new Array();
    var tmpr = new Array();
    var rain = new Array();
    var snow = new Array();
    var prcp = new Array();
    var wind = new Array();


    for(var i = 0; i <  daily.length-1; i ++){

        tmp.push( Math.round(10*(daily[i].temp.day))/10  );
        var dt = new Date( daily[i].dt * 1000 + time_zone);
        time.push( dt );

        var tmpi =  Math.round(10*(daily[i].temp.min))/10 ;
        var tmpa =  Math.round(10*(daily[i].temp.max))/10 ;
        tmpr.push( [tmpi, tmpa ]  );


        if(daily[i]['rain'])    {
            rain.push( Math.round(daily[i]['rain']*100) / 100 );
        }else{
            rain.push( 0 );         
        }
        if(daily[i]['snow'])    {
            snow.push( Math.round(daily[i]['snow']*100) / 100 );
        }else{
            snow.push( 0 );
        }
    }


    $('#WeatherStatistics16days').highcharts({
            chart: {
            //    zoomType: 'xy'
                type: 'column'
            },
            title: NaN,
            xAxis: {
                categories: time,
                labels: {
                    formatter: function() {
                        return Highcharts.dateFormat('%d %b', this.value);
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
                title: {
                    text: NaN,
                    style: {
                        color: 'blue'
                    }
                }
            },{
                labels: {
                    format: '{value} mm',
                    style: {
                        color: '#909090'
                    }
                },
                opposite: true,             
                title: {
                    text: NaN,
                    style: {
                        color: '#4572A7'
                    }                    
                }
            }],
            tooltip: {
                useHTML: true,
                shared: true,                
                formatter: function() {
                    var s = '<small>'+ Highcharts.dateFormat('%d %b', this.x) +'</small><table>';
                    $.each(this.points, function(i, point) {
                        console.log(point);
                            if(point.y != 0)
                                s += '<tr><td style="color:'+point.series.color+'">'+ point.series.name +': </td>'+
                                '<td style="text-align: right"><b>'+point.y +'</b></td></tr>';
                    }
                    );
                    return s+'</table>';
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
            legend: NaN,
            series: [
            {
                name: 'Snow',
                type: 'column', 
                color: '#909090',      
                yAxis: 1,         
                data: snow,
                stack: 'precipitation'
            },
            {
                name: 'Rain',
                type: 'column', 
                color: '#B0B0B0',      
                yAxis: 1,         
                data: rain,
                stack: 'precipitation'
            },
            {
                name: 'Temperature',
                type: 'spline',
                color: 'blue',
                data: tmp
            },
            {
                name: 'Temperature min',
                data: tmpr,
                type: 'arearange',
                lineWidth: 0,
                linkedTo: ':previous',
                color: Highcharts.getOptions().colors[0],
                fillOpacity: 0.3,
                zIndex: 0
            } 
            ]
        });
}