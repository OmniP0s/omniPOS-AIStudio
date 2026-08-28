// Delivery & Fleet Logistics Engine - OmniPOS Enterprise
import { DeliveryDriver, DeliveryZone, DeliveryOrderPayload } from '../../types';

export class DeliveryFleetEngine {
  private drivers: DeliveryDriver[] = [
    {
      id: 'DRV-101',
      code: 'DRV-RYD-01',
      name: 'Sultan Al-Ghamdi',
      phone: '+966 50 123 4567',
      vehicleType: 'MOTORCYCLE',
      licensePlate: 'أ ب د 1234',
      currentStatus: 'ON_THE_WAY',
      assignedOrderId: '#ORD-8821',
      currentLocation: { lat: 24.7136, lng: 46.6753, heading: 45 },
      rating: 4.95,
      completedDeliveriesToday: 14,
      cashCollectedSar: 340,
      batteryLevelPercent: 88,
    },
    {
      id: 'DRV-102',
      code: 'DRV-RYD-02',
      name: 'Majed Al-Mutairi',
      phone: '+966 55 987 6543',
      vehicleType: 'MOTORCYCLE',
      licensePlate: 'ر ص ع 5678',
      currentStatus: 'PICKING_UP',
      assignedOrderId: '#ORD-8824',
      currentLocation: { lat: 24.7224, lng: 46.6859, heading: 120 },
      rating: 4.88,
      completedDeliveriesToday: 11,
      cashCollectedSar: 215,
      batteryLevelPercent: 74,
    },
    {
      id: 'DRV-103',
      code: 'DRV-RYD-03',
      name: 'Nawaf Al-Harbi',
      phone: '+966 54 332 1100',
      vehicleType: 'CAR',
      licensePlate: 'س ط ق 9012',
      currentStatus: 'IDLE',
      currentLocation: { lat: 24.7001, lng: 46.6622, heading: 0 },
      rating: 4.92,
      completedDeliveriesToday: 16,
      cashCollectedSar: 580,
      batteryLevelPercent: 95,
    },
  ];

  private deliveryZones: DeliveryZone[] = [
    {
      id: 'zone-01',
      nameEn: 'Al Olaya & King Fahd Corridor',
      nameAr: 'حي العليا ومحور طريق الملك فهد',
      branchId: 'b1',
      radiusKm: 5.0,
      baseDeliveryFeeSar: 12.0,
      minimumOrderSar: 45.0,
      estimatedTimeMin: 25,
      isActive: true,
    },
    {
      id: 'zone-02',
      nameEn: 'Al Nakheel & Digital City',
      nameAr: 'حي النخيل والمدينة الرقمية',
      branchId: 'b1',
      radiusKm: 9.0,
      baseDeliveryFeeSar: 18.0,
      minimumOrderSar: 60.0,
      estimatedTimeMin: 35,
      isActive: true,
    },
    {
      id: 'zone-03',
      nameEn: 'Al Malqa & Hittin Luxury Zone',
      nameAr: 'حي الملقا وحطين والبوليفارد',
      branchId: 'b1',
      radiusKm: 14.0,
      baseDeliveryFeeSar: 25.0,
      minimumOrderSar: 80.0,
      estimatedTimeMin: 45,
      isActive: true,
    },
  ];

  private activeDeliveries: DeliveryOrderPayload[] = [
    {
      orderId: '#ORD-8821',
      customerName: 'Abdulaziz Al-Saud',
      customerPhone: '+966 50 555 4433',
      deliveryAddress: 'Villa 14, Prince Turki St, Al Malqa, Riyadh',
      coordinates: { lat: 24.7743, lng: 46.6343 },
      driverId: 'DRV-101',
      driverName: 'Sultan Al-Ghamdi',
      status: 'IN_TRANSIT',
      estimatedArrivalTimestamp: '12:42 PM (8 mins away)',
      otpCode: '4921',
    },
    {
      orderId: '#ORD-8824',
      customerName: 'Sarah Al-Mansoor',
      customerPhone: '+966 56 112 3344',
      deliveryAddress: 'Apt 4B, Olaya Towers, Riyadh',
      coordinates: { lat: 24.7082, lng: 46.6811 },
      driverId: 'DRV-102',
      driverName: 'Majed Al-Mutairi',
      status: 'DISPATCHED',
      estimatedArrivalTimestamp: '12:55 PM (18 mins away)',
      otpCode: '8832',
    },
  ];

  public getDrivers(): DeliveryDriver[] {
    return this.drivers;
  }

  public getZones(): DeliveryZone[] {
    return this.deliveryZones;
  }

  public getActiveDeliveries(): DeliveryOrderPayload[] {
    return this.activeDeliveries;
  }

  public autoDispatchOrder(orderId: string, customerName: string, customerPhone: string, deliveryAddress: string): DeliveryOrderPayload {
    // Pick first IDLE driver or lowest load
    const idleDriver = this.drivers.find(d => d.currentStatus === 'IDLE') || this.drivers[0];
    idleDriver.currentStatus = 'ASSIGNED';
    idleDriver.assignedOrderId = orderId;

    const delivery: DeliveryOrderPayload = {
      orderId,
      customerName,
      customerPhone,
      deliveryAddress,
      coordinates: { lat: 24.7136, lng: 46.6753 },
      driverId: idleDriver.id,
      driverName: idleDriver.name,
      status: 'DISPATCHED',
      estimatedArrivalTimestamp: '15 mins',
      otpCode: Math.floor(1000 + Math.random() * 9000).toString(),
    };

    this.activeDeliveries.unshift(delivery);
    return delivery;
  }

  public confirmProofOfDelivery(orderId: string, otpInput: string): boolean {
    const delivery = this.activeDeliveries.find(d => d.orderId === orderId);
    if (!delivery) return false;
    if (delivery.otpCode !== otpInput) return false;

    delivery.status = 'DELIVERED';
    if (delivery.driverId) {
      const drv = this.drivers.find(d => d.id === delivery.driverId);
      if (drv) {
        drv.currentStatus = 'IDLE';
        drv.assignedOrderId = undefined;
        drv.completedDeliveriesToday += 1;
      }
    }
    return true;
  }
}

export const globalDeliveryFleet = new DeliveryFleetEngine();
