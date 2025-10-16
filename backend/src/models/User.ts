import { Schema, model, Document } from "mongoose";

export type UserRole = "ADMIN" | "DRIVER";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  pinHash: string;            // 4–6 cifara hashirano (bcrypt)
  status: "ACTIVE" | "DISABLED";
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["ADMIN", "DRIVER"], required: true },
    pinHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, status: 1 });

export const User = model<IUser>("User", UserSchema);
