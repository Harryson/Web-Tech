$(function() {
	
	function loadEntry() { 
	
		var query = window.location.search;
		
		var waypnrQuery = query.match(/wnr=\d/);
		var waypnr = waypnrQuery[0].replace(/wnr=/, "");
		
		jQuery.get("app_tripinfo_load.html", {'wnr': waypnr}, function(data) {
	   
	        $('#name').val(data['name']);
	        $('#lat').val(data['lat']);
	        $('#lng').val(data['lng']);
	        $('#btm').val(data['btm']);
	        $('#dtm').val(data['dtm']);
	        $('#sog').val(data['sog']);
	        $('#cog').val(data['cog']);
	        $('#manoever').append('<option>' + data['manoever'] + '</option>');
	        $('#vorsegel').append('<option>' + data['vorsegel'] + '</option>');
	        $('#marker').append('<option>' + data['marker'] + '</option>');
	        $('#wdate').val(data['wdate']);
	        $('#wtime').val(data['wtime']);
	        $('#windStrength').val(data['windStrength']);
	        $('#windDirection').val(data['windDirection']);
	        $('#airPressure').val(data['airPressure']);
	        $('#temperature').val(data['temperature']);
	        $('#clouds').val(data['clouds']);
	        $('#rain').val(data['rain']);
	        $('#waveHeight').val(data['waveHeight']);
	        $('#waveDirection').val(data['waveDirection']);
	        

	    }, "json");
    	
	};

	$('#getWeatherAlarms').click(function(event) {
		event.preventDefault();
		var zmw;
		var urlForAlerts;
		var myUrl;
		var area;
		var json = {
			"lat": $('#lat').val(),
	        "lng": $('#lng').val()
		};

		var wnr = $.url().param('wnr');

		jQuery.post("app_waypoint_wetterAlarm.html?wnr=" + wnr , json, function(data) {

			console.log("data.latConv: " + data['latConv'] + " data.lngConv: " + data['lngConv']);

			//example for constance: 47°39.62' N 9°10,53' E	

			myUrl = "http://api.wunderground.com/api/9fccb4b03cdb647e/geolookup/q/"
			+ data['latConv']+ "," + data['lngConv'] + ".json";
		

			$.ajax({
  				url: myUrl,
  				dataType: 'jsonp',
  				async: false,
  				success: function(data) {

  					//counting number of objects in json response
  					//i == 1 if error
  					//i > 1 if no error
  					var i = 0;
  					for (var x in data)
  						if (data.hasOwnProperty(x))
  							i++;

  					if (i == 1) {
  						console.log(data.response.error.description);
  						alert(data.response.error.description);
  					} else {
  						zmw = data.location.l;
    					area = data.location.city;
  						console.log("Data Loaded: " + data.location.city);
  						console.log("Zmw: " + zmw);
  						urlForAlerts = "http://api.wunderground.com/api/9fccb4b03cdb647e/alerts"
  										 + zmw + ".json";
  						console.log(urlForAlerts);
  						$.get(urlForAlerts, function(data) {
  							if (data.alerts.length == 0) {
  								console.log("No weather alerts in " + area);
  								alert("No weather alerts in " + area);
  							} else {
  								console.log("Alert: " + data.alerts[0].wtype_meteoalarm_name);
	  							console.log("Description: " + data.alerts[0].description);
	  							alert("Area: " + area +  
	  								"\nAlert: " + data.alerts[0].wtype_meteoalarm_name + 
	  								"\nDescription: " + data.alerts[0].description + 
	  								"\n\nLevel: " + data.alerts[0].level_meteoalarm_description);
  							}
						}, "jsonp");
  					}
    			}
			});
		}, "json");

	});

	$('#save').click(function(event) {
	
		event.preventDefault();
	
		var json = {
	        "name": $('#name').val(),
	        "btm": $('#btm').val(),
	        "dtm": $('#dtm').val(),
	        "lat": $('#lat').val(),
	        "lng": $('#lng').val(),
	        "sog": $('#sog').val(),
	        "cog": $('#cog').val(),
	        "manoever": $('#manoever').val(),
	        "vorsegel": $('#vorsegel').val(),
	        "wdate": $('#wdate').val(),
	        "wtime": $('#wtime').val(),
	        "marker": $('#marker').val(),
	        "windStrength": $('#windStrength').val(),
	        "windDirection": $('#windDirection').val(),
	        "airPressure": $('#airPressure').val(),
	        "temperature": $('#temperature').val(),
	        "clouds": $('#clouds').val(),
	        "rain": $('#rain').val(),
	        "waveHeight": $('#waveHeight').val(),
	        "waveDirection": $('#waveDirection').val()
	    };

	    var wnr = $.url().param('wnr');
	
	    jQuery.post("app_waypoint_update.html?wnr=" + wnr , json, function(data) { 
	    
	    //	if (data['wnr'].match(/Error/)) {
		//    	
		//    	$('#dialogTitle').text('Error');
		//    	$('#dialogMessage').text(data['wnr'].replace(/Error: /, ""));
		//    	
	    //	} else {
		//    	$('#dialogTitle').text('Success');
		//    	$('#dialogMessage').text("Eintrag wurde erfolgreich gespeichert.");
	    //	}
	    //	
	    //	$('#messageBox').modal('show');
	    
	    }, "json");
		
	});

	function masked(){
		$.mask.definitions['~']='[EeWw]';
		$.mask.definitions['+']='[NnSs]';
		$.mask.definitions['-']='[-+]';
		$.mask.definitions['h']="[0-8]";
		$.mask.definitions['j']="[0-5]";
		$.mask.definitions['k']="[0-1]";
		$.mask.definitions['l']="[0-2]";
		
		$('#lat').mask("h9°j9.99+");
		$('#lng').mask("k99°j9.99~");
		$('#wdate').mask("99.99.2099");
		$('#wtime').mask("l9:j9");
		$('#temperature').mask("-99 °C");
		$('#waveHeight').mask("999 cm");
		$('#airPressure').mask("999 mmHg");
	}

	var dateDDMMYYYRegex = '^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$';
	
	$(document).ready(function(event) {
		loadEntry();
		masked();
	});
	
	
});