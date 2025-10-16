import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
// opcionalno:
import morgan from "morgan";
import shipmentsRouter from "./routes/shipments";

import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173", 'https://bingoposta.edinmesan.ba'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (typeof origin === "string" && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  
  // Ako je OPTIONS request (preflight request), odmah vraćamo status 200
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); // ako želiš logove

app.get("/health", (_req, res) => res.json({ ok: true, message: "Server radi ✅" }));
app.use("/shipments", shipmentsRouter);

app.use("/auth", authRoutes);

// centralizovan handler za greške (Zod i ostalo)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.name === "ZodError") {
    return res.status(400).json({ error: "validation_error", details: err.errors });
  }
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URL = process.env.MONGODB_URL || "";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
