$(function() {
  $(document).ready(function(event) {
    loadWaypoint();
  });

  function loadWaypoint() {
    jQuery.get("app_chat_load_waypoint.html", function(data) {
      var length= parseInt(data['length']);
      
      for(var i = 1; i < length + 1; i++) {
        var name = "item" + i;
        $('#waypoint').append('<option value=' + data[name] + '>' + data[name] + '</option>');
      }

    }, "json");
  }
});

