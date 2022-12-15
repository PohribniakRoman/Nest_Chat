"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGeteway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const DB = {};
class Chat {
    constructor(participant, socket) {
        this.participants = [{ participant, socket: [socket] }];
        this.messages = [];
    }
}
let ChatGeteway = class ChatGeteway {
    handleDisconnect(socket) {
        const rooms = Object.keys(DB);
        for (let roomId of rooms) {
            const room = DB[roomId];
            const { length } = room.participants;
            for (let i = 0; i < length; i++) {
                if (room.participants[i].socket.includes(socket.id)) {
                    const indx = room.participants[i].socket.indexOf(socket.id);
                    if (room.participants[i].socket.length > 1) {
                        room.participants[i].socket.splice(indx - 1, 1);
                    }
                    else {
                        room.participants.splice(i - 1, 1);
                        if (room.participants.length === 0) {
                            delete DB[roomId];
                        }
                    }
                }
            }
        }
        this.sendRooms();
    }
    getSockets(roomId) {
        const roomSockets = [];
        const { rooms } = this.server.sockets.adapter;
        if (rooms.get(roomId)) {
            rooms.get(roomId).forEach(socket => {
                roomSockets.push(socket);
            });
        }
        return roomSockets;
    }
    createDBRoom(socket, data) {
        if (!DB[data.roomId]) {
            DB[data.roomId] = new Chat(data.participant, socket.id);
            return true;
        }
        return false;
    }
    joinDBRoom(socket, data) {
        if (DB[data.roomId]) {
            const room = DB[data.roomId];
            const { length } = room.participants;
            for (let i = 0; i < length; i++) {
                if (room.participants[i].socket.includes(socket.id)) {
                    return false;
                }
                ;
                if (room.participants[i].participant === data.participant) {
                    room.participants[i].socket.push(socket.id);
                    return true;
                }
            }
            DB[data.roomId].participants.push({ participant: data.participant, socket: [socket.id] });
            return true;
        }
        else {
            return false;
        }
    }
    getRoomHistory({ roomId }) {
        return DB[roomId].messages;
    }
    newDBMessage({ roomId, sender, txt }) {
        DB[roomId].messages.push({ sender, txt });
    }
    sendMessage(socket, data) {
        this.newDBMessage(data);
        this.server.to(data.roomId).emit("NEW_MESSAGE", { txt: data.txt, sender: data.sender });
    }
    sendUsers(data) {
        if (DB[data.roomId]) {
            this.server.to(data.roomId).emit("ROOM_SOCKETS", { roomParticipants: DB[data.roomId].participants.map(data => { return data.participant; }) });
        }
    }
    leaveRoom(socket, data) {
        socket.leave(data.roomId);
        this.handleDisconnect(socket);
        this.sendUsers(data);
    }
    enterRoom(socket, data) {
        this.createDBRoom(socket, data);
        this.joinDBRoom(socket, data);
        socket.join(data.roomId);
        this.server.to(socket.id).emit("MESSAGE_HISTORY", this.getRoomHistory(data));
        this.sendUsers(data);
        this.sendRooms();
    }
    sendRooms() {
        this.server.emit("ROOM_LIST", { rooms: Object.keys(DB).map(roomId => {
                return { id: roomId, sockets: DB[roomId].participants };
            }) });
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], ChatGeteway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("MESSAGE"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGeteway.prototype, "sendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("GET_CONNECTED_SOCKETS"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGeteway.prototype, "sendUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("LEAVE_ROOM"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGeteway.prototype, "leaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("ENTER_ROOM"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGeteway.prototype, "enterRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("GET_ROOMS"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ChatGeteway.prototype, "sendRooms", null);
ChatGeteway = __decorate([
    (0, websockets_1.WebSocketGateway)()
], ChatGeteway);
exports.ChatGeteway = ChatGeteway;
//# sourceMappingURL=chat.geteway.js.map