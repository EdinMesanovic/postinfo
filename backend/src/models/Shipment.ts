import { Schema, model, InferSchemaType } from "mongoose";

export const ShipmentStatus = {
  CREATED_IN_POST: "CREATED_IN_POST",
  AT_LDC: "AT_LDC",
  PICKED_BY_DRIVER: "PICKED_BY_DRIVER",
  DELIVERED: "DELIVERED",
} as const;

const ShipmentSchema = new Schema(
  {
    pjCode:   { type: String, required: true, trim: true }, // npr. "0123"
    pjName:   { type: String, required: true, trim: true }, // npr. "PJ Gradačac"
    pieces:   { type: Number },
    notes:    { type: String },
    documents:{ type: String }, // imena fajlova u /uploads
    qrSlug:   { type: String, required: true, unique: true, index: true }, // payload za QR
    status:   { type: String, enum: Object.values(ShipmentStatus), default: ShipmentStatus.CREATED_IN_POST, index: true },
    pickedBy: { type: Schema.Types.ObjectId, ref: "User" },
    pickedAt: { type: Date },
  },
  { timestamps: true }
);

export type ShipmentDoc = InferSchemaType<typeof ShipmentSchema>;
export const Shipment = model("Shipment", ShipmentSchema);
