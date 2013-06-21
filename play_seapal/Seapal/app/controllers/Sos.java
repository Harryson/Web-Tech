package controllers;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import play.data.DynamicForm;
import play.db.DB;
import play.libs.Akka;
import play.libs.Comet;
import play.libs.Json;
import play.mvc.*;
import play.*;

import akka.util.*;
import akka.actor.*;

import java.util.*;
import java.text.*;

import org.codehaus.jackson.*;
import org.codehaus.jackson.node.ObjectNode;

import views.html._include.*;
import views.html.*;

import static java.util.concurrent.TimeUnit.*;




import play.*;
import play.mvc.*;
import play.libs.*;
import play.libs.F.*;

import akka.util.*;
import akka.actor.*;

import java.util.*;
import java.text.*;

import static java.util.concurrent.TimeUnit.*;

import views.html.*;
import views.html._include.header;
import views.html._include.navigation;
import views.html._include.navigation_app;

public class Sos extends Controller {
	
	private final static ActorRef blabla = BlaBla.instance;
	private static boolean sosFlag = false;
	private static ObjectNode jsonObj = Json.newObject();
	
	public static Result index() {
        return ok(sos.render(header.render(), navigation.render("app_map"), navigation_app.render("app_sos"), clock.render(), sos_header.render()));
    }
	
	public static Result liveSos() {
        return ok(new Comet("parent.sosCall") {  
            public void onConnected() {
            	blabla.tell(this);
            } 
        });
    }
	
	 public static class BlaBla extends UntypedActor {
	        
	        static ActorRef instance = Akka.system().actorOf(new Props(BlaBla.class));
	        
	        // Send a TICK message every 100 millis
	        static {
	            Akka.system().scheduler().schedule(Duration.Zero(), Duration.create(3000, MILLISECONDS), instance, "TICK");
	        }
	        
	        List<Comet> sockets = new ArrayList<Comet>();
	                
	        public void onReceive(Object message) {

	        	if(message instanceof Comet) {
					
					// In Comet wandeln
	                final Comet cometSocket = (Comet)message;
				
	                
					// Comet schon in Liste
	                if(sockets.contains(cometSocket)) {
	                    
	                    // Brower is disconnected
	                    sockets.remove(cometSocket);
	                    Logger.info("Browser disconnected (" + sockets.size() + " browsers currently connected)");
	                
					// Comet noch nicht in der Liste
	                } else {
	                    
	                    // Register disconnected callback 
	                    // Mit dem neuen Comet wird vereinbart, das der sich zurueckmelden soll, wenn er die Vebindung beendet
						cometSocket.onDisconnected(new Callback0() {
	                        // Was Comet dann ausfuehrne, aufrufen soll
							public void invoke() {
								// Der Inhalt ist er selber
	                            getContext().self().tell(cometSocket);
	                        }
	                    });
	                    
	                    // New browser connected
	                    sockets.add(cometSocket);
	                    Logger.info("New browser connected (" + sockets.size() + " browsers currently connected)");
	                    
	                }
	                
	            } 
	            
	            // Tick, send time to all connected browsers
	            // Es gibt alle paar Millisekunden einen Tick, dann werden alle Informiert
				if("TICK".equals(message) && sosFlag) {
	                
					sosFlag = false;
	                // Send the current time to all comet sockets
	                for(Comet cometSocket: sockets) {
	                    // Fuer jeden Comet wird eine Nachricht versendet mit sendMessage
						cometSocket.sendMessage("Hallo");
	                }
	                
	            }

	        }
	        
	    }
	 
	 public static void loadSos() {
	  	  
	        Connection conn = DB.getConnection();
	        Statement query;
	        ResultSet result;

	    		if(conn != null)
	    		{
	            try {
	                	
	            	query = conn.createStatement();
	        
	    	        String sql = "SELECT MAX(wnr) AS newest FROM seapal.sos";
	    	        result = query.executeQuery(sql);
	    	        result.next();
	     
	      	        String sql11 = result.getString(1);
	    	        String sql2 = "SELECT * FROM seapal.sos WHERE snr = " + sql11;
	    	        
	    	        result = query.executeQuery(sql2);
	                java.sql.ResultSetMetaData rsmd = result.getMetaData();
	                int numColumns = rsmd.getColumnCount();
 
	                jsonObj.removeAll();
	                while (result.next()) {
	                    for (int i = 1; i < numColumns + 1; i++) {
	                        String columnName = rsmd.getColumnName(i);
	                        jsonObj.put(columnName, result.getString(i));
	                    }
	                }
	                conn.close();

	            } catch (Exception e) {
	    	    	   e.printStackTrace();
	            }
	        }
	    }
        
	public static Result load() {
  	  
        Connection conn = DB.getConnection();
        Statement query;
        ResultSet result;
        ObjectNode respJSON = Json.newObject();

    		if(conn != null)
    		{
            try {
                	
            	query = conn.createStatement();
        
    	        String sql = "SELECT MAX(wnr) AS newest FROM seapal.wegpunkte";
    	        result = query.executeQuery(sql);
    	        result.next();
     
      	        String sql11 = result.getString(1);
    	        String sql2 = "SELECT * FROM seapal.wegpunkte WHERE wnr = " + sql11;
    	        
    	        result = query.executeQuery(sql2);
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
	
	public static Result send() {
		  
	    DynamicForm data = form().bindFromRequest();
	    Connection conn = DB.getConnection();
		Statement query;            
	    ResultSet result;
	    ObjectNode respJSON = Json.newObject();
	    int nextId = 0;

	    try {
		    query = conn.createStatement();
		    
		    String sql = "SELECT MAX(snr) AS newest FROM seapal.sos";
	        result = query.executeQuery(sql);
	        result.next();
 
  	        String sql11 = result.getString(1);

	        query.execute("INSERT INTO seapal.sos(sboat, slat, slng, sday, stime, scom) VALUES ("
	                + "'" + data.get("boat") + "',"
	                + "'" + data.get("lat") + "',"
	                + "'" + data.get("lng") + "',"
	                + "'" + data.get("date") + "',"
	                + "'" + data.get("time") + "',"
	                + "'" + data.get("com") + "');");

	         result = query.executeQuery("SHOW TABLE STATUS FROM seapal LIKE 'sos'");
	         if (result.next()) {
	             nextId = result.getInt("Auto_increment");
	         }
	         conn.close();
	         
	         sosFlag = true;

	         respJSON.put("snr", "" + (nextId - 1));

	    } catch (Exception e) {
	        respJSON.put("snr", "Error: " + e);
	    }

	    return ok(respJSON);
	  }
}
