import { prisma } from "../config/prisma.js";
import { slugify } from "../utils/helpers.js";

const include = { images: { orderBy: { sortOrder: "asc" } }, variants: true, category: true };

export async function listProducts(req, res, next) {
  try {
    const { q = "", category = "", sort = "new", min, max, isNew, isPromo, featured, page = "1", limit = "12", active = "true" } = req.query;
    const where = {};
    if (active === "true") where.isActive = true;
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
    if (category) where.category = { slug: category };
    if (isNew === "true") where.isNew = true;
    if (isPromo === "true") where.isPromo = true;
    if (featured === "true") where.isFeatured = true;
    if (min || max) where.price = { ...(min ? { gte: Number(min) * 100 } : {}), ...(max ? { lte: Number(max) * 100 } : {}) };
    const orderBy =
      sort === "price-asc" ? { price: "asc" } :
      sort === "price-desc" ? { price: "desc" } :
      sort === "name" ? { name: "asc" } : { createdAt: "desc" };
    const p = Math.max(1, Number(page)), l = Math.min(48, Math.max(1, Number(limit)));
    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, include, orderBy, skip: (p - 1) * l, take: l }),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) { next(e); }
}

export async function getProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug }, include });
    if (!product) return res.status(404).json({ message: "Produit introuvable" });
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, NOT: { id: product.id }, isActive: true },
      include: { images: { take: 1 } },
      take: 4,
    });
    res.json({ product, related });
  } catch (e) { next(e); }
}

export async function createProduct(req, res, next) {
  try {
    const b = req.validated.body;
    let slug = slugify(b.name);
    if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    const product = await prisma.product.create({
      data: {
        name: b.name, slug, description: b.description, price: b.price,
        oldPrice: b.oldPrice ?? null, stock: b.stock, categoryId: b.categoryId || null,
        isNew: b.isNew, isPromo: b.isPromo, isActive: b.isActive, isFeatured: b.isFeatured,
        images: { create: b.images.map((im, i) => ({ url: im.url, alt: im.alt || b.name, sortOrder: i })) },
        variants: { create: b.variants },
      },
      include,
    });
    res.status(201).json({ product });
  } catch (e) { next(e); }
}

export async function updateProduct(req, res, next) {
  try {
    const b = req.validated.body;
    const { images, variants, ...rest } = b;
    await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
    await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...rest, categoryId: rest.categoryId || null, oldPrice: rest.oldPrice ?? null,
        images: { create: (images || []).map((im, i) => ({ url: im.url, alt: im.alt || rest.name, sortOrder: i })) },
        variants: { create: variants || [] },
      },
      include,
    });
    res.json({ product });
  } catch (e) { next(e); }
}

export async function deleteProduct(req, res, next) {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Produit supprimé" });
  } catch (e) { next(e); }
}
