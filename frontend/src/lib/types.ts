export type ShipmentStatus =
  | 'CREATED_IN_POST'
  | 'AT_LDC'
  | 'PICKED_BY_DRIVER'
  | 'DELIVERED';

export interface Shipment {
  _id: string;
  pjCode: string;
  pjName: string;
  pieces?: number;
  notes?: string;
  documents?: string; // plain text
  qrSlug: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;

  // NOVO: info o preuzimanju
  pickedAt?: string;
  pickedBy?: string;           // ObjectId kao string
  pickedByName?: string;       // snapshot imena/username-a
  pickedByUsername?: string;   // snapshot username (ako želiš)
}
