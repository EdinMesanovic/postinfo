import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "ADMIN" | "DRIVER";
export type UserStatus = "ACTIVE" | "DISABLED";

export interface IUser extends Document {
  username: string;                    // koristi se za login
  role: UserRole;                      // ADMIN | DRIVER
  passwordHash: string;                // bcrypt hash lozinke
  status: UserStatus;                  // ACTIVE | DISABLED
  lastLoginAt?: Date;

  // 🔽 NOVO — Mongo refresh token sistem
  refreshNonce?: string | null;        // UUID koji vrijedi za trenutni refresh token
  refreshExpiresAt?: Date | null;      // do kada refresh token važi

  createdAt: Date;
  updatedAt: Date;

  comparePassword(password: string): Promise<boolean>;
}

// === Shema ===
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 64,
    },
    role: { type: String, enum: ["ADMIN", "DRIVER"], required: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
    lastLoginAt: { type: Date },

    // ✅ Polja za refresh token (Mongo-based)
    refreshNonce: { type: String, default: null },
    refreshExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🔍 Indeksi — optimizacija pretrage i sigurniji refresh lookup
UserSchema.index({ username: 1, status: 1 });
UserSchema.index({ refreshNonce: 1 }); // za brzu provjeru refresha ako ikad zatreba

// === Instance metoda za provjeru lozinke ===
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

// === (Opcionalno) Pre-save hook ako naknadno dodaš registraciju ===
// Ako ručno ne hashiraš password prije .save(), ovaj hook to radi automatski.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

export const User = model<IUser>("User", UserSchema);