package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class Impressum extends Controller {
  
  public static Result index() {
    return ok(impressum.render(header.render(), navigation.render("impressum"), footer.render()));
  }
  
}