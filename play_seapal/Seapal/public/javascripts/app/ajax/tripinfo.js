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
	        //$('#manoever').append("<option>" + data['manoever'] + '</option>');
	        //$('#vorsegel').append('<option>' + data['vorsegel'] + '</option>');
	        //$('#marker').append('<option>' + data['marker'] + '</option>');
	        $('#manoever').val(data['manoever']);
			$('#vorsegel').val(data['vorsegel']);
			$('#marker').val(data['marker']);
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
		entry += "</div></td>";
	    entry += "</tr>";
	    
		$('#entries').append(entry);
	}	
	
	

	$('input[type=text][id=wdate]').tooltip();
	$('input[type=text][id=wtime]').tooltip();
	$('input[type=text][id=lat]').tooltip();
	$('input[type=text][id=lng]').tooltip();
	$('input[type=text][id=temperature]').tooltip();
	$('input[type=text][id=airPressure]').tooltip();
	$('input[type=text][id=waveHeight]').tooltip();
	$('#btm').tooltip();
	$('#dtm').tooltip();
	$('#cog').tooltip();
	$('#sog').tooltip();

	$('#wdate').datepicker();

	/* Validation for fields */
//	var latField = this.getElementById("lat");
	var lngField = this.getElementById("lng");
	var dateField = this.getElementById("wdate");
	var timeField = this.getElementById("wtime");
	var lngError = false;
	var dateError = false;
	var timeError = false;
	var nameError = true;

	lngField.onblur = function() {
		lngValue = parseInt(lngField.value.substring(0,3), 10);
		console.log(" longitude value: " + lngValue);
		if (lngValue > 179) {
			console.log("Wrong longitude value: " + lngValue);
			this.form.elements["lng"].value = "";
			$(this).closest('div').addClass("error");
			$('#errorMessageDiv').removeClass("hidden");
			lngError = true;			
		} else {
			$(this).closest('div').removeClass("error");
			lngError = false;
			if (!lngError && !dateError && !timeError)
				$('#errorMessageDiv').addClass("hidden");
		}
	};

	dateField.onblur = function() {
		monthValue = parseInt(dateField.value.substring(0,3), 10);
		dayValue = parseInt(dateField.value.substring(3,5), 10);
		if (dayValue > 31 || monthValue > 12) {
			console.log("Wrong date value: " + dayValue + "." + monthValue);
			this.form.elements["wdate"].value = "";
			$(this).closest('div').addClass("error");
			$('#errorMessageDiv').removeClass("hidden");
			dateError = true;		
		} else {
			$(this).closest('div').removeClass("error");
			dateError = false;
			if (!lngError && !dateError && !timeError)
				$('#errorMessageDiv').addClass("hidden");
		}	
	};


	timeField.onblur = function() {
		hourValue = parseInt(timeField.value.substring(0,3), 10);
		if (hourValue > 23) {
			console.log("Wrong hour value: " + hourValue);
			this.form.elements["wtime"].value = "";
			$(this).closest('div').addClass("error");
			$('#errorMessageDiv').removeClass("hidden");
			timeError = true;	
		} else {
			$(this).closest('div').removeClass("error");
			timeError = false;
			if (!lngError && !dateError && !timeError)
				$('#errorMessageDiv').addClass("hidden");
		}
	};


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

		var returnFlag = false;

		//check if there are errors or name is not given
		if ($('#name').val() == "") {
			$('#errorMessageName').removeClass("hidden");
			$('#name').closest('div').addClass("error");
			returnFlag = true;
		} else {
			$('#errorMessageName').addClass("hidden");
			$('#name').closest('div').removeClass("error");
		}

		if ($('#lat').val() == "" || $('#lng').val() == "") {
			$('#errorMessageCoord').removeClass("hidden");
			$('#lat').closest('div').addClass("error");
			$('#lng').closest('div').addClass("error");
			returnFlag = true;
		} else {
			$('#errorMessageCoord').addClass("hidden");
			$('#lat').closest('div').removeClass("error");
			$('#lng').closest('div').removeClass("error");
		}

		if (returnFlag)
			return;

		// Aktuelle URL kopieren
		var query = window.location.search;
		
		// Nummer des ausgewählten Trip aus der URL bekommen 
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
	
	/* Fuer Unwetterwarnungen */
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

		if(json.lat == "" || json.lng == "") {
			//"No longitude and latitude given!"
			$('#unwetterNoCoordinates').removeClass('hidden');
			return;
		} else {
			$('#unwetterNoCoordinates').addClass('hidden');
		}

		//var wnr = $.url().param('wnr');
		//var wnr = $(this).attr('id');

		jQuery.post("app_tripinfo_wetterAlarm.html", json, function(data) {

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
  						//show an error
  						$('#unwetterResponseError').empty();
  						$('#unwetterResponseError').append(data.response.error.description);
  						$('#unwetterResponseError').removeClass('hidden');
  					} else {
  						$('#unwetterResponseError').addClass('hidden');
  						zmw = data.location.l;
    					area = data.location.city;
  						console.log("Data Loaded: " + data.location.city);
  						console.log("Zmw: " + zmw);
  						urlForAlerts = "http://api.wunderground.com/api/9fccb4b03cdb647e/alerts"
  										 + zmw + ".json";
  						console.log(urlForAlerts);
  						$.get(urlForAlerts, function(data) {
  							if (data.alerts.length == 0) {
  								console.log("Keine Unwetterwarnungen vorhanden in " + area);
  								$('#unwetterNoAlerts').empty();
  								$('#unwetterNoAlerts').append("Keine Unwetterwarnungen vorhanden in <b>" + area + "!</b>");
  								$('#unwetterNoAlerts').removeClass('hidden');
  							} else {
  								$('#unwetterNoAlerts').addClass('hidden');
  								console.log("Alert: " + data.alerts[0].wtype_meteoalarm_name);
	  							console.log("Description: " + data.alerts[0].description);
	  							$('#unwetterAlert').empty();
	  							$('#unwetterAlert').append("<P align=left><b>Area:</b> " + area +  
	  								"\n<br /><b>Alert:</b> " + data.alerts[0].wtype_meteoalarm_name + 
	  								"\n<br /><b>Description:</b> " + data.alerts[0].description + 
	  								"\n\n<br /><br /><b>Level:</b> " + 
	  								data.alerts[0].level_meteoalarm_description + "</P>");
	  							$('#unwetterAlert').removeClass('hidden');
  							}
						}, "jsonp");
  					}
    			}
			});
		}, "json");

	});
	
	

	function masked(){
		$.mask.definitions['~']='[EeWw]';
		$.mask.definitions['+']='[NnSs]';
		$.mask.definitions['-']='[-+]';
		$.mask.definitions['h']="[0-8]";
		$.mask.definitions['j']="[0-5]";
		$.mask.definitions['p']="[0-1]";
		$.mask.definitions['l']="[0-2]";
		$.mask.definitions['d']="[0-3]";

		
		$('#lat').mask("h9°j9.99+");
		$('#lng').mask("p99°j9.99~");
	//	$('#wdate').mask("d9.p9.2099");
		$('#wtime').mask("l9:j9");
		$('#temperature').mask("-99 °C");
		$('#waveHeight').mask("999 cm");
		$('#airPressure').mask("999 mmHg");
		$('#cog').mask("999°");
		$('#btm').mask("999°");
		$('#sog').mask("99 kn");
		$('#dtm').mask("99 kn");
	}

	$(document).ready(function(event) {
		masked();
	});

});