import { MessageBody,SubscribeMessage, WebSocketGateway,WebSocketServer,OnGatewayConnection} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGeteway implements OnGatewayConnection { 
    @WebSocketServer()
    server;

    async handleConnection(socket: Socket) {
      console.log(socket.id)
    }

    @SubscribeMessage("ENTER_ROOM")
    enterRoom(socket: Socket,message:any){
      console.log(message.roomid);
      socket.join(message.roomid);
      this.getRooms(socket);
    }
    
    @SubscribeMessage("GET_ROOMS")
    getRooms(socket: Socket): any{
      console.log(socket.rooms)
        this.server.emit("ROOM_LIST",{rooms:socket.rooms})
    }
}

