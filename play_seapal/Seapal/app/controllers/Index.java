package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class Index extends Controller {
  
  public static Result index() {
      
    return ok(index.render(header.render(),navigation.render("index"), footer.render()));
  }
  
}