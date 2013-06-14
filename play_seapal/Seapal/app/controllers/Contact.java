package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class Contact extends Controller {
  
  public static Result index() {
    return ok(contact.render(header.render(), navigation.render("contact"), footer.render()));
  }
  
}