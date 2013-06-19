$(function() {

	function masked(){
		$.mask.definitions['~']='[+-]';
		$.mask.definitions['1']='[0123]';
		$.mask.definitions['2']='[01]';
		$('#longitude').mask("~199.99");
		$('#latitude').mask("~299.99");
	}

	$(document).ready(function(event) {
		masked();
	});

    $('#datepicker').datepicker();

	$('#calculate').click(function(event) {
		
		/* Defaultfunktionalität ausschalten */
		event.preventDefault();

		var date = document.getElementById('datepicker').value

		var dateSplit = date.split("/");
		alert(dateSplit[0] + dateSplit[1] + dateSplit[2]);
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