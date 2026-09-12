import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface RouteWayPoint {
  lat: number;
  lng: number;
  instruction: string;
}

export interface NavigationSessionData {
  orderId: string;
  beauticianId: string;
  currentLocation: { lat: number; lng: number; label: string };
  customerLocation: { lat: number; lng: number; address: string };
  distanceKm: number;
  estimatedTimeMin: number;
  routeCoordinates: Array<{ lat: number; lng: number }>;
  turnInstructions: string[];
  status: 'NAVIGATING' | 'ARRIVED' | 'COMPLETED';
  updatedAt: string;
  provider: 'DEMO_VECTOR_MAP' | 'GOOGLE_MAPS_API_READY';
}

@Injectable()
export class NavigationService {
  private activeSessionsStore: Map<string, NavigationSessionData> = new Map();

  constructor(private prisma: PrismaService) {}

  /**
   * Initialize "Go To Customer" Navigation
   */
  async startNavigation(orderId: string, beauticianId: string): Promise<NavigationSessionData> {
    // Varanasi Hub Coordinates (Sigra Salon Base)
    const beauticianOrigin = {
      lat: 25.3176,
      lng: 82.9739,
      label: 'Sigra Salon Dispatch Center, Varanasi',
    };

    // Destination Customer Location
    const customerDestination = {
      lat: 25.2899,
      lng: 82.9996,
      address: 'Flat 302, Anand Nagar Colony, Near Assi Ghat, Varanasi - 221005',
    };

    // Simulated vector route points along Varanasi transit corridor
    const routeCoordinates = [
      { lat: 25.3176, lng: 82.9739 }, // Origin: Sigra Hub
      { lat: 25.3121, lng: 82.9804 }, // Rathyatra Crossing
      { lat: 25.3045, lng: 82.9880 }, // Gurubagh / Kamachha
      { lat: 25.2970, lng: 82.9925 }, // Bhelupur Road
      { lat: 25.2915, lng: 82.9960 }, // Durgakund Road
      { lat: 25.2899, lng: 82.9996 }, // Assi Ghat Customer Destination
    ];

    const turnInstructions = [
      'Head southeast on Sigra-Mahmoorganj Road toward Rathyatra (600m)',
      'At Rathyatra Crossing, take the 2nd exit onto Kamachha Road (1.1 km)',
      'Continue straight past Bhelupur Police Station (800m)',
      'Turn left toward Durgakund-Assi Link Road (500m)',
      'Arrive at Anand Nagar Colony Gate on your left (Destination)',
    ];

    const session: NavigationSessionData = {
      orderId,
      beauticianId,
      currentLocation: beauticianOrigin,
      customerLocation: customerDestination,
      distanceKm: 2.8,
      estimatedTimeMin: 14,
      routeCoordinates,
      turnInstructions,
      status: 'NAVIGATING',
      updatedAt: new Date().toISOString(),
      provider: 'DEMO_VECTOR_MAP',
    };

    this.activeSessionsStore.set(orderId, session);
    return session;
  }

  /**
   * Live GPS Ping update from Beautician device (or simulated tracking)
   */
  async updateLiveLocation(orderId: string, lat: number, lng: number): Promise<NavigationSessionData> {
    let session = this.activeSessionsStore.get(orderId);
    if (!session) {
      session = await this.startNavigation(orderId, 'worker-1');
    }

    session.currentLocation.lat = lat;
    session.currentLocation.lng = lng;
    session.updatedAt = new Date().toISOString();

    // Recalculate remaining distance (Haversine formula approximation)
    const remainingKm = this.calculateDistance(
      lat,
      lng,
      session.customerLocation.lat,
      session.customerLocation.lng
    );

    session.distanceKm = Number(remainingKm.toFixed(2));
    session.estimatedTimeMin = Math.max(1, Math.round(session.distanceKm * 4.5)); // ~15km/h city bike speed

    if (session.distanceKm < 0.1) {
      session.status = 'ARRIVED';
    }

    this.activeSessionsStore.set(orderId, session);
    return session;
  }

  async getNavigationSession(orderId: string): Promise<NavigationSessionData> {
    const session = this.activeSessionsStore.get(orderId);
    if (!session) {
      return this.startNavigation(orderId, 'worker-1');
    }
    return session;
  }

  async markArrived(orderId: string) {
    const session = await this.getNavigationSession(orderId);
    session.status = 'ARRIVED';
    session.distanceKm = 0;
    session.estimatedTimeMin = 0;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  /**
   * Helper Haversine Distance
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
