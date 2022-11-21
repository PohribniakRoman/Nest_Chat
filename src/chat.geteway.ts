import { MessageBody,SubscribeMessage, WebSocketGateway,WebSocketServer } from "@nestjs/websockets";

@WebSocketGateway()
export class ChatGeteway{
    @WebSocketServer()
    server;

    @SubscribeMessage("message")
    hadndleMessage(@MessageBody() message:string): void{
        this.server.emit("message",message)
    }
}