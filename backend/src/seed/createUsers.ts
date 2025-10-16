import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import "dotenv/config";

const MONGODB_URL = process.env.MONGODB_URL!;

(async () => {
  await mongoose.connect(MONGODB_URL);

  const mk = async (name: string, email: string, role: "ADMIN"|"DRIVER", pin: string) => {
    const pinHash = await bcrypt.hash(pin, 10);
    const u = await User.findOneAndUpdate({ email }, { name, email, role, pinHash, status:"ACTIVE" }, { upsert: true, new: true });
    console.log(`✓ ${role} user: ${u.email} (pin: ${pin})`);
  };

  await mk("Admin", "admin@postinfo.ba", "ADMIN", "1234");
  await mk("Vozač Pero", "driver1@postinfo.ba", "DRIVER", "1111");

  await mongoose.disconnect();
})();
