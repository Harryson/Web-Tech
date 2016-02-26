package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class Screenshots extends Controller {
  
  public static Result index() {
    return ok(screenshots.render(header.render(), navigation.render("screenshots"), footer.render()));
  }
  
}