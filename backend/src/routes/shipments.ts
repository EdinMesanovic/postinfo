import { Router } from "express";
import { z } from "zod";
import { Shipment, ShipmentStatus } from "../models/Shipment";
import { customAlphabet } from "nanoid";
import { authRequired, roleRequired, AuthReq } from "../middlewares/auth";

// hexa 12 chars za QR payload (npr. a19c3f9b7d2e)
//radi
const nanoid = customAlphabet("0123456789abcdef", 12);


const router = Router();

// POST /shipments -> kreiraj pošiljku
router.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      pjCode: z.string().min(1),
      pjName: z.string().min(1),
      pieces: z.number().int().positive().optional(),
      notes: z.string().optional(),
      documents: z.string().optional(),
    });

    const { pjCode, pjName, pieces, notes, documents } = schema.parse(req.body);
    const qrSlug = nanoid();

    const created = await Shipment.create({ pjCode, pjName, pieces, notes, qrSlug, documents });
    res.json(created);
  } catch (err) {
    next(err);
  }
});

// GET /shipments?status=&q=&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q as string) || "";
    const status = (req.query.status as string) || undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 50);

    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.$or = [
        { pjCode: { $regex: q, $options: "i" } },
        { pjName: { $regex: q, $options: "i" } },
        { qrSlug: { $regex: q, $options: "i" } },
      ];
    }

    const data = await Shipment.find(where)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /shipments/:id -> jedna pošiljka (za print A4)
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Shipment.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "not_found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /shipments/scan/pickup -> označi preuzeto (vozač skenira QR)
 * Zaštita: samo ulogovani DRIVER.
 * Idempotentno: ako je već preuzeto, vraća alreadyPicked=true.
 */
router.post(
  "/scan/pickup",
  authRequired,
  roleRequired("DRIVER"),
  async (req: AuthReq, res, next) => {
    try {
      const schema = z.object({ qrSlug: z.string().min(8) });
      const { qrSlug } = schema.parse(req.body);

      // 1) Pokušaj atomskog update-a SAMO ako još nije preuzeto
      const now = new Date();
      const updated = await Shipment.findOneAndUpdate(
        { qrSlug, status: { $ne: ShipmentStatus.PICKED_BY_DRIVER } },
        {
          $set: {
            status: ShipmentStatus.PICKED_BY_DRIVER,
            pickedAt: now,
            pickedBy: req.user!._id, // iz auth middleware-a
            updatedAt: now,
          },
        },
        { new: true }
      ).lean();

      if (updated) {
        return res.json({
          ok: true,
          picked: true,
          shipmentId: updated._id,
          status: updated.status,
          pickedAt: updated.pickedAt,
          pickedBy: req.user, // minimal info o vozaču koji je skenirao
        });
      }

      // 2) Ako nije update-ano, provjeri razlog: ne postoji ili već preuzeto
      const existing = await Shipment.findOne({ qrSlug }).lean();
      if (!existing) {
        return res.status(404).json({ ok: false, error: "qr_not_found" });
      }

      // Već preuzeto – vrati info (idempotentno)
      if (existing.status === ShipmentStatus.PICKED_BY_DRIVER) {
        return res.json({
          ok: true,
          picked: false,
          alreadyPicked: true,
          shipmentId: existing._id,
          status: existing.status,
          pickedAt: existing.pickedAt ?? null,
          pickedBy: existing.pickedBy ?? null,
        });
      }

      // Ne bi trebalo doći ovdje, ali fallback:
      return res.status(409).json({ ok: false, error: "pickup_conflict" });
    } catch (err) {
      next(err);
    }
  }
);


export default router;
