import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signToken } from "../middleware/auth.js";

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function register(req, res, next) {
  try {
    const { firstName, lastName, phone, email, password, wilaya, commune, address } = req.validated.body;
    const exists = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (exists) return res.status(409).json({ message: "Un compte existe déjà avec ce téléphone/email" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, phone, email: email || null, passwordHash, wilaya, commune, address },
    });
    const token = signToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 864e5 });
    res.status(201).json({ user: publicUser(user), token });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.validated.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user || !user.passwordHash || !user.isActive)
      return res.status(401).json({ message: "Identifiants incorrects" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Identifiants incorrects" });
    const token = signToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 864e5 });
    res.json({ user: publicUser(user), token });
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
}

export async function logout(_req, res) {
  res.clearCookie("token");
  res.json({ message: "Déconnexion réussie" });
}
