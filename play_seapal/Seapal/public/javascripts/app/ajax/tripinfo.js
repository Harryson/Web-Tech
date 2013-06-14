$(function() {

	function loadEntry(waypnr) { 
		
		jQuery.get("app_tripinfo_load.html", {'wnr': waypnr}, function(data) {
	   
	        $('#name').val(data['name']);
	        $('#lat').val(data['lat']);
	        $('#lng').val(data['lng']);
	        $('#btm').val(data['btm']);
	        $('#dtm').val(data['dtm']);
	        $('#sog').val(data['sog']);
	        $('#cog').val(data['cog']);
	        $('#manoever').append("<option>" + data['manoever'] + '</option>');
	        $('#vorsegel').append('<option>' + data['vorsegel'] + '</option>');
	        $('#marker').append('<option>' + data['marker'] + '</option>');
	        $('#wdate').val(data['wdate']);
	        $('#wtime').val(data['wtime']);
	        
	    }, "json");
	}
	
	function addEntry(wnr, json) {
		
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
	
	$('a.view').live("click", function(event) {
		loadEntry($(this).attr('id'));
	});
	
	$('a.remove').live("click", function(event) {
		var buttonID = this;
	 	var waypnr = $(this).attr('id');
		jQuery.get("app_tripinfo_delete.html", { "wnr": waypnr }, function(data) { 
		
			if (data['wnr'].match(/Error/)) {
		    	
		    	$('#dialogTitle').text('Error');
		    	$('#dialogMessage').text(data['wnr'].replace(/Error: /, ""));
		    	
	    	} else {
		    	
		    	$(buttonID).parents('tr').remove();  
	    
		    	$('#dialogTitle').text('Succes');
		    	$('#dialogMessage').text("Eintrag wurde erfolgreich gelöscht.");
	    	}
		
			$('#messageBox').modal('show');
		}, "json");		
	});
	
	$('#save').click(function(event) {
	
		event.preventDefault();

		var query = window.location.search;
		
		var tripnrQuery = query.match(/tnr=\d/);
		var tripnr = tripnrQuery[0].replace(/tnr=/, "");
	
		var json = {
			"tnr": tripnr,
            "name": $('#name').val(),
            "lat": $('#lat').val(),
            "lng": $('#lng').val(),
	        "btm": $('#btm').val(),
	        "dtm": $('#dtm').val(),
	        "sog": $('#sog').val(),
	        "cog": $('#cog').val(),
	        "manoever": $("#manoever :selected").text(),
	        "vorsegel": $("#vorsegel :selected").text(),
	        "marker": $("#marker :selected").text(),
	        "wdate": $('#wdate').val(),
	        "wtime": $('#wtime').val()         
	    };
	
	    jQuery.post("app_tripinfo_insert.html", json, function(data) { 
	    
	    	if (data['wnr'].match(/Error/)) {
		    	
		    	$('#dialogTitle').text('Error');
		    	$('#dialogMessage').text(data['wnr'].replace(/Error: /, ""));
		    	
	    	} else {
		    	
		    	addEntry( data['wnr'], json ); 
	    
		    	$('#dialogTitle').text('Success');
		    	$('#dialogMessage').text("Eintrag wurde erfolgreich gespeichert.");
	    	}
	    
	    	$('#messageBox').modal('show');
	    	
	    }, "json");
	});

});