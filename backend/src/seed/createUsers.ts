import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "../config";           // ✅ koristi centralnu konfiguraciju
import { User } from "../models/User";

const SALT_ROUNDS = 10;

/** Utility funkcija za kreiranje ili ažuriranje korisnika */
async function mk(
  username: string,
  role: "ADMIN" | "DRIVER",
  password: string
) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const cleanUsername = username.toLowerCase().trim();

  const u = await User.findOneAndUpdate(
    { username: cleanUsername },
    {
      username: cleanUsername,
      role,
      passwordHash,
      status: "ACTIVE",
    },
    { upsert: true, new: true }
  );

  console.log(`✓ ${role} user: ${u.username} (password: ${password})`);
}

/** Glavna funkcija */
async function main() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(config.mongoUrl);
  console.log("✅ MongoDB connected");

  // --- Dodaj/azuriraj korisnike ovdje ---
  await mk("edin.mesanovic", "ADMIN", "adminposta");
  await mk("admir.huremovic", "DRIVER", "vozacposta");

  // --------------------------------------

  await mongoose.disconnect();
  console.log("✅ Users created/updated. Done.");
}

/** Pokreni skriptu */
main().catch((err) => {
  console.error("❌ Seed error:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});