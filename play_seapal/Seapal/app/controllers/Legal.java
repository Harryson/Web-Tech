package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class Legal extends Controller {
  
  public static Result index() {
    return ok(legal.render(header.render(), navigation.render("legal"), footer.render()));
  }
  
}