import express from "express";
import { prisma } from "../db.js";
import { generateAccessCode, toQrDataUrl } from "../utils/qr.js";
import { normalizeRows, makeCsv, makeXlsx } from "../utils/export.js";

const router = express.Router();

// creeaza un eveniment nou
router.post("/event-groups/:groupId/events", async (req, res) => {
  const userId = req.user.userId;
  const groupId = Number(req.params.groupId);
  const { title, description, startTime, endTime } = req.body || {};

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ message: "titlu, start, sfarsit obligatorii" });
  }

    if (startTime > endTime) {
    return res.status(400).json({ message: "Data de start nu poate fi dupa data de sfarsit" });
  }

  //verf daca grupul exista si apartine userului
  const group = await prisma.eventGroup.findFirst({ where: { id: groupId, ownerId: userId } });
  if (!group) return res.status(404).json({ message: "Grupul nu a fost gasit" });

  //generam cod de acces
  let code = generateAccessCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.event.findUnique({ where: { accessCode: code } });
    if (!exists) break;
    code = generateAccessCode();
  }

  //generare QR
  const qrDataUrl = await toQrDataUrl(code);

  //salveaza even in DB
  const event = await prisma.event.create({
    data: {
      groupId,
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      accessCode: code,
      qrDataUrl,
      status: "CLOSED",
      statusManual: false,
    },
  });

  res.status(201).json(event);
});

//returneaza detaliile unui eveniment daca apartine org
router.get("/events/:id", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  //cauta even in grupurile utiliz
  const event = await prisma.event.findFirst({
    where: { id, group: { ownerId: userId } },
    include: { group: true },
  });

  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});


router.patch("/events/:id/status", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  const { status, manual } = req.body || {};

  //validare status
  if (status !== "OPEN" && status !== "CLOSED") {
    return res.status(400).json({ message: "status trebuie sa fie OPEN sau CLOSED" });
  }

  //verificam accesul la eveniment
  const event = await prisma.event.findFirst({ where: { id, group: { ownerId: userId } } });
  if (!event) return res.status(404).json({ message: "Evenimentul nu a fost gasit" });

  //actualizam status + manual/auto
  const updated = await prisma.event.update({
    where: { id },
    data: { status, statusManual: manual === true },
  });

  res.json(updated);
});


// lista de prezente pt un even
router.get("/events/:id/attendance", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  //verf accesul la even
  const event = await prisma.event.findFirst({ where: { id, group: { ownerId: userId } } });
  if (!event) return res.status(404).json({ message: "Evenimentul nu a fost gasit" });

  //prezente + participant
  const attendances = await prisma.attendance.findMany({
    where: { eventId: id },
    include: { participant: true },
    orderBy: { joinedAt: "desc" },
  });

  res.json(attendances);
});

// codul + qr al evenimentului
router.get("/events/:id/qr", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  const event = await prisma.event.findFirst({ where: { id, group: { ownerId: userId } }, select: { qrDataUrl: true, accessCode: true } });
  if (!event) return res.status(404).json({ message: "Evenimentul nu a fost gasit" });

  res.json(event);
});

// export prezenta pentru un even
router.get("/events/:id/export", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  const format = String(req.query.format || "csv");

  //verf accesul la even
  const event = await prisma.event.findFirst({ where: { id, group: { ownerId: userId } } });
  if (!event) return res.status(404).json({ message: "Event not found" });

  //luam prezentele + legaturi participant/eveniment
  const att = await prisma.attendance.findMany({
    where: { eventId: id },
    include: { participant: true, event: true },
    orderBy: { joinedAt: "asc" },
  });

  //normalizam datele pt export
  const rows = normalizeRows(att);

  if (format === "xlsx") {
    const buf = await makeXlsx(rows);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="event-${id}-prezente.xlsx"`);
    return res.send(Buffer.from(buf));
  }

  const csv = makeCsv(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="event-${id}-prezente.csv"`);
  return res.send(csv);
});

// prezenta pe toate even dintr-un grup
router.get("/event-groups/:id/export", async (req, res) => {
  const userId = req.user.userId;
  const groupId = Number(req.params.id);
  const format = String(req.query.format || "csv");

  //verf ca grupul apartine utiliz
  const group = await prisma.eventGroup.findFirst({ where: { id: groupId, ownerId: userId } });
  if (!group) return res.status(404).json({ message: "Grupul nu a fost gasit" });

  //luam toate prezentele din grup
  const att = await prisma.attendance.findMany({
    where: { event: { groupId } },
    include: { participant: true, event: true },
    orderBy: { joinedAt: "asc" },
  });

  const rows = normalizeRows(att);

  if (format === "xlsx") {
    const buf = await makeXlsx(rows);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="group-${groupId}-prezenta.xlsx"`);
    return res.send(Buffer.from(buf));
  }

  const csv = makeCsv(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="group-${groupId}-prezenta.csv"`);
  return res.send(csv);
});

export default router;
