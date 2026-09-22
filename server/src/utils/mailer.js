import nodemailer from "nodemailer";

let transporter = null;

export function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

const da = (c) => new Intl.NumberFormat("fr-DZ").format(Math.round(c / 100)) + " DA";

function renderEmailLayout({ badge, title, greeting, message, order, extraNotice }) {
  const itemsHtml = (order.items || [])
    .map(
      (i) => `
      <tr style="border-bottom:1px solid #EDDDD3;">
        <td style="padding:10px 0;vertical-align:middle;">
          <strong style="color:#2A2321;font-size:14px;">${i.productName}</strong>
          ${i.size ? `<br><span style="color:#7A6A65;font-size:12px;">Taille : ${i.size}</span>` : ""}
          ${i.color ? `<span style="color:#7A6A65;font-size:12px;"> | Couleur : ${i.color}</span>` : ""}
        </td>
        <td style="padding:10px 0;text-align:center;color:#2A2321;font-size:14px;vertical-align:middle;">× ${i.quantity}</td>
        <td style="padding:10px 0;text-align:right;color:#A8616A;font-weight:bold;font-size:14px;vertical-align:middle;">${da(i.lineTotal)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background-color:#FDF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2A2321;">
  <div style="max-width:580px;margin:0 auto;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #EDDDD3;box-shadow:0 8px 24px rgba(42,35,33,0.06);">
    
    <!-- En-tête -->
    <div style="background:linear-gradient(135deg, #A8616A 0%, #8E4A53 100%);padding:28px 24px;text-align:center;color:#FFFFFF;">
      <h1 style="margin:0;font-size:24px;letter-spacing:1px;font-weight:700;">C-K-Collection</h1>
      <p style="margin:6px 0 0 0;font-size:13px;opacity:0.9;font-style:italic;">Découvrez votre style</p>
    </div>

    <!-- Contenu -->
    <div style="padding:28px 24px;">
      
      <div style="text-align:center;margin-bottom:20px;">
        ${badge ? `<span style="display:inline-block;background:${badge.bg};color:${badge.color};padding:4px 14px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:10px;">${badge.label}</span>` : ""}
        <h2 style="margin:6px 0;color:#2A2321;font-size:20px;">${title}</h2>
        <p style="margin:0;color:#7A6A65;font-size:14px;">Commande N° <strong style="color:#A8616A;">${order.orderNumber}</strong></p>
      </div>

      <p style="font-size:15px;line-height:1.6;color:#2A2321;margin:16px 0;">
        ${greeting || `Bonjour <strong>${order.firstName}</strong>,`}<br><br>
        ${message}
      </p>

      <!-- Récapitulatif articles -->
      <div style="margin:24px 0;background:#FAF5F0;border-radius:12px;padding:16px 18px;border:1px solid #EDDDD3;">
        <h3 style="margin:0 0 12px 0;font-size:14px;color:#A8616A;text-transform:uppercase;letter-spacing:0.5px;">Articles commandés</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${itemsHtml}
        </table>

        <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #EDDDD3;font-size:13px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="color:#7A6A65;padding:3px 0;">Sous-total</td>
              <td style="text-align:right;font-weight:600;color:#2A2321;">${da(order.subtotal)}</td>
            </tr>
            <tr>
              <td style="color:#7A6A65;padding:3px 0;">Livraison (${order.wilaya})</td>
              <td style="text-align:right;font-weight:600;color:#2A2321;">${da(order.shippingFee)}</td>
            </tr>
            <tr style="border-top:1px solid #EDDDD3;">
              <td style="padding:8px 0 0 0;font-size:15px;font-weight:bold;color:#2A2321;">Total (paiement à la livraison)</td>
              <td style="padding:8px 0 0 0;text-align:right;font-size:16px;font-weight:bold;color:#A8616A;">${da(order.total)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Adresse -->
      <div style="background:#FFFFFF;border-radius:12px;padding:16px 18px;border:1px solid #EDDDD3;margin-bottom:20px;">
        <h3 style="margin:0 0 10px 0;font-size:13px;color:#7A6A65;text-transform:uppercase;letter-spacing:0.5px;">Adresse de livraison</h3>
        <p style="margin:0;font-size:14px;line-height:1.5;color:#2A2321;">
          <strong>${order.firstName} ${order.lastName}</strong><br>
          ${order.address}<br>
          ${order.commune}, ${order.wilaya}<br>
          📞 Téléphone : <strong>${order.phone}</strong>
        </p>
      </div>

      ${extraNotice ? `<div style="font-size:13px;color:#4A3F3B;line-height:1.5;margin:16px 0;background:#F0F4F8;padding:12px 14px;border-radius:8px;border-left:4px solid #A8616A;">${extraNotice}</div>` : ""}

      <p style="font-size:14px;color:#7A6A65;margin:24px 0 0 0;text-align:center;">
        Merci pour votre confiance ♥<br>
        <strong style="color:#2A2321;">L'équipe C-K-Collection</strong>
      </p>

    </div>

    <!-- Pied de page -->
    <div style="background:#FAF5F0;padding:16px 24px;text-align:center;border-top:1px solid #EDDDD3;font-size:12px;color:#7A6A65;">
      <p style="margin:0 0 4px 0;">Des questions ? Répondez simplement à cet email.</p>
      <p style="margin:0;">Instagram : <a href="https://www.instagram.com/c_k.collection__/" style="color:#A8616A;text-decoration:none;font-weight:bold;">@c_k.collection__</a></p>
    </div>

  </div>
</body>
</html>`;
}

async function sendMailSafely({ to, subject, html }) {
  const t = getTransporter();
  if (!t || !to) return false;
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || `C-K-Collection <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (e) {
    console.error("[mail] Échec envoi email à", to, ":", e.message);
    return false;
  }
}

/** Email envoyé au client quand sa commande est confirmée par l'administrateur */
export async function sendOrderConfirmed(order) {
  if (!order?.email) return false;
  return sendMailSafely({
    to: order.email,
    subject: `C-K-Collection — Votre commande ${order.orderNumber} est confirmée ! ♥`,
    html: renderEmailLayout({
      badge: { bg: "#E8F5E9", color: "#1B5E20", label: "Commande Confirmée" },
      title: "Votre commande est confirmée !",
      greeting: `Bonjour <strong>${order.firstName}</strong>,`,
      message: "Excellente nouvelle ! Votre commande a été <strong>validée et confirmée</strong> par notre équipe. Nous préparons actuellement vos articles pour l'expédition.",
      extraNotice: `ℹ️ Notre livreur vous contactera au <strong>${order.phone}</strong> avant son passage. Merci de prévoir le montant exact de <strong>${da(order.total)}</strong> à la livraison.`,
      order,
    }),
  });
}

/** Email envoyé au client dès qu'il passe sa commande sur le site */
export async function sendOrderReceived(order) {
  if (!order?.email) return false;
  return sendMailSafely({
    to: order.email,
    subject: `C-K-Collection — Commande ${order.orderNumber} bien reçue ♥`,
    html: renderEmailLayout({
      badge: { bg: "#FFF3E0", color: "#E65100", label: "Commande Enregistrée" },
      title: "Commande bien enregistrée",
      greeting: `Merci <strong>${order.firstName}</strong> ♥`,
      message: "Nous avons bien reçu votre commande ! Notre équipe va la vérifier dans les plus brefs délais et vous contactera au <strong>${order.phone}</strong> pour confirmer les détails de livraison.",
      extraNotice: "ℹ️ Vous recevrez un nouvel email dès que votre commande sera officiellement confirmée par notre équipe.",
      order,
    }),
  });
}

/** Email envoyé quand le colis est expédié */
export async function sendOrderShipped(order) {
  if (!order?.email) return false;
  return sendMailSafely({
    to: order.email,
    subject: `C-K-Collection — Votre commande ${order.orderNumber} a été expédiée ! 📦`,
    html: renderEmailLayout({
      badge: { bg: "#E1F5FE", color: "#01579B", label: "Colis Expédié" },
      title: "Votre colis est en route !",
      greeting: `Bonjour <strong>${order.firstName}</strong>,`,
      message: `Votre colis a été expédié et est en cours d'acheminement vers <strong>${order.commune}, ${order.wilaya}</strong>.`,
      extraNotice: `📦 Le livreur vous appellera au <strong>${order.phone}</strong> pour la remise en main propre. Total à régler : <strong>${da(order.total)}</strong>.`,
      order,
    }),
  });
}

