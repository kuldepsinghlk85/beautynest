import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_booking')
  handleJoinBooking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    const room = `booking_${data.bookingId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      beauticianId: string;
      bookingId: string;
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    },
  ) {
    try {
      await this.prisma.gPSTracking.create({
        data: {
          beauticianId: data.beauticianId,
          bookingId: data.bookingId,
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading,
          speed: data.speed,
        },
      });

      await this.prisma.beautician.update({
        where: { id: data.beauticianId },
        data: {
          currentLat: data.latitude,
          currentLng: data.longitude,
          lastLocationAt: new Date(),
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to persist GPS point: ${err.message}`);
    }

    const room = `booking_${data.bookingId}`;
    this.server.to(room).emit('beautician_location', {
      latitude: data.latitude,
      longitude: data.longitude,
      heading: data.heading,
      timestamp: new Date().toISOString(),
    });

    return { received: true };
  }

  @SubscribeMessage('send_chat_message')
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      bookingId: string;
      senderId: string;
      senderName: string;
      senderRole: 'CUSTOMER' | 'BEAUTICIAN';
      message: string;
    },
  ) {
    const room = `booking_${data.bookingId}`;
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.server.to(room).emit('new_chat_message', payload);
    return { status: 'sent' };
  }

  broadcastBookingStatusChange(bookingId: string, status: string, details?: any) {
    const room = `booking_${bookingId}`;
    this.server.to(room).emit('booking_status_updated', {
      bookingId,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
