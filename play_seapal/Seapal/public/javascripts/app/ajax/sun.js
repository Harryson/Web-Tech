$(function() {

	function masked(){
		$('#longitude').mask("99.99.9999");
		$('#latitude').mask("99:99");
	}

	$(document).ready(function(event) {
		masked();
	});

	$('#calculate').click(function(event) {
		
		/* Defaultfunktionalität ausschalten */
		event.preventDefault();

		/* wrong input */


		var json = {
            "longitude": $('#longitude').val(),
            "latitude": $('#latitude').val(),
            "day": $('#day').val(),
	        "timediv": $('#timediv').val()     
	    };

		//Durch "function(date)" wird die Funktion in {} erst ausfeführt, wenn die "jQuery.post" Funktion schon abgeschlossen ist
	    jQuery.post("app_sun_insert.html", json, function(data) { 
	    	
			loadEntry(data['sunrise'], data['sunset'], json.longitude, json.latitude, json.day, json.timediv); 
	
	    	$('#dialogTitle').text('Berechnung');
	    	$('#dialogMessage').text("Uhrzeiten wurden erfolgreich berechnet.");
			$('#messageBox').modal('show'); 	
	    }, "json");
	});

	function loadEntry(sunrise, sunset, longitude, latitude, day, timediv) {
		
		$('#longitude').val(longitude);
        $('#latitude').val(latitude);
        $('#day').val(day);
        $('#timediv').val(timediv);
        $('#sunrise').val(sunrise);
        $('#sunset').val(sunset);
	}

});