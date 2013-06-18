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
	        $('#waveHight').val(data['waveHight']);
	        $('#waveDirection').val(data['waveDirection']);
	        

	    }, "json");
    	
	};

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
	        "waveHight": $('#waveHight').val(),
	        "waveDirection": $('#waveDirection').val()
	    };
	    $('#dialogTitle').text('Test1');
		$('#dialogMessage').text('Test'));
		$('#messageBox').modal('show');

	    var wnr = $.url().param('wnr');
	
	    jQuery.post("app_waypoint_update.html?wnr=" + wnr , json, function(data) { 
	    
	    	if (data['wnr'].match(/Error/)) {
		    	
		    	$('#dialogTitle').text('Error');
		    	$('#dialogMessage').text(data['wnr'].replace(/Error: /, ""));
		    	
	    	} else {

		    	$('#dialogTitle').text('Success');
		    	$('#dialogMessage').text("Eintrag wurde erfolgreich gespeichert.");
	    	}
	    	
	    	$('#messageBox').modal('show');
	    
	    }, "json");
		
	});

	function masked(){
		$('#wdate').mask("99.99.9999");
		$('#wtime').mask("99:99");
	}

	var dateDDMMYYYRegex = '^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$';
	
	$(document).ready(function(event) {
		loadEntry();
		masked();
	});
	
	
});
