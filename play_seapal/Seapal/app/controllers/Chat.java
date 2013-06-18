
//	public static Result index() {
//		return ok(chat.render(header.render(), navigation.render("app_map"), navigation_app.render("app_chat")));
//	}

package controllers;

import play.mvc.*;
import org.codehaus.jackson.*;

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
  
}

