$(function() {
	$(document).ready(function(event) {
		loadEntry();
	});

	function loadEntry() { 
            
	    jQuery.get("app_sos_load.html", function(data) {

	      	$('#boatname').val(data['bootname']);
			$('#latitude').val(data['lat']);
			$('#longitude').val(data['lng']);
	      	$('#day').val(data['wdate']);
			$('#time').val(data['wtime']);
	    }, "json");
	}


	function sendEntry(wnr, json) {
		
		var entry = "";
		
		entry += "<tr class='selectable'>";
	    entry += "<td><span class='wnr' style='display: none;'>" + wnr + "</span>" + json.name + "</td>";
	    entry += "<td>" + json.lat + "</td>";
	    entry += "<td>" + json.lng + "</td>";
	    entry += "<td>" + json.btm + "</td>";
	    entry += "<td>" + json.dtm + "</td>";
	    entry += "<td>" + json.manoever + "</td>";
	    entry += "<td style='width:30px; text-align:right;'><div class='btn-group'>";
	    entry += "<a class='btn btn-small view' id='" + wnr + "'><span><i class='icon-eye-open'></i></span></a>";
		entry += "<a class='btn btn-small remove' id='" + wnr + "'><span><i class='icon-remove'></i></span></a>";
		entry += "<a href='app_waypoint.html?wnr=" + wnr  + "' class='btn btn-small redirect' id='" + wnr + "'><span><i class='icon-chevron-right'></i></span></a>";
		entry += "</div></td>";
	    entry += "</tr>";
	    
		$('#entries').append(entry);
	}

	$('#send').click(function(event) {

		event.preventDefault();

		var flagName = false;

		if($('#name').val() == "") {
			flagName = true;
		}
	
		var json = {
			"name": $('#name').val(),
            "boatname": $('#boatname').val(),
            "lat": $('#latitude').val(),
            "lng": $('#longitude').val(),
	        "date": $('#day').val(),
	        "time": $('#time').val(),
	        "com": $('#com').val()          
	    };

	    $('#dialogTitle').text('Falsche Eingabe');
				$('#dialogMessage').text("Sie müssen einen Namen eingeben");
				$('#messageBox').modal('show');
	
	    jQuery.post("app_sos_send.html", json, function(data) { 

	    	if(flagName) {

				$('#dialogTitle').text('Falsche Eingabe');
				$('#dialogMessage').text("Sie müssen einen Namen eingeben");

			} else {

				if (data['snr'].match(/Error/)) {
		    	
			    	$('#dialogTitle').text('Error');
			    	$('#dialogMessage').text(data['snr'].replace(/Error: /, ""));
			    	
		    	} else {
			    	
			    	sendEntry( data['snr'], json ); 
		    
			    	$('#dialogTitle').text('Success');
			    	$('#dialogMessage').text("Eintrag wurde erfolgreich gespeichert.");
		    	}
			}

	    	$('#messageBox').modal('show');
	    	    	
	    }, "json");
	});
});