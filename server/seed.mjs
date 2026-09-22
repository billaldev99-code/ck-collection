import { webcrypto } from "crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto;
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: new URL("../.env", import.meta.url) }); // racine projet
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CATS = [
  { name: "Robes", description: "Robes chic & casual", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" },
  { name: "Ensembles", description: "Ensembles modernes", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop" },
  { name: "Pyjamas", description: "Douceur & confort", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" },
  { name: "Nouveautés", description: "Les dernières pièces", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" },
];

const PRODUCTS = [
  ["Ensemble Élégance", "Ensembles", 590000, true, "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"],
  ["Robe Satinée", "Robes", 450000, true, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop"],
  ["Pyjama Douceur", "Pyjamas", 290000, true, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"],
  ["Ensemble Casual", "Ensembles", 390000, false, "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop"],
  ["Robe Chic", "Robes", 520000, false, "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop"],
  ["Tenue Moderne", "Nouveautés", 480000, true, "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop"],
];

async function main() {
  console.log("Seed C-K-Collection...");
  for (const [i, c] of CATS.entries()) {
    await prisma.category.upsert({ where: { slug: slug(c.name) }, update: {}, create: { ...c, slug: slug(c.name), sortOrder: i } });
  }
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 10);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "billaldev99@gmail.com" },
    update: { role: "SUPER_ADMIN", passwordHash: hash },
    create: { email: process.env.ADMIN_EMAIL || "billaldev99@gmail.com", phone: "0791592880", firstName: "Billal", lastName: "Admin", passwordHash: hash, role: "SUPER_ADMIN" },
  });
  for (const [name, cat, price, isNew, img] of PRODUCTS) {
    const category = await prisma.category.findUnique({ where: { slug: slug(cat) } });
    await prisma.product.upsert({
      where: { slug: slug(name) },
      update: {},
      create: {
        name, slug: slug(name), price, stock: 20, isNew, isFeatured: isNew, isActive: true,
        description: `${name} — pièce C-K-Collection, coupe féminine et tissu de qualité.`,
        categoryId: category?.id,
        images: { create: [{ url: img, alt: name }] },
        variants: { create: ["XS", "S", "M", "L", "XL", "XXL"].map((size) => ({ size, stock: 10 })) },
      },
    });
  }
  console.log("Seed OK ♥");
}
main().finally(() => prisma.$disconnect());
