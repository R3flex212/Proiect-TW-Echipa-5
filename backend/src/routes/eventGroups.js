import express from "express";
import { prisma } from "../db.js";

const router = express.Router();

//returneaza grupurile organizatorului
router.get("/", async (req, res) => {
  //userId este extras din JWT
  const userId = req.user.userId;

  //luam grupurile utilizatorului, ordonate desc dupa data creeari
  const groups = await prisma.eventGroup.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(groups);
});

//creeaza grup nou
router.post("/", async (req, res) => {
  const userId = req.user.userId;
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ message: "nume obligatoriu" });

  //creeaza grup si il asociaza organizatorului
  const group = await prisma.eventGroup.create({
    data: { name, description: description || null, ownerId: userId },
  });

  res.status(201).json(group);
});

// returneaza un grup si even lui
router.get("/:id", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  //cauta grupul daca apartine utilizatorului
  const group = await prisma.eventGroup.findFirst({
    where: { id, ownerId: userId },
    include: { events: { orderBy: { startTime: "asc" } } },
  });

  if (!group) return res.status(404).json({ message: "Grupul nu a fost gasit" });
  res.json(group);
});


//actualizeaza datele unui grup
router.put("/:id", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  const { name, description } = req.body || {};

  //verf daca grupul exista si apartine utilizatorului
  const existing = await prisma.eventGroup.findFirst({ where: { id, ownerId: userId } });
  if (!existing) return res.status(404).json({ message: "Group not found" });

  //actualizeaza doar campurile trimise
  const updated = await prisma.eventGroup.update({
    where: { id },
    data: { name: name ?? existing.name, description: description ?? existing.description },
  });

  res.json(updated);
});


//sterge un grup
router.delete("/:id", async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  //verf existenta si permisiunile
  const existing = await prisma.eventGroup.findFirst({ where: { id, ownerId: userId } });
  if (!existing) return res.status(404).json({ message: "Group not found" });

  //sterge grupul
  await prisma.eventGroup.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
