$(function() {
	
	$('#save').click(function(event) {
		
		/* Defaultfunktionalität ausschalten */
		event.preventDefault();
	
		var json = {
			"tnr": tripnr,
            "name": $('#longitude').val(),
            "lat": $('#latitude').val(),
            "lng": $('#day').val(),
	        "btm": $('#timediv').val(),     
	    };

	    alert("1");
	
		// Durch "function(date)" wird die Funktion in {} erst ausfeführt, wenn die "jQuery.post" Funktion schon abgeschlossen ist
	    jQuery.post("app_sun_insert.html", json, function(data) { 

			loadEntry(data['sunrise'], data['sunset'], json); 
		    
	    	$('#dialogTitle').text('Success');
	    	$('#dialogMessage').text("Uhrzeiten wurden erfolgreich berechnet.");

			$('#messageBox').modal('show');   	
	    }, "json");
	});

	function loadEntry(sunrise, sunset, json) {
		
		$('#longitude').val(json.longitude);
        $('#latitude').val(json.latitude);
        $('#day').val(json.day);
        $('#timediv').val(json.timediv);
        $('#sunrise').val(json.sunrise);
        $('#sunset').val(json.sunset);
	}

});