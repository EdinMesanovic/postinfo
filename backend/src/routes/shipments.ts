import { Router } from "express";
import { z } from "zod";
import { Shipment, ShipmentStatus } from "../models/Shipment";
import { customAlphabet } from "nanoid";

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
    });

    const { pjCode, pjName, pieces, notes } = schema.parse(req.body);
    const qrSlug = nanoid();

    const created = await Shipment.create({ pjCode, pjName, pieces, notes, qrSlug });
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

// POST /shipments/scan/pickup -> označi preuzeto (vozač skenira QR)
router.post("/scan/pickup", async (req, res, next) => {
  try {
    const schema = z.object({ qrSlug: z.string().min(8) });
    const { qrSlug } = schema.parse(req.body);

    const s = await Shipment.findOne({ qrSlug });
    if (!s) return res.status(404).json({ error: "qr_not_found" });

    if (s.status === ShipmentStatus.PICKED_BY_DRIVER) {
      return res.json({ ok: true, alreadyPicked: true });
    }

    s.status = ShipmentStatus.PICKED_BY_DRIVER;
    s.pickedAt = new Date();
    await s.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
