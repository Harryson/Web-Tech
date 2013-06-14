$(function() {
	updateChat('Connecting...');
	Server = new FancyWebSocket('ws://localhost:9300');

	// watch textarea for release of key press
	 $('#startSimulation').click(function(event) {	
            event.preventDefault();
            var text = "Request";
			sendChat(text);
	});
    
    // watch textarea for release of key press
	 $('#stopSimulation').click(function() {				 
            Server.disconnect();
	});

	//Let the user know we're connected
	Server.bind('open', function() {
		updateChat( "Connected." );
	});

	//OH NO! Disconnection occurred.
	Server.bind('close', function() {
		updateChat( "Disconnected." );
	});

	//Log any messages sent from server
	Server.bind('message', function( message ) {
		updateChat( message );
		if (!isNaN(message.split(" ")[0]) && !isNaN(message.split(" ")[1])) {
		    latLng = message.split(" ");
		    noToggleOfFollowCurrentPositionButton = true;
		    currentPositionMarker.setPosition(new google.maps.LatLng(latLng[0], latLng[1]));
        }
	});

	Server.connect();
});

var Server;

function updateChat( message ) {
	$('#chat-area').append($("<p>"+ message +"</p>"));
	document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight;
}

function sendChat( message ) {
	Server.send( 'message', message );
}