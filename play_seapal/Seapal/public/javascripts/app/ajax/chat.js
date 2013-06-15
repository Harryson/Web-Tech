$(function() {

	 // watch textarea for release of key press
	 /* Name der ID des Eingabefelds */
	 $('#send-message-box').keyup(function(e) {	
	 					 
		  if (e.keyCode == 13) { //Enter is pressed
            /* Variablendefinition */
			/* This müsste das Eingabefeld (send-message-box) sein */
			var text = $(this).val();
             
            // send
			/* Den Text aus dem Eingabefeld nehmen und versenden */
	        sendChat(text);	
	        $(this).val("");     
		  }
     });
    
});

  /* Variablendefinition. Es gibt kein Typ */
  var timestamp = 0;
  var server_url = './chatserver.php';  
  var noerror = true;

  /* Funktion definiert */
  function connect() {
    $.ajax({
      /* Anfrage stellen */
	  type : 'get',
      /* An den Server mit der URL= ./chatserver.php */
	  url : server_url,
	  /* Vom Datenfyp */
      dataType : 'json',
	  /* ??? Hier wird was mit der Zeit geamacht */
      data : {'timestamp' : timestamp},
	  
	  /* Die Antwort auf die Anfrage wird in der Variablen response gespeichert */
      success : function(response) {
		/* Zeitstempel setzen */
        timestamp = response.timestamp;
		/* chat-area ist ID des Bereichs mit der Konversation */
		/* Fügt dem Bereich den neuen Text zu */
        $('#chat-area').append('<p>' + response.msg + '</p>');
        noerror = true;          
      },
	  
      complete : function(response) {
        // send a new ajax request when this request is finished
        if (!self.noerror) {
          // if a connection problem occurs, try to reconnect each 5 seconds
          setTimeout(function(){ connect(); }, 5000);           
        }else {
          // persistent connection
          /* Rekursiver aufruf der Methode connect() */
		  connect(); 
        }
		/* Wenn es zu keiner Verbindung nach 5 Sekunden gekommen ist */
        noerror = false; 
      }
	  
    });
  }

  /* Funktion definiert */
  /* Wenn man eine Nachricht versenden möchte wird weiter oben aufgerufen */
  function sendChat(message) {
      /* Ist eine Ajax Anfrage */
	  $.ajax({
	  /* Vom Typ get */
        type : 'get',
		/* An den Server */
        url : server_url,
		/* ??? */
        data : {'msg' : message}
      });
  }

