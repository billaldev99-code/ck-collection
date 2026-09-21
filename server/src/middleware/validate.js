export function validate(schema) {
  return (req, res, next) => {
    const r = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!r.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: r.error.flatten().fieldErrors,
      });
    }
    req.validated = r.data;
    next();
  };
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Erreur serveur",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
}

export function notFound(_req, res) {
  res.status(404).json({ message: "Ressource introuvable" });
}
