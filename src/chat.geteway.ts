import { MessageBody,SubscribeMessage, WebSocketGateway,WebSocketServer,OnGatewayConnection} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGeteway implements OnGatewayConnection { 
    @WebSocketServer()
    server;
    async handleConnection(socket: Socket) {
    }

    @SubscribeMessage("CREATE_ROOM")
    createRoom(socket: Socket,message:any){
      this.enterRoom(socket,message);
      this.getRooms(socket);
    }
    
    @SubscribeMessage("GET_CONNECTED_SOCKETS")
    getRoomSockets(socket: Socket,message:any){
      const roomSockets = [];
      this.server.sockets.adapter.rooms.get(message.roomId).forEach(socket => {
        roomSockets.push(socket)
      });
      this.server.emit("ROOM_SOCKETS",{roomSockets})
    }
    
    @SubscribeMessage("LEAVE_ROOM")
    leaveRoom(socket: Socket,message:any){
      socket.leave(message.id);
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
        console.log(rooms)
        
        this.server.emit("ROOM_LIST",{rooms})
    }
}

