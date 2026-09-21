export function slugify(str = "") {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function nextOrderNumber(date = new Date()) {
  const y = date.getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CK-${y}-${rand}`;
}

export const toDA = (centimes) => (centimes / 100).toFixed(0);
