import express from "express";
import { prisma } from "../db.js";
import { getNowDate } from "../utils/time.js";

const router = express.Router();


router.post("/check-in", async (req, res) => {
  const { code, name, email, method } = req.body || {};

  if (!code || !name || !method) {
    return res.status(400).json({ message: "Cod, nume si metoda sunt necesare!" });
  }
  if (method !== "QR" && method !== "TEXT") {
    return res.status(400).json({ message: "Metoda poate fi QR/TXT" });
  }

  //cauta even dupa cod de acces
  const event = await prisma.event.findUnique({ where: { accessCode: code } });
  if (!event) return res.status(404).json({ message: "Cod Invalid" });

  // status trebuie să fie OPEN
  if (event.status !== "OPEN") return res.status(403).json({ message: "Event is not OPEN" });

  // verf duplicat dupa nume si mail
  const existing = await prisma.attendance.findFirst({
    where: {
      eventId: event.id,
      participant: {
        name,
        email: email || null,
      },
    },
    include: { participant: true },
  });


  if (existing) {
    return res.json({ ok: true, message: "Deja esti confirmat", attendance: existing });
  }

  //creeam participantul daca nu exista deja
  const participant = await prisma.participant.create({
    data: { name, email: email || null },
  });

  const joinedAt = await getNowDate();

  //inregistrarea de prezenta pentru DB
  const attendance = await prisma.attendance.create({
    data: {
      eventId: event.id,
      participantId: participant.id,
      joinedAt,
      method,
    },
    include: { participant: true },
  });

  res.status(201).json({ ok: true, attendance });
});

export default router;
