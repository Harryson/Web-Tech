$(function() {
		    
    /* go back */
    $('#backButton').click(function() {
    	
    	history.go(-1);
    	
	});
	
	/* save crashlog */
	$('#saveButton').click(function() {
    	
    	var ret = 0;
    	
    	if (!ret) {
    	
	    	$('#dialogTitle').text('Success');
	    	$('#dialogMessage').text('File was saved.');
	    	
    	} else {
	    	
	    	$('#dialogTitle').text('Warning');
	    	$('#dialogMessage').text('Could not save file.');
	    	
    	}
    	
    	$('#saveSuccess').modal('show');
    	
	});
		    
});