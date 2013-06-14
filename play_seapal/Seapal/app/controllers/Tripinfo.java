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

public class Tripinfo extends Controller {
  
  public static Result insert() {
  
    DynamicForm data = form().bindFromRequest();
    Connection conn = DB.getConnection();
	Statement query;            
    ResultSet result;
    ObjectNode respJSON = Json.newObject();
    int nextId = 0;

    try {
	    query = conn.createStatement();

        query.execute("INSERT INTO seapal.wegpunkte(tnr, name, btm, dtm, lat, lng, sog, cog, manoever, vorsegel, wdate, wtime, marker) VALUES ("
                + "'" + data.get("tnr") + "',"
                + "'" + data.get("name") + "',"
                + "'" + data.get("btm") + "',"
                + "'" + data.get("dtm") + "',"
                + "'" + data.get("lat") + "',"
                + "'" + data.get("lng") + "',"
                + "'" + data.get("sog") + "',"
                + "'" + data.get("cog") + "',"
                + "'" + data.get("manoever") + "',"
                + "'" + data.get("vorsegel") + "',"
                + "'" + data.get("wdate") + "',"
                + "'" + data.get("wtime") + "',"
                + "'" + data.get("marker") + "');");

         result = query.executeQuery("SHOW TABLE STATUS FROM seapal LIKE 'wegpunkte'");
         if (result.next()) {
             nextId = result.getInt("Auto_increment");
         }
         conn.close();

         respJSON.put("wnr", "" + (nextId - 1));

    } catch (Exception e) {
        respJSON.put("wnr", "Error: " + e);
    }

    return ok(respJSON);
  }
  
  public static Result delete(int wnr) {

    Connection conn = DB.getConnection();
		Statement query;            
    ResultSet result;
    ObjectNode respJSON = Json.newObject();
  
    try {
	      query = conn.createStatement();
        query.execute("DELETE FROM seapal.wegpunkte WHERE wnr = " + wnr);

        conn.close();

        respJSON.put("wnr", "ok");

    } catch (Exception e) {
        respJSON.put("wnr", "Error: " + e);
    }
  
    return ok(respJSON);
  }
  
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

  public static Result index(int tnr) {
    Connection conn = DB.getConnection();
		
		String data = "";
    
		if(conn != null)
		{
            Statement query;
            ResultSet result;
            
            try {
            	
	            query = conn.createStatement();
	 
	            String sql = "SELECT * " + "FROM wegpunkte WHERE tnr = " + tnr;
	        
	            result = query.executeQuery(sql);
	        
	            while (result.next()) {
              
	        		  StringBuilder row = new StringBuilder();

                row.append("<tr class='selectable' id='" + result.getString("wnr") + "'>");
                row.append("<td>" + result.getString("name") + "</td>");
                row.append("<td>" + result.getString("lat") + "</td>");
                row.append("<td>" + result.getString("lng") + "</td>");
                row.append("<td>" + result.getString("btm") + "</td>");
                row.append("<td>" + result.getString("dtm") + "</td>");
                row.append("<td>" + result.getString("manoever") + "</td>");
                row.append("<td style='width:30px; text-align:left;'><div class='btn-group'>");
                row.append("<a class='btn btn-small view' id='" + result.getString("wnr")
                  + "'><span><i class='icon-eye-open'></i></span></a>");
                row.append("<a class='btn btn-small remove' id='" + result.getString("wnr")
                  + "'><span><i class='icon-remove'></i></span></a>");
                row.append("<a class='btn btn-small redirect' id='" + result.getString("wnr")
                  + "' href='app_waypoint.html?wnr=" + result.getString("wnr")
                  + "'><span><i class='icon-chevron-right'></i></span></a>");
                    
               
                row.append("</div></td>");

                row.append("</tr>");
            
		            data += row.toString();
			    }
               
	       } catch (Exception e) {
	    	   e.printStackTrace();
	       }
    }
    return ok(tripinfo.render(header.render(), navigation.render("app_map"), navigation_app.render("app_tripinfo"), data));
  }
  
}