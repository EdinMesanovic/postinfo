import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { IUser } from "../models/User";

export interface AuthReq extends Request {
  user?: Pick<IUser, "_id" | "name" | "role">;
}

const COOKIE_NAME = process.env.COOKIE_NAME || "sid";
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export function authRequired(req: AuthReq, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { _id: payload.sub, name: payload.name, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
  }
}

export function roleRequired(role: "ADMIN" | "DRIVER") {
  return (req: AuthReq, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ ok: false, error: "UNAUTHENTICATED" });
    if (req.user.role !== role) return res.status(403).json({ ok: false, error: "FORBIDDEN" });
    next();
  };
}
