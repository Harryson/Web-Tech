package controllers;

import play.mvc.*;
import org.codehaus.jackson.*;
import views.html._include.*;
import views.html.*;

public class Sos extends Controller {
	public static Result index() {
        return ok(sos.render(header.render(), navigation.render("app_map"), navigation_app.render("app_sos"), clock.render()));
    }
}
