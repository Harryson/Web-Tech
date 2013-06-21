$(function() {
	$(document).ready(function(event) {
		loadEntry();
	});

	function loadEntry() { 
            
	    jQuery.get("app_sos_load.html", function(data) {
	     
			/*$('#name').val(data['name']);
			$('#latitude').val(data['lat']);
			$('#longitude').val(data['lng']);
			$('#btm').val(data['btm']);
			$('#dtm').val(data['dtm']);
			$('#sog').val(data['sog']);
			$('#cog').val(data['cog']);
			$('#manoever').append('<option>' + data['manoever'] + '</option>');
			$('#vorsegel').append('<option>' + data['vorsegel'] + '</option>');
			$('#marker').append('<option>' + data['marker'] + '</option>');
			
			$('#windStrength').val(data['windStrength']);
			$('#windDirection').val(data['windDirection']);
			$('#airPressure').val(data['airPressure']);
			$('#temperature').val(data['temperature']);
			$('#clouds').val(data['clouds']);
			$('#rain').val(data['rain']);
			$('#waveHight').val(data['waveHight']);
			$('#waveDirection').val(data['waveDirection']);*/
	      	//var text = data['name'];


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
	
		var json = {
            "boat": $('#boat').val(),
            "lat": $('#latitude').val(),
            "lng": $('#longitude').val(),
	        "date": $('#day').val(),
	        "time": $('#time').val(),
	        "com": $('#com').val()          
	    };
	
	    jQuery.post("app_sos_send.html", json, function(data) { 
	    
	    	if (data['snr'].match(/Error/)) {
		    	
		    	$('#dialogTitle').text('Error');
		    	$('#dialogMessage').text(data['snr'].replace(/Error: /, ""));
		    	
	    	} else {
		    	
		    	sendEntry( data['snr'], json ); 
	    
		    	$('#dialogTitle').text('Success');
		    	$('#dialogMessage').text("Eintrag wurde erfolgreich gespeichert.");
	    	}
	    
	    	$('#messageBox').modal('show');
	    	    	
	    }, "json");
	});
});