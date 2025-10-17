import { Router } from "express";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { User } from "../models/User";
import { authRequired } from "../middlewares/auth";
import config from "../config"; // koristi tvoje .env vrijednosti

const router = Router();

/** Helperi za potpisivanje tokena */
const signAccess = (payload: object) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTtl, // npr. "30m"
  } as jwt.SignOptions);

const signRefresh = (payload: object) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTtl, // npr. "15d"
  } as jwt.SignOptions);

/** Funkcija za izračun expiry datuma iz string formata ("15d", "30m", itd.) */
function calcExpiry(ttl: string): Date {
  const now = Date.now();
  const match = ttl.match(/^(\d+)([smhd])$/); // sekunde, minute, sati, dani
  if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000); // default 7d
  const num = Number(match[1]);
  const unit = match[2];
  const ms =
    unit === "s"
      ? num * 1000
      : unit === "m"
      ? num * 60 * 1000
      : unit === "h"
      ? num * 60 * 60 * 1000
      : num * 24 * 60 * 60 * 1000;
  return new Date(now + ms);
}

/** LOGIN: { username, password } → access + refresh; snima nonce+expires u Mongo */
router.post("/login", async (req, res) => {
  const Body = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });
  const { username, password } = Body.parse(req.body);

  const user = await User.findOne({ username: username.toLowerCase().trim() }).lean(false);
  if (!user || user.status !== "ACTIVE") {
    return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });

  const nonce = crypto.randomUUID();
  user.refreshNonce = nonce;
  user.refreshExpiresAt = calcExpiry(config.jwt.refreshTtl); // koristi "15d"
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccess({
    sub: String(user._id),
    role: user.role,
    username: user.username,
  });
  const refreshToken = signRefresh({
    sub: String(user._id),
    nonce,
  });

  return res.json({
    ok: true,
    accessToken,
    refreshToken,
    user: { id: user._id, username: user.username, role: user.role, status: user.status },
  });
});

/** REFRESH: validiraj refresh JWT, provjeri nonce i expiry u Mongo, rotiraj */
router.post("/refresh", async (req, res) => {
  const Body = z.object({ refreshToken: z.string().min(1) });
  const { refreshToken } = Body.parse(req.body);

  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    const userId = String(payload.sub || "");
    const nonce = String(payload.nonce || "");
    if (!userId || !nonce)
      return res.status(401).json({ ok: false, error: "INVALID_REFRESH" });

    const user = await User.findById(userId).lean(false);
    if (!user || user.status !== "ACTIVE")
      return res.status(401).json({ ok: false, error: "INVALID_REFRESH" });

    const nonceMatch = !!user.refreshNonce && user.refreshNonce === nonce;
    const notExpired =
      !!user.refreshExpiresAt && user.refreshExpiresAt.getTime() > Date.now();

    if (!nonceMatch || !notExpired)
      return res.status(401).json({ ok: false, error: "INVALID_REFRESH" });

    // rotiraj nonce i produži trajanje
    const newNonce = crypto.randomUUID();
    user.refreshNonce = newNonce;
    user.refreshExpiresAt = calcExpiry(config.jwt.refreshTtl);
    await user.save();

    const newAccessToken = signAccess({
      sub: userId,
      role: user.role,
      username: user.username,
    });
    const newRefreshToken = signRefresh({
      sub: userId,
      nonce: newNonce,
    });

    return res.json({
      ok: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({ ok: false, error: "INVALID_REFRESH" });
  }
});

/** LOGOUT: poništi refreshNonce + refreshExpiresAt */
router.post("/logout", authRequired, async (req: any, res) => {
  const user = await User.findById(req.user._id).lean(false);
  if (user) {
    user.refreshNonce = null;
    user.refreshExpiresAt = null;
    await user.save();
  }
  return res.json({ ok: true , message: "success logout" });
});

/** ME */
router.get("/me", authRequired, (req: any, res) => {
  res.json({ ok: true, user: req.user });
});

export default router;