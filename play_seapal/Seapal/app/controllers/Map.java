package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class Map extends Controller {
  
  public static Result index() {
    return ok(map.render(header.render(), header_app.render(), navigation.render("app_map"), navigation_app.render("app_map")));
  }
  
}