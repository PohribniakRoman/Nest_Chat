import { OnGatewayDisconnect } from "@nestjs/websockets";
import { Socket } from 'socket.io';
export declare class ChatGeteway implements OnGatewayDisconnect {
    server: any;
    handleDisconnect(socket: Socket): void;
    getSockets(roomId: string): any[];
    createDBRoom(socket: any, data: any): boolean;
    joinDBRoom(socket: Socket, data: any): boolean;
    getRoomHistory({ roomId }: {
        roomId: any;
    }): any;
    newDBMessage({ roomId, sender, txt }: {
        roomId: any;
        sender: any;
        txt: any;
    }): void;
    sendMessage(socket: Socket, data: any): void;
    sendUsers(data: any): void;
    leaveRoom(socket: Socket, data: any): void;
    enterRoom(socket: Socket, data: any): void;
    sendRooms(): any;
}
