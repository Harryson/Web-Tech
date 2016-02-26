package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import views.html._include.*;

public class About extends Controller {
  
    public static Result index() {
        return ok(about.render(header.render(), navigation.render("about"), footer.render()));
    }
}