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

public class Waypoint extends Controller {  
    
    public static Result load(int wnr) {

        Connection conn = DB.getConnection();
        Statement query;
        ResultSet result;
        ObjectNode respJSON = Json.newObject();

        if(conn != null)
        {
            try {

            query = conn.createStatement();

            String sql = "SELECT * FROM seapal.wegpunkte WHERE wnr = " + wnr;

            result = query.executeQuery(sql);
            java.sql.ResultSetMetaData rsmd = result.getMetaData();
            int numColumns = rsmd.getColumnCount();

            while (result.next()) {
                for (int i = 1; i < numColumns + 1; i++) {
                    String columnName = rsmd.getColumnName(i);
                    respJSON.put(columnName, result.getString(i));
                }
            }
            conn.close();

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ok(respJSON);
    }

    public static Result update(int wnr){
        
        DynamicForm data = form().bindFromRequest();
        Connection conn = DB.getConnection();
        Statement query;            
        ResultSet result;
        ObjectNode respJSON = Json.newObject();

        try {
            query = conn.createStatement();

          String latitude = data.get("lat");
          String longitude = data.get("lng");

          latitude.replace("\'", "Q");
          longitude.replace("\'", "Q");

          //System.out.println("lat " + latitude + " lng = " + longitude);

            query.execute("UPDATE seapal.wegpunkte SET "
                    + "name = '" + data.get("name") + "', "
                    + "btm = '" + data.get("btm") + "', "
                    + "dtm = '" + data.get("dtm") + "', "
                    + "lat = '" + data.get("lat") + "', "
                    + "lng = '" + data.get("lng") + "', "
                    + "sog = '" + data.get("sog") + "', "
                    + "cog = '" + data.get("cog") + "', "
                    + "manoever = '" + data.get("manoever") + "', "
                    + "vorsegel = '" + data.get("vorsegel") + "', "
                    + "wdate = '" + data.get("wdate") + "', "
                    + "wtime = '" + data.get("wtime") + "', "
                    + "marker = '" + data.get("marker") + "', "
                    + "windStrength = '" + data.get("windStrength") + "', "
                    + "windDirection = '" + data.get("windDirection") + "', "
                    + "airPressure = '" + data.get("airPressure") + "', "
                    + "temperature = '" + data.get("temperature") + "', "
                    + "clouds = '" + data.get("clouds") + "', "
                    + "rain = '" + data.get("rain") + "', "
                    + "waveHeight = '" + data.get("waveHeight") + "', "
                    + "waveDirection = '" + data.get("waveDirection") + "'"
                    + "WHERE wnr = '" + wnr + "';");

            result = query.executeQuery("SHOW TABLE STATUS FROM seapal LIKE 'wegpunkte'");
            conn.close();

        } catch (Exception e) {
            respJSON.put("wnr", "Error: " + e);
        }

        return ok(respJSON);
    }

    public static Result index(int wnr) {

        load(wnr);
        return ok(waypoint.render(header.render(), navigation.render("app_map"), navigation_app.render("app_waypoint")));
    }

    public static Result wetterAlarm(int wnr) {

        DynamicForm data = form().bindFromRequest();
        ObjectNode respJSON = Json.newObject();

        String latitude = data.get("lat");
        String longitude = data.get("lng");

        double latDouble = Double.parseDouble(latitude.substring(0, 2));
        double lngDouble = Double.parseDouble(longitude.substring(0, 3));

        //converting coord in deegres in decimal
        double header1 = Double.parseDouble(latitude.substring(3,latitude.length()-1)) / 60 ;
        double header2 = Double.parseDouble(longitude.substring(4,longitude.length()-1)) / 60;

        header1 = Math.round(header1*10000)/10000.0;
        header2 = Math.round(header2*10000)/10000.0;

        latDouble += header1;
        lngDouble += header2;


        if (latitude.substring(latitude.length() - 1).equals("s") || latitude.substring(latitude.length() - 1).equals("S")) {
            latDouble *= -1;

        }
        if (longitude.substring(longitude.length() - 1).equals("w") || longitude.substring(longitude.length() - 1).equals("W")) {
            lngDouble *= -1;
        }

        System.out.println("Testing wetter alarm: lat = " + latitude + " lng = " + longitude);
        System.out.println("After convert: latDouble: " + latDouble + " lngDouble: " + lngDouble);
        
        respJSON.put("latConv", latDouble);
        respJSON.put("lngConv", lngDouble);


        return ok(respJSON);
    }    

}