import { MessageBody,SubscribeMessage, WebSocketGateway,WebSocketServer, OnGatewayDisconnect} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

const DB = {};

class Chat {
  participants:object;
  messages:object;
  constructor(participant){
    this.participants = [participant];
    this.messages = [];
  }
}

@WebSocketGateway()
export class ChatGeteway implements OnGatewayDisconnect { 
    @WebSocketServer()
    server;

    async handleDisconnect(socket: Socket){
    }

    getSockets(roomId:string){
      const roomSockets = [];
      const {rooms} = this.server.sockets.adapter; 
      if(rooms.get(roomId)){
        rooms.get(roomId).forEach(socket => {
          roomSockets.push(socket)
        });
      } 
      return roomSockets;
    }

    createDBRoom(message:any){
      if(!DB[message.roomId]){
        DB[message.roomId] = new Chat(message.participant);
        return true;
      }
      return false;
    }

    joinDBRoom(message:any){
      if(!DB[message.roomId].participants.includes(message.participant)){
        DB[message.roomId].participants.push(message.participant)
      }
    }

    getRoomHistory({roomId}){
      return DB[roomId].messages;
    }

    newDBMessage({roomId,sender,txt}){
      DB[roomId].messages.push({sender,txt})
    }

    @SubscribeMessage("MESSAGE")
    sendMessage(socket:Socket,message:any){
      this.newDBMessage(message);
      this.server.to(message.roomId).emit("NEW_MESSAGE",{txt:message.txt,sender:message.sender});
    }

    @SubscribeMessage("CREATE_ROOM")
    createRoom(socket: Socket,message:any){
      if(this.createDBRoom(message)){
        this.enterRoom(socket,message);
        this.sendRooms();
      }
    }
    
    @SubscribeMessage("GET_CONNECTED_SOCKETS")
    sendUsers(socket: Socket,message:any){
        this.server.to(message.roomId).emit("ROOM_SOCKETS",{roomParticipants:DB[message.roomId].participants})
    }
    
    @SubscribeMessage("LEAVE_ROOM")
    leaveRoom(socket: Socket,message:any){
      socket.leave(message.roomId);
      this.sendUsers(socket,message);
    }

    @SubscribeMessage("ENTER_ROOM")
    enterRoom(socket: Socket,message:any){
        this.createDBRoom(message)
        this.joinDBRoom(message);
        socket.join(message.roomId);
        socket.to(socket.id).emit("MESSAGE_HISTORY",this.getRoomHistory(message))
        this.sendRooms();
    }
    
    @SubscribeMessage("GET_ROOMS")
    sendRooms(): any{
        const rooms = [];
        for (let entry of this.server.sockets.adapter.rooms.entries()){
          if(entry[0].length != 20){
            rooms.push({
              id:entry[0],
              sockets:this.getSockets(entry[0]),
            })
          }
        }
        
        this.server.emit("ROOM_LIST",{rooms})
    }
}

