$(function() {

	function masked(){
		$.mask.definitions['~']='[+-]';
		$.mask.definitions['1']='[01]';
		$('#longitude').mask("~199?.99");
		$('#latitude').mask("~99?.99");
		$('#timediv').mask("~99");
	}

	$(document).ready(function(event) {
		masked();
	});

    $('#datepicker').datepicker();

	$('#calculate').click(function(event) {
		
		/* Defaultfunktionalität ausschalten */
		event.preventDefault();

		// Da es ein String sein soll und kein JQuery-Objekt
		var date = document.getElementById('datepicker').value;
		var lon = parseInt($('#longitude').val());
		var lat = parseInt($('#latitude').val());
		var utc = parseInt($('#timediv').val());
		var flagLon = false;
		var flagLat = false;
		var flagUtc = false;

		//if(Math.abs(lon) > 180 || Math.abs(lat) > 90) {
		if(lon > 180 || lon < -180) { 
			flagLon = true;
		}

		if (lat > 90 || lat < -90) {
			flagLat = true;
		}

		if (utc > 14 || utc < -11) {
			flagUtc =true;
		}

		var dateSplit = date.split("/");
		var day = (parseInt(dateSplit[1]) + ( 153 * parseInt(dateSplit[0]) - 162) / 5);

		var json = {
            "longitude": $('#longitude').val(),
            "latitude": $('#latitude').val(),
            "day": parseInt(day),
	        "timediv": $('#timediv').val()     
	    };

		//Durch "function(date)" wird die Funktion in {} erst ausfeführt, wenn die "jQuery.post" Funktion schon abgeschlossen ist
	    jQuery.post("app_sun_insert.html", json, function(data) { 
	    	
			loadEntry(data['sunrise'], data['sunset'], json.longitude, json.latitude, json.day, json.timediv); 
	
			if(flagLon) {
				$('#dialogTitle').text('Falsche Eingabe');
				$('#dialogMessage').text("-180 <= Längengrad <= +180");
				$('#messageBox').modal('show');
			}

			if(flagLat) {
				$('#dialogTitle').text('Falsche Eingabe');
				$('#dialogMessage').text("-90 <= Breitengrad >= +90");
				$('#messageBox').modal('show');
			}

			if(flagUtc) {
				$('#dialogTitle').text('Falsche Eingabe');
				$('#dialogMessage').text("-11 <= UTC <= +14");
				$('#messageBox').modal('show');
			}

			if(!flagLon && !flagLat && !flagUtc) {
		    	$('#dialogTitle').text('Berechnung');
		    	$('#dialogMessage').text("Uhrzeiten wurden erfolgreich berechnet.");
		    	$('#messageBox').modal('show');	
			} else {
				$('#sunrise').val("Fehler");
        		$('#sunset').val("Fehler");
			}
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