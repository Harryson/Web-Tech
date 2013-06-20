
//	public static Result index() {
//		return ok(chat.render(header.render(), navigation.render("app_map"), navigation_app.render("app_chat")));
//	}

package controllers;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import play.db.DB;
import play.libs.Json;
import play.mvc.*;
import org.codehaus.jackson.*;
import org.codehaus.jackson.node.ObjectNode;
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

import views.html.*;

public class Chat extends Controller {
  
    /**
     * Display the home page.
     */
    public static Result index() {
        return ok(chatIndex.render());
    }
  
    /**
     * Display the chat room.
     */
    public static Result chatRoom(String username) {
        if(username == null || username.trim().equals("")) {
            flash("error", "Bitte geben Sie einen richtigen Benutzername ein.");
            return redirect(routes.Chat.index());
        }
        return ok(chatRoom.render(username));
      
    }
    
    /**
     * Handle the chat websocket.
     */
    public static WebSocket<JsonNode> chat(final String username) {
        return new WebSocket<JsonNode>() {
            
            // Called when the Websocket Handshake is done.
            public void onReady(WebSocket.In<JsonNode> in, WebSocket.Out<JsonNode> out){
                
                // Join the chat room.
                try { 
                    ChatRoom.join(username, in, out);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        };
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

            String max ="SELECT * FROM seapal.wegpunkte COUNT(*)";
            result = query.executeQuery(max);
            int count = result.getInt(1);
            System.out.println(count);
            respJSON.put("anzahl", result.getString(1));
            
            
//            String sql = "SELECT * FROM seapal.wegpunkte WHERE wnr = ";
//
//            result = query.executeQuery(sql);
//            java.sql.ResultSetMetaData rsmd = result.getMetaData();
//            int numColumns = rsmd.getColumnCount();
//
//            while (result.next()) {
//                for (int i = 1; i < numColumns + 1; i++) {
//                    String columnName = rsmd.getColumnName(i);
//                    respJSON.put(columnName, result.getString(i));
//                }
//            }
            conn.close();

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ok(respJSON);
    }
    
    public static void main(final String args[]) {
    	load();
    }
  
}

