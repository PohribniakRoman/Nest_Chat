import { MessageBody,SubscribeMessage, WebSocketGateway,WebSocketServer, OnGatewayDisconnect} from "@nestjs/websockets";
import e from "express";
import { Server, Socket } from 'socket.io';

const DB = {};

class Chat {
  participants:object;
  messages:object;
  constructor(participant,socket){
    this.participants = [{participant,socket:[socket]}];
    this.messages = [];
  }
}

@WebSocketGateway()
export class ChatGeteway implements OnGatewayDisconnect { 
    @WebSocketServer()
    server;

    handleDisconnect(socket:Socket){
        const rooms = Object.keys(DB);
        for(let roomId of rooms){
          const room = DB[roomId]; 
          const {length} = room.participants;

          for (let i = 0; i < length; i++) {
            if(room.participants[i].socket.includes(socket.id)){
              const indx = room.participants[i].socket.indexOf(socket.id);
              
              if(room.participants[i].socket.length > 1){
                room.participants[i].socket.splice(indx-1,1);
              }else{
                room.participants.splice(i-1,1)
                
                if(room.participants.length === 0){
                  delete DB[roomId];
                }
              }
            }
          }
        }
        this.sendRooms();
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

    createDBRoom(socket,data:any){
      if(!DB[data.roomId]){
        DB[data.roomId] = new Chat(data.participant,socket.id);
        return true;
      }
      return false;
    }

    joinDBRoom(socket:Socket,data:any):boolean{
      if(DB[data.roomId]){
        const room = DB[data.roomId];
        const {length} = room.participants;
        
          for (let i = 0; i < length; i++) {
            if(room.participants[i].socket.includes(socket.id)){
              return false
            };
            if(room.participants[i].participant === data.participant){
                room.participants[i].socket.push(socket.id);
                return true;
            }
          }
          DB[data.roomId].participants.push({participant:data.participant,socket:[socket.id]});
          return true;
        }else{
          return false;
        }
      }

    getRoomHistory({roomId}){
      return DB[roomId].messages;
    }

    newDBMessage({roomId,sender,txt}){
      DB[roomId].messages.push({sender,txt})
    }

    @SubscribeMessage("MESSAGE")
    sendMessage(socket:Socket,data:any){
      this.newDBMessage(data);
      this.server.to(data.roomId).emit("NEW_MESSAGE",{txt:data.txt,sender:data.sender});
    }
    
    @SubscribeMessage("GET_CONNECTED_SOCKETS")
    sendUsers(data:any){
      if(DB[data.roomId]){
        this.server.to(data.roomId).emit("ROOM_SOCKETS",{roomParticipants:DB[data.roomId].participants.map(data=>{return data.participant})})
      }
    }
    
    @SubscribeMessage("LEAVE_ROOM")
    leaveRoom(socket: Socket,data:any){
      
      socket.leave(data.roomId);
      this.handleDisconnect(socket);
      this.sendUsers(data);
    }

    @SubscribeMessage("ENTER_ROOM")
    enterRoom(socket: Socket,data:any){
        this.createDBRoom(socket,data);
        this.joinDBRoom(socket,data);
        socket.join(data.roomId);
        this.server.to(socket.id).emit("MESSAGE_HISTORY",this.getRoomHistory(data))
        this.sendUsers(data);
        this.sendRooms();
    }
    
    @SubscribeMessage("GET_ROOMS")
    sendRooms(): any{
        this.server.emit("ROOM_LIST",{rooms:Object.keys(DB).map(roomId=>{
          return {id:roomId,sockets:DB[roomId].participants}
        })})
    }
}

