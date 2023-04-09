import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from 'src/products/dto/new-message-dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  constructor(private readonly messagesWsService: MessagesWsService) {}
  
  handleConnection(client: Socket ) {
    console.log('client connected', client.id)
    this.messagesWsService.registerClient(client);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }
  
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
  }
  
  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ){
    // client.broadcast.emit('messages-from-server', {fullName: 'test', message: payload.message || 'no message'})
    this.wss.emit('messages-from-server', {fullName: 'test', message: payload.message || 'no message'})
  }
}
