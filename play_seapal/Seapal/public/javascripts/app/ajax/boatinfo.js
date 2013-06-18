$(function() {
	
	function loadEntry(boatnr) { 
			        	
	    jQuery.get("app_boatinfo_load.html", {'bnr': boatnr}, function(data) {

	        $('#bootname').val(data['bootname']);
	        $('#typ').val(data['typ']);
	        $('#baujahr').val(data['baujahr']);
	        $('#registernummer').val(data['registernummer']);
	        $('#konstrukteur').val(data['konstrukteur']);
	        $('#motor').val(data['motor']);
	        $('#segelzeichen').val(data['segelzeichen']);
	        $('#laenge').val(data['laenge']);
	        $('#tankgroesse').val(data['tankgroesse']);
	        $('#heimathafen').val(data['heimathafen']);
	        $('#breite').val(data['breite']);
	        $('#wassertankgroesse').val(data['wassertankgroesse']);
	        $('#yachtclub').val(data['yachtclub']);
	        $('#tiefgang').val(data['tiefgang']);
	        $('#abwassertankgroesse').val(data['abwassertankgroesse']);
	        $('#eigner').val(data['eigner']);
	        $('#masthoehe').val(data['masthoehe']);
	        $('#grosssegelgroesse').val(data['grosssegelgroesse']);
	        $('#versicherung').val(data['versicherung']);
	        $('#verdraengung').val(data['verdraengung']);
	        $('#genuagroesse').val(data['genuagroesse']);
	        $('#rufzeichen').val(data['rufzeichen']);
	        $('#rigart').val(data['rigart']);
	        $('#spigroesse').val(data['spigroesse']);
	
	    } , "json");
	}
	
	function addEntry(bnr, json) {
		
		var entry = ""; 
			
		entry += "<tr class='selectable' id='" + bnr + "'>";
		entry += "<td>" + json.bootname + "</td>";
		entry += "<td>" + json.typ + "</td>";
        entry += "<td>" + json.konstrukteur + "</td>";
        entry += "<td>" + json.baujahr + "</td>";
        entry += "<td>" + json.heimathafen + "</td>";
        entry += "<td>" + json.laenge + "</td>";
        entry += "<td>" + json.breite + "</td>";
        entry += "<td>" + json.tiefgang + "</td>";
        entry += "<td>" + json.eigner + "</td>";
        entry += "<td style='width:30px; text-align:left;'><div class='btn-group'>";
        entry += "<a class='btn btn-small view' id='" + bnr + "'><span><i class='icon-eye-open'></i></span></a>";
        entry += "<a class='btn btn-small remove' id='" + bnr + "'><span><i class='icon-remove'></i></span></a>";
        entry += "</div></td>";
        entry += "</tr>";

		$('#entries').append(entry);
	}

	$('a.view').live("click", function(event) {
		loadEntry($(this).attr('id'));
	});

	$('a.remove').live("click", function(event) {
		var buttonID = this;
	 	var boatnr = $(this).attr('id');

		jQuery.get("app_boatinfo_delete.html", { "bnr": boatnr }, function(data) {
		 
		 	if (data['bnr'].match(/Error/)) {
		    	
		    	$('#dialogTitle').text('Error');
		    	$('#dialogMessage').text(data['bnr'].replace(/Error: /, ""));
		    	
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
		
		var json = {
	          "bootname": $('#bootname').val(),
	          "typ": $('#typ').val(),
	          "baujahr": $('#baujahr').val(),
		        "registernummer": $('#registernummer').val(),
		        "konstrukteur": $('#konstrukteur').val(),
		        "motor": $('#motor').val(),
		        "segelzeichen": $('#segelzeichen').val(),
		        "laenge": $('#laenge').val(),
		        "tankgroesse": $('#tankgroesse').val(),
		        "heimathafen": $('#heimathafen').val(),
		        "breite": $('#breite').val(),
		        "wassertankgroesse": $('#wassertankgroesse').val(),
		        "yachtclub": $('#yachtclub').val(),
		        "tiefgang": $('#tiefgang').val(),
		        "abwassertankgroesse": $('#abwassertankgroesse').val(),
		        "eigner": $('#eigner').val(),
		        "masthoehe": $('#masthoehe').val(),
		        "grosssegelgroesse": $('#grosssegelgroesse').val(),
		        "versicherung": $('#versicherung').val(),
		        "verdraengung": $('#verdraengung').val(),
		        "genuagroesse": $('#genuagroesse').val(),
		        "rufzeichen": $('#rufzeichen').val(),
		        "rigart": $('#rigart').val(),
		        "spigroesse": $('#spigroesse').val()              
	    };
		
		jQuery.post("app_boatinfo_insert.html", json, function(data) { 
			
			if (data['bnr'].match(/Error/)) {
		    	
		    	$('#dialogTitle').text('Error');
		    	$('#dialogMessage').text(data['bnr'].replace(/Error: /, ""));
		    	
	    	} else {
		    	
		    	addEntry( data['bnr'], json ); 
	    
		    	$('#dialogTitle').text('Success');
		    	$('#dialogMessage').text("Eintrag wurde erfolgreich gespeichert.");
	    	}
			
			$('#messageBox').modal('show');
		
		}, "json");
	
	});

});

