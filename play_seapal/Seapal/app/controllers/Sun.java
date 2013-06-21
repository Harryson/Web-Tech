package controllers;

import play.*;
import play.mvc.*;
import play.db.*;

import java.sql.*;

import javax.sql.*;
import play.libs.Json;
import play.data.DynamicForm;
import org.codehaus.jackson.node.ObjectNode; 
import views.html.*;
import views.html._include.*;

public class Sun extends Controller{
		 
    private double pi = Math.PI;
    private double rad = pi / 180.0;
    private double h = -(50.0 / 60.0) * rad;
    private double b;
    private double laenge = 8.5;
    private int zeitzone = 2;
    private int tag;
 
    private String aufgangStr;
    private String untergangStr;
 
    public Sun(double breite, double laenge, int tag, int zeitzone) {
    	this.b = breite * rad;
        this.laenge = laenge;
        this.zeitzone = zeitzone;
        this.tag = tag;
        init();
    }
      
    public static Result insert() {
    	  
        DynamicForm data = form().bindFromRequest();          
        ObjectNode respJSON = Json.newObject();
        int dateInt;
        int day;
        int month;
        
//        String dateStr =data.get("day");
//        String [] dateStrArr = dateStr.split("/");
//        
//        day = Integer.parseInt(dateStrArr[0]);
//        month = Integer.parseInt(dateStrArr[1]);
//        
//        dateInt = day + ( 153 * month - 162) / 5;
         
        Sun sun = new Sun(Double.parseDouble(data.get("latitude")), Double.parseDouble(data.get("longitude")), Integer.parseInt(data.get("day")), Integer.parseInt(data.get("timediv")));

        respJSON.put("latitude", data.get("latitude"));
        respJSON.put("longitude", data.get("longitude"));
        respJSON.put("day", data.get("day"));
        respJSON.put("timediv", data.get("timediv"));      
        respJSON.put("sunrise", sun.aufgangStr);
        respJSON.put("sunset", sun.untergangStr);
        return ok(respJSON);
    }
    
    public static Result index() {	
        return ok(sun.render(header.render(), navigation.render("app_map"), navigation_app.render("app_sun"), "", clock.render(), sos_header.render()));
    }
 
    private void init() {
        double aufgang = aufgang1(this.tag);
        double untergang = untergang1(this.tag);
 
        aufgang = aufgang - laenge / 15.0 + zeitzone;
        untergang = untergang - laenge / 15.0 + zeitzone;
 
        int aufgangh = (int) Math.floor(aufgang);
        String aufgangH = ((aufgangh < 10) ? "0" + String.valueOf(aufgangh) : String.valueOf(aufgangh));
        int aufgangm = (int) Math.floor(((aufgang - aufgangh) * 100) * 3 / 5);
        String aufgangM = ((aufgangm < 10) ? "0" + String.valueOf(aufgangm) : String.valueOf(aufgangm));
        int aufgangs = (int) Math.floor(((((((aufgang - aufgangh) * 100) * 3 / 5) - aufgangm) * 100) * 3 / 5));
        String aufgangS =((aufgangs < 10) ? "0" + String.valueOf(aufgangs) : String.valueOf(aufgangs));
        this.aufgangStr = aufgangH + ":" + aufgangM + ":" + aufgangS;
 
        int untergangh = (int) Math.floor(untergang);
        String untergangH = ((untergangh < 10) ? "0" + String.valueOf(untergangh) : String.valueOf(untergangh));
        int untergangm = (int) Math.floor(((untergang - untergangh) * 100) * 3 / 5);
        String untergangM = ((untergangm < 10) ? "0" + String.valueOf(untergangm) : String.valueOf(untergangm));
        int untergangs = (int) Math.floor(((((((untergang - untergangh) * 100) * 3 / 5) - untergangm) * 100) * 3 / 5));
        String untergangS = ((untergangs < 10) ? "0" + String.valueOf(untergangs) : String.valueOf(untergangs));
        this.untergangStr = untergangH + ":" + untergangM + ":" + untergangS;
 
    }
 
    private double sonnendeklination(double t) {
        return 0.40954 * Math.sin(0.0172 * (t - 79.35));
    }
 
    private double zeitdifferenz(double deklination) {
        return 12.0 * Math.acos((Math.sin(h) - Math.sin(b) * Math.sin(deklination)) / (Math.cos(b) * Math.cos(deklination))) / pi;
    }
 
    private double zeitgleichung(double t) {
        return -0.1752 * Math.sin(0.033430 * t + 0.5474) - 0.1340 * Math.sin(0.018234 * t - 0.1939);
    }
 
    private double aufgang1(double t) {
        double deklination = sonnendeklination(t);
        return 12 - zeitdifferenz(deklination) - zeitgleichung(t);
    }
 
    private double untergang1(double t) {
        double deklination = sonnendeklination(t);
        return 12 + zeitdifferenz(deklination) - zeitgleichung(t);
    }
 
    public String getAufgangStr() {
        return aufgangStr;
    }
 
    public String getUntergangStr() {
        return untergangStr;
    }
 
    public static void main(String... args) {
        Sun sun = new Sun(5, 40, 216, -2);
 
        System.out.println("Sonnenaufgang : " + sun.getAufgangStr());
        System.out.println("Sonnenuntergang : " + sun.getUntergangStr());
    }
}
