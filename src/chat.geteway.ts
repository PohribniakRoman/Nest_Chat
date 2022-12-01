import { MessageBody,SubscribeMessage, WebSocketGateway,WebSocketServer, OnGatewayDisconnect} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGeteway implements OnGatewayDisconnect { 
    @WebSocketServer()
    server;

    async handleDisconnect(socket: Socket){
    }

    @SubscribeMessage("CREATE_ROOM")
    createRoom(socket: Socket,message:any){
      this.enterRoom(socket,message);
      this.getRooms(socket);
    }
    
    @SubscribeMessage("GET_CONNECTED_SOCKETS")
    getRoomSockets(socket: Socket,message:any){
      const roomSockets = [];
      const {rooms} = this.server.sockets.adapter; 
      if(rooms.get(message.roomId)){
        rooms.get(message.roomId).forEach(socket => {
          roomSockets.push(socket)
        });
        this.server.to(message.roomId).emit("ROOM_SOCKETS",{roomSockets})
      }
    }
    
    @SubscribeMessage("LEAVE_ROOM")
    leaveRoom(socket: Socket,message:any){
      socket.leave(message.roomId);
      this.getRoomSockets(socket,message);
    }

    @SubscribeMessage("ENTER_ROOM")
    enterRoom(socket: Socket,message:any){
      socket.join(message.roomId);
      this.getRooms(socket);
    }
    
    @SubscribeMessage("GET_ROOMS")
    getRooms(socket: Socket): any{
        const rooms = [];
        for (let entry of this.server.sockets.adapter.rooms.entries()){
          if(entry[0].length != 20){
            rooms.push(entry[0])
          }
        }
        
        this.server.emit("ROOM_LIST",{rooms})
    }
}

