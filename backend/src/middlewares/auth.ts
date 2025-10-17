import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { IUser } from "../models/User";
import config from "../config";

export interface AuthReq extends Request {
  user?: Pick<IUser, "_id" | "username" | "role">;
}

// Helper: verifikuj access token i vrati JwtPayload
function verifyAccess(token: string): JwtPayload {
  const payload = jwt.verify(token, config.jwt.accessSecret);
  if (typeof payload === "string") throw new Error("Invalid token payload");
  return payload;
}

// === Auth guard: zahtijeva Authorization: Bearer <accessToken> ===
export function authRequired(req: AuthReq, res: Response, next: NextFunction) {
  const authHeader = (req.headers.authorization || "").trim();
  const [scheme, token] = authHeader.split(/\s+/);

  if (!/^Bearer$/i.test(scheme || "") || !token) {
    return res
      .status(401)
      .json({ ok: false, error: "UNAUTHORIZED", message: "Missing Bearer token" });
  }

  try {
    const payload = verifyAccess(token);

    // Očekujemo u payloadu: sub (userId), role, (opciono) username
    const userId = String(payload.sub || "");
    const role = String((payload as any).role || "");
    const username = String((payload as any).username || "");

    if (!userId || !role) {
      return res
        .status(401)
        .json({ ok: false, error: "UNAUTHORIZED", message: "Invalid token payload" });
    }

    req.user = {
      _id: userId as any,              // kompatibilno sa IUser._id (ObjectId)
      username,
      role: role as IUser["role"],
    };

    return next();
  } catch (err: any) {
    const msg = err?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED", message: msg });
  }
}

// === Role guard: dozvoljava pristup samo zadatoj roli ===
export function roleRequired(role: "ADMIN" | "DRIVER") {
  return (req: AuthReq, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ ok: false, error: "FORBIDDEN" });
    }
    next();
  };
}

// (Opcionalno) više rola odjednom
// export function rolesRequired(...roles: Array<"ADMIN" | "DRIVER">) {
//   return (req: AuthReq, res: Response, next: NextFunction) => {
//     if (!req.user) return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ ok: false, error: "FORBIDDEN" });
//     }
//     next();
//   };
// }