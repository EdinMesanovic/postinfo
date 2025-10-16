import { Router } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";  
import { User } from "../models/User";
import { authRequired } from "../middlewares/auth";

const router = Router();

const COOKIE_NAME = process.env.COOKIE_NAME || "sid";
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "devsecret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "90d";
const isProd = process.env.NODE_ENV === "production";

function setAuthCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,          // HTTPS u produkciji
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 90, // 90 dana
  });
}

router.post("/login", async (req, res) => {
  const { email, phone, pin } = req.body || {};
  if ((!email && !phone) || !pin) {
    return res.status(400).json({ ok: false, error: "EMAIL_OR_PHONE_AND_PIN_REQUIRED" });
  }
  const user = await User.findOne(
    email ? { email } : { phone }
  ).lean(false);

  if (!user || user.status !== "ACTIVE") {
    return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
  }
  const ok = await bcrypt.compare(String(pin), user.pinHash);
  if (!ok) return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });

  user.lastLoginAt = new Date();
  await user.save();

  const token = jwt.sign(
    { sub: String(user._id), name: user.name, role: user.role },
    JWT_SECRET,                                    // ✅ tip: jwt.Secret
    { expiresIn: JWT_EXPIRES } as jwt.SignOptions  // ✅ options eksplicitno
    );
  setAuthCookie(res, token);

  return res.json({
    ok: true,
    user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone }
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", authRequired, async (req: any, res) => {
  // req.user dolazi iz authRequired
  res.json({ ok: true, user: req.user });
});

export default router;