/** Email envoyé en cas d'annulation */
export async function sendOrderCancelled(order) {
  if (!order?.email) return false;
  return sendMailSafely({
    to: order.email,
    subject: `C-K-Collection — Commande ${order.orderNumber} annulée`,
    html: renderEmailLayout({
      badge: { bg: "#FFEBEE", color: "#B71C1C", label: "Commande Annulée" },
      title: "Votre commande a été annulée",
      greeting: `Bonjour <strong>${order.firstName}</strong>,`,
      message: `Votre commande N° <strong>${order.orderNumber}</strong> a été annulée. Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez reprogrammer votre achat, n'hésitez pas à nous contacter.`,
      order,
    }),
  });
}

/** Dispatcher selon le statut de la commande */
export async function sendOrderStatusEmail(order, newStatus) {
  switch (newStatus) {
    case "CONFIRMED":
      return sendOrderConfirmed(order);
    case "SHIPPED":
      return sendOrderShipped(order);
    case "CANCELLED":
      return sendOrderCancelled(order);
    default:
      return false;
  }
}

/** Rétro-compatibilité */
export const sendOrderConfirmation = sendOrderReceived;

/** Notification envoyée à l'administrateur quand un client envoie un message de contact */
export async function sendAdminContactNotification(contact) {
  const adminEmail = process.env.SMTP_USER || process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return sendMailSafely({
    to: adminEmail,
    subject: `Nouveau message de contact de ${contact.name} — C-K-Collection`,
    html: `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2A2321;padding:20px;background:#FDF7F1;margin:0;">
  <div style="max-width:540px;margin:auto;background:#FFFFFF;border-radius:14px;padding:24px;border:1px solid #EDDDD3;">
    <h2 style="color:#A8616A;margin-top:0;">Nouveau message de contact ♥</h2>
    <p><strong>Nom :</strong> ${contact.name}</p>
    <p><strong>Téléphone :</strong> ${contact.phone ? `<a href="tel:${contact.phone}" style="color:#A8616A;font-weight:bold;">${contact.phone}</a>` : '<span style="color:#8A7A75;">Non renseigné</span>'}</p>
    <div style="background:#FAF5F0;border-left:4px solid #A8616A;padding:14px 16px;border-radius:8px;margin:16px 0;">
      <p style="margin:0;font-size:15px;line-height:1.5;white-space:pre-wrap;">${contact.message}</p>
    </div>
    <p style="color:#8A7A75;font-size:12px;margin-bottom:0;">Message envoyé depuis la page Contact de votre site.</p>
  </div>
</body>
</html>`,
  });
}
