$(function() {
	  	
    function scroll(id){
    
        if (id == "#index" || id == "#overview" || id == "#extensions" || id == "#warning" || id == "#installing" || id == "#ipad" || id == "#legal" || id == "#welcome" || id == "#ibn" || id == "#htwg") {
            $('html,body').stop().animate({scrollTop: $(id).offset().top - (120) },'300');
        } else {
            $('html,body').stop().animate({scrollTop: $(id).offset().top - (70) },'300');
        }
    }
	  		  	
    $('li.sidebar').click(function(event) {
        event.preventDefault();
			  	
        var id = $(this).contents('a').attr('class');
        scroll('#' + id);
    });
});