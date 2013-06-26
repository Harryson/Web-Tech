package controllers;

import play.*;
import play.mvc.*;
import play.mvc.Http.MultipartFormData;
import play.mvc.Http.MultipartFormData.FilePart;
import play.db.*;

import java.io.File;
import java.sql.*;
import javax.sql.*;
import play.libs.Json;
import play.data.DynamicForm;
import org.codehaus.jackson.node.ObjectNode; 
import views.html.*;
import views.html._include.*;

public class Tripinfo extends Controller {
	
	
	public static Result uploadFile() {
		int wnr = 1;
		MultipartFormData body = request().body().asMultipartFormData();
		  FilePart picture = body.getFile("picture");
		  if (picture != null) {
		    String fileName = picture.getFilename();
		    String contentType = picture.getContentType(); 
		    File file = picture.getFile();
		    return ok("File uploaded");
		  } else {
		    flash("error", "Missing file");
		    return redirect(routes.Tripinfo.load(wnr));    
		  }
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

        query.execute("INSERT INTO seapal.wegpunkte(tnr, name, btm, dtm, lat,"
                + " lng, sog, cog, manoever, vorsegel, wdate, wtime, marker,"
                + " windStrength, windDirection, airPressure, temperature," 
                + " clouds, rain, waveHeight, waveDirection) VALUES ("
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
                + "'" + data.get("marker") + "',"
                + "'" + data.get("windStrength") + "',"
                + "'" + data.get("windDirection") + "',"
                + "'" + data.get("airPressure") + "',"
                + "'" + data.get("temperature") + "',"
                + "'" + data.get("clouds") + "',"
                + "'" + data.get("rain") + "',"
                + "'" + data.get("waveHeight") + "',"
                + "'" + data.get("waveDirection") + "');");

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
                //row.append("<a class='btn btn-small redirect' id='" + result.getString("wnr")
                //  + "' href='app_waypoint.html?wnr=" + result.getString("wnr")
                //  + "'><span><i class='icon-chevron-right'></i></span></a>");
                    
               
                row.append("</div></td>");

                row.append("</tr>");
            
		            data += row.toString();
			    }
               
	       } catch (Exception e) {
	    	   e.printStackTrace();
	       }
    }
    return ok(tripinfo.render(header.render(), navigation.render("app_map"), navigation_app.render("app_tripinfo"), data, clock.render(), sos_header.render()));
  }
  
  public static Result wetterAlarm() {

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