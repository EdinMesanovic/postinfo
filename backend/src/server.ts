// src/server.ts
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet"; // ✅ [NOVO] sigurnosni HTTP headeri

import config from "./config";
import shipmentsRouter from "./routes/shipments";
import authRoutes from "./routes/auth";
import { authRequired } from "./middlewares/auth";

const app = express();

/** ✅ [NOVO] sigurnosno: sakrij Express potpis */
app.disable("x-powered-by");

/** Proxy-aware (ako si iza Nginx/Cloudflare) */
app.set("trust proxy", 1);

/** ✅ [NOVO] Helmet (sigurnosni headeri: X-Frame-Options, X-Content-Type-Options, itd.) */
app.use(helmet());

/** CORS (iz configa) */
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Dozvoli Postman/curl bez Origin headera
      if (config.cors.origins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-CSRF-Token",
    ],
  })
);

/** Parsers & middleware */
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (!config.isProd) app.use(morgan("dev"));
if (config.isProd) app.use(compression()); // ✅ [NOVO] kompresuj odgovore u produkciji

/** Root ping */
app.get("/", (_req, res) => res.status(200).send("Bingo Posta API"));

/** ✅ [NOVO] Health (liveness): proces živi */
app.get("/api/v1/health", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({
    status: "ok",
    version: "v1",
    env: config.env,
    time: new Date().toISOString(),
  });
});

/** ✅ [NOVO] helper: aktivno pingaj Mongo (uhvati “polu-mrtve” konekcije) */
async function mongoReady(timeoutMs = 800): Promise<boolean> {
  // 1 = connected, 2 = connecting, 0/3 = disconnected/disconnecting
  if (mongoose.connection.readyState !== 1) return false;
  try {
    // @ts-ignore - admin().ping nije tipizovan u mongoose types
    const res = await (mongoose.connection.db as any).admin().ping();
    return !!res;
  } catch {
    return false;
  }
}

/** ✅ [NOVO] Readiness: servis stvarno spreman (DB ok?). Kad padne DB -> 503 */
app.get("/api/v1/ready", async (_req, res) => {
  res.set("Cache-Control", "no-store");

  const mongoOk = await mongoReady();
  const ok = mongoOk;

  res.status(ok ? 200 : 503).json({
    ok,
    mongo: mongoOk ? "connected" : "down",
    time: new Date().toISOString(),
  });
});

/** ✅ Rate limiter samo za /auth (štiti login/refresh od brute-force napada) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min prozor
  max: 100,                 // 100 req/IP u prozoru
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "rate_limited" },
});

/** API v1 namespace */
const v1 = express.Router();

// javne rute
v1.use("/auth", authLimiter, authRoutes);

// zaštićene rute
v1.use("/shipments", authRequired, shipmentsRouter);

// mount
app.use("/api/v1", v1);

/**
 * (Opcionalno) /api kao deprecated “alias” za /api/v1
 * Klijentima daje do znanja da će stari path biti ugašen (via headeri),
 * ali i dalje radi jer montiramo isti router.
 */
app.use(
  "/api",
  (req, res, next) => {
    res.set("Deprecation", "true");
    res.set("Sunset", "2026-01-31");
    next();
  },
  v1
);

/** 404 handler */
app.use((req, res) =>
  res.status(404).json({ error: "not_found", path: req.originalUrl })
);

/** Centralni error handler (Zod i ostalo) */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err?.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "validation_error", details: err.errors });
    }
    if (!config.isProd) console.error(err);
    res.status(err.status || 500).json({
      error: err.code || "server_error",
      message: err.message || "Internal Server Error",
    });
  }
);

/** Start + Mongo + graceful shutdown */
async function start() {
  await mongoose.connect(config.mongoUrl);
  console.log("✅ MongoDB connected");

  const server = app.listen(config.port, () =>
    console.log(`🚀 API running on http://localhost:${config.port} (${config.env})`)
  );

  /** ✅ Graceful shutdown: zatvori HTTP i DB konekciju kada stigne signal */
  const shutdown = async (sig: string) => {
    console.log(`↩️  ${sig} received. Shutting down...`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});

export default app;