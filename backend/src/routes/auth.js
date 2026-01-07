import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { env } from "../config/env.js";

const router = express.Router();


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: "Nume,email,parola obligatorii" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Mailul e deja utilizat" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash }, select: { id: true, name: true, email: true } });

  //generare JWT pentru autentificare viitoare
  const token = jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });
  res.json({ token, user });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email,parola obligatorii" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Date incorecte" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Date incorecte" });

  //daca validarile sunt ok, generam JWT
  const token = jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

export default router;
