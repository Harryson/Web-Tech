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
                    + "waveHight = '" + data.get("waveHight") + "', "
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

}