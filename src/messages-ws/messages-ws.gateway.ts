import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from 'src/products/dto/new-message-dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  constructor(private readonly messagesWsService: MessagesWsService, private readonly jwtService: JwtService) {}
  
  async handleConnection(client: Socket ) {

    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try{
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    }catch(e){
      client.disconnect();
    }

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }
  
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
  }
  
  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ){
    // client.broadcast.emit('messages-from-server', {fullName: 'test', message: payload.message || 'no message'})
    this.wss.emit('messages-from-server', {fullName: this.messagesWsService.getUserFullName(client.id), message: payload.message || 'no message'})
  }
}
