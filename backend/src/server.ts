import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
// opcionalno:
import morgan from "morgan";
import shipmentsRouter from "./routes/shipments";

dotenv.config();

const app = express();

app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(express.json());
app.use(morgan("dev")); // ako želiš logove

app.get("/health", (_req, res) => res.json({ ok: true, message: "Server radi ✅" }));
app.use("/shipments", shipmentsRouter);

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
