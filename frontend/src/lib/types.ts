export type ShipmentStatus = 'CREATED_IN_POST' | 'AT_LDC' | 'PICKED_BY_DRIVER' | 'DELIVERED';

export interface Shipment {
  _id: string;
  pjCode: string;
  pjName: string;
  pieces?: number;
  notes?: string;
  qrSlug: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}
