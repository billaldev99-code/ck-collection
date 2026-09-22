import { Router } from "express";
import { authRequired, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as A from "../controllers/authController.js";
import * as P from "../controllers/productController.js";
import * as S from "../controllers/shopController.js";
import { registerSchema, loginSchema, categorySchema, productSchema, orderSchema, statusSchema, contactSchema } from "../utils/schemas.js";

import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
function optionalAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : req.cookies?.token;
  if (!token) return next();
  try { req.user = jwt.verify(token, config.jwtSecret); } catch { /* invitée */ }
  next();
}

const r = Router();

// Auth
r.post("/auth/register", validate(registerSchema), A.register);
r.post("/auth/login", validate(loginSchema), A.login);
r.post("/auth/logout", A.logout);
r.get("/auth/me", authRequired, A.me);

// Catalogue public
r.get("/products", P.listProducts);
r.get("/products/:slug", P.getProduct);
r.get("/categories", S.listCategories);
r.post("/contact", validate(contactSchema), S.createContact);
r.post("/orders", optionalAuth, validate(orderSchema), S.createOrder);

// Admin
const admin = [authRequired, requireRoles("ADMIN", "SUPER_ADMIN", "OPERATOR")];
r.post("/products", ...admin, validate(productSchema), P.createProduct);
r.put("/products/:id", ...admin, validate(productSchema), P.updateProduct);
r.delete("/products/:id", ...admin, P.deleteProduct);
r.post("/categories", ...admin, validate(categorySchema), S.createCategory);
r.put("/categories/:id", ...admin, validate(categorySchema), S.updateCategory);
r.delete("/categories/:id", ...admin, S.deleteCategory);
r.get("/orders", authRequired, S.listOrders);
r.get("/orders/:id", authRequired, S.getOrder);
r.put("/orders/:id/status", ...admin, validate(statusSchema), S.setOrderStatus);
r.delete("/orders/:id", ...admin, S.deleteOrder);
r.get("/stats", ...admin, S.stats);
r.get("/users", ...admin, S.listUsers);
r.get("/contacts", ...admin, S.listContacts);
r.delete("/contacts/:id", ...admin, S.deleteContact);

export default r;
