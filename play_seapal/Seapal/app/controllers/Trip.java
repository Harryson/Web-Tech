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

public class Trip extends Controller {
  
	public static Result boat() {
	Connection conn = DB.getConnection();
	Statement query;
    ResultSet result;
    ObjectNode respJSON = Json.newObject();

		if(conn != null) {
	        try {
	            	
			  query = conn.createStatement();
			
			  String sql = "SELECT bootname FROM seapal.bootinfo";
			
			  result = query.executeQuery(sql);
			  int count = 0;
	
				while (result.next()) {
					count++;   
			        String item = "item" + count;
			        respJSON.put(item, result.getString("bootname"));
				}
			  
			  result.next();
			  
				
			  respJSON.put("length", count);
			  conn.close();
	
	        } catch (Exception e) {
		    	   e.printStackTrace();
	        }
		}
		
    return ok(respJSON);
    
	}

  public static Result insert() {
  
    DynamicForm data = form().bindFromRequest();
    Connection conn = DB.getConnection();
		Statement query;            
    ResultSet result;
    ObjectNode respJSON = Json.newObject();
    int nextId = 0;

    try {
	      query = conn.createStatement();

        query.execute("INSERT INTO seapal.tripinfo (bnr, titel, von, nach, skipper, crew, tstart, tende, tdauer, motor, tank) VALUES ("
                + "'" + data.get("bnr") + "',"
                + "'" + data.get("titel") + "',"
                + "'" + data.get("von") + "',"
                + "'" + data.get("nach") + "',"
                + "'" + data.get("skipper") + "',"
                + "'" + data.get("crew") + "',"
                + "'" + data.get("tstart") + "',"
                + "'" + data.get("tende") + "',"
                + "'" + data.get("tdauer") + "',"
                + "'" + data.get("motor") + "',"
                + " " + data.get("tank") + ");");

         result = query.executeQuery("SHOW TABLE STATUS FROM seapal LIKE 'tripinfo'");
         if (result.next()) {
             nextId = result.getInt("Auto_increment");
         }
         conn.close();

         respJSON.put("tnr", "" + (nextId - 1));

    } catch (Exception e) {
        respJSON.put("tnr", "Error: " + e);
    }

    return ok(respJSON);
  }
  
  public static Result delete(int tnr) {

    Connection conn = DB.getConnection();
    Statement query;            
    ObjectNode respJSON = Json.newObject();
  
    try {
	      query = conn.createStatement();
        query.execute("DELETE FROM seapal.tripinfo WHERE tnr = " + tnr);

        conn.close();

        respJSON.put("tnr", "ok");

    } catch (Exception e) {
        respJSON.put("tnr", "Error: " + e);
    }
  
    return ok(respJSON);
  }
  
  public static Result load(int tnr) {
  
    Connection conn = DB.getConnection();
		Statement query;
    ResultSet result;
    ObjectNode respJSON = Json.newObject();

		if(conn != null)
		{
        try {
            	
	          query = conn.createStatement();
    
	          String sql = "SELECT * FROM seapal.tripinfo WHERE tnr = " + tnr;
	        
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

  public static Result index() {
    Connection conn = DB.getConnection();
		
		String data = "";
    
		if(conn != null)
		{
            Statement query;
            ResultSet result;
            
            try {
            	
	            query = conn.createStatement();
	 
	            String sql = "SELECT * " + "FROM seapal.tripinfo ";
	        
	            result = query.executeQuery(sql);
	        
	            while (result.next()) {
              
        		  StringBuilder row = new StringBuilder();

              row.append("<tr class='selectable' id='" + result.getString("tnr") + "'>");
              row.append("<td>" + result.getString("titel") + "</td>");
              row.append("<td>" + result.getString("skipper") + "</td>");
              row.append("<td>" + result.getString("tstart") + "</td>");
              row.append("<td>" + result.getString("tende") + "</td>");
              row.append("<td>" + result.getString("tdauer") + "</td>");
              row.append("<td>" + result.getString("motor") + "</td>");
              row.append("<td style='width:30px; text-align:left;'><div class='btn-group'>");
              row.append("<a class='btn btn-small view' id='" + result.getString("tnr")
                + "'><span><i class='icon-eye-open'></i></span></a>");
              row.append("<a class='btn btn-small remove' id='" + result.getString("tnr")
                + "'><span><i class='icon-remove'></i></span></a>");
              row.append("<a class='btn btn-small redirect' id='" + result.getString("tnr")
                + "' href='app_tripinfo.html?tnr=" + result.getString("tnr")
                + "'><span><i class='icon-chevron-right'></i></span></a>");
              row.append("</div></td>");
              row.append("</tr>");
          
	            data += row.toString();
			    }
               
	       } catch (Exception e) {
	    	   e.printStackTrace();
	       }
    }
    return ok(trip.render(header.render(), navigation.render("app_map"), navigation_app.render("app_trip"), data, clock.render(), sos_header.render()));
  }
  
}