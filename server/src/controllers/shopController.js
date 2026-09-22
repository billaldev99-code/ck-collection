import { prisma } from "../config/prisma.js";
import { slugify, nextOrderNumber } from "../utils/helpers.js";
import { sendOrderReceived, sendOrderStatusEmail, sendAdminContactNotification } from "../utils/mailer.js";

export async function listCategories(_req, res, next) {
  try {
    const items = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json({ items });
  } catch (e) { next(e); }
}

export async function createCategory(req, res, next) {
  try {
    const b = req.validated.body;
    let slug = slugify(b.name);
    if (await prisma.category.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    const item = await prisma.category.create({ data: { ...b, slug, image: b.image || null } });
    res.status(201).json({ category: item });
  } catch (e) { next(e); }
}

export async function updateCategory(req, res, next) {
  try {
    const item = await prisma.category.update({ where: { id: req.params.id }, data: { ...req.validated.body, image: req.validated.body.image || null } });
    res.json({ category: item });
  } catch (e) { next(e); }
}

export async function deleteCategory(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: "Catégorie supprimée" });
  } catch (e) { next(e); }
}

// ---- Orders ----
const WILAYA_FEES = { 16: 60000, 31: 80000 }; // centimes, défaut 50000
const feeFor = (wilaya) => WILAYA_FEES[Number.parseInt(String(wilaya), 10)] ?? 50000;

export async function createOrder(req, res, next) {
  try {
    const b = req.validated.body;
    const ids = b.items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true }, include: { images: { take: 1 } } });
    if (products.length !== ids.length) return res.status(400).json({ message: "Un produit est indisponible" });
    const map = Object.fromEntries(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const lines = b.items.map((i) => {
      const p = map[i.productId];
      const lineTotal = p.price * i.quantity;
      subtotal += lineTotal;
      return {
        productId: p.id, productName: p.name, productImage: p.images[0]?.url || null,
        size: i.size || null, color: i.color || null,
        unitPrice: p.price, quantity: i.quantity, lineTotal,
      };
    });
    const shippingFee = feeFor(b.wilaya);
    const total = subtotal + shippingFee;
    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber(), ...b, email: b.email?.trim() || null, items: undefined,
        subtotal, shippingFee, total,
        userId: req.user?.id || null,
        items: { create: lines },
      },
      include: { items: true },
    });
    res.status(201).json({ order });
    // Email de confirmation non-bloquant (si SMTP configuré + email renseigné)
    sendOrderReceived(order).catch(() => {});
  } catch (e) { next(e); }
}

export async function listOrders(req, res, next) {
  try {
    const { status = "", q = "", page = "1", limit = "15" } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) where.OR = [{ orderNumber: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { lastName: { contains: q, mode: "insensitive" } }];
    if (req.user?.role === "CUSTOMER") where.userId = req.user.id;
    const p = Math.max(1, Number(page)), l = Math.min(50, Number(limit));
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: "desc" }, skip: (p - 1) * l, take: l }),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) { next(e); }
}

export async function getOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!order) return res.status(404).json({ message: "Commande introuvable" });
    if (req.user?.role === "CUSTOMER" && order.userId !== req.user.id)
      return res.status(403).json({ message: "Accès refusé" });
    res.json({ order });
  } catch (e) { next(e); }
}

export async function setOrderStatus(req, res, next) {
  try {
    const existing = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: { status: true },
    });
    if (!existing) return res.status(404).json({ message: "Commande introuvable" });

    const newStatus = req.validated.body.status;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: newStatus },
      include: { items: true },
    });
    res.json({ order });

    // Notification client par email si le statut a changé (non bloquant)
    if (existing.status !== newStatus) {
      sendOrderStatusEmail(order, newStatus).catch((err) => {
        console.error("[mail] Échec notification statut:", err.message);
      });
    }
  } catch (e) { next(e); }
}

export async function deleteOrder(req, res, next) {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: "Commande supprimée" });
  } catch (e) { next(e); }
}

export async function stats(_req, res, next) {
  try {
    const [orders, products, users, revenue, byStatus] = await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] } } }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
    ]);
    res.json({ orders, products, customers: users, revenue: revenue._sum.total || 0, byStatus });
  } catch (e) { next(e); }
}

export async function listUsers(_req, res, next) {
  try {
    const items = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 100,
      include: { _count: { select: { orders: true } } },
    });
    res.json({ items: items.map(({ passwordHash, ...u }) => u) });
  } catch (e) { next(e); }
}

export async function createContact(req, res, next) {
  try {
    const msg = await prisma.contactMessage.create({ data: req.validated.body });
    res.status(201).json({ message: "Message envoyé, merci !", id: msg.id });
    sendAdminContactNotification(msg).catch((e) => console.error("[mail] contact notif err:", e.message));
  } catch (e) { next(e); }
}

export async function listContacts(_req, res, next) {
  try {
    const items = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    res.json({ items });
  } catch (e) { next(e); }
}

export async function deleteContact(req, res, next) {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ message: "Message supprimé" });
  } catch (e) { next(e); }
}
