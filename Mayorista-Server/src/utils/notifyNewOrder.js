import sendEmail from "./sendEmail.js";

// Avisa por mail cuando entra un pedido nuevo.
// Destinatarios: variable ORDER_NOTIFY_EMAILS (separados por coma).
// Si no está definida, se usa MAIL_USER (la misma casilla que envía).
const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const buildOrderEmail = (order) => {
  const rows = (order.items || [])
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eadfce">${escapeHtml(i.title)}${i.brand ? ` <span style="color:#7d6b5a;font-size:12px">· ${escapeHtml(i.brand)}</span>` : ""}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eadfce;text-align:center">${Number(i.quantity)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eadfce;text-align:right">${money(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const count = (order.items || []).reduce((t, i) => t + Number(i.quantity || 0), 0);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#fbf6ee;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eadfce">
      <div style="background:#4a2a12;color:#fff;padding:20px 24px">
        <div style="font-size:13px;color:#f4b740;font-weight:bold">NUEVO PEDIDO</div>
        <div style="font-size:24px;font-weight:bold;margin-top:4px">${money(order.total)}</div>
        <div style="font-size:13px;opacity:.8">${count} ${count === 1 ? "producto" : "productos"} · #${String(order._id).slice(-5)}</div>
      </div>
      <div style="padding:20px 24px;color:#2b2118">
        <p style="margin:0 0 4px"><b>Cliente:</b> ${escapeHtml(order.name)} (${escapeHtml(order.email)})</p>
        <p style="margin:0 0 4px"><b>Entrega:</b> ${escapeHtml(order.address)}, ${escapeHtml(order.city)}</p>
        <p style="margin:0 0 16px"><b>Envío:</b> ${Number(order.shippingCost) > 0 ? money(order.shippingCost) : "Gratis"}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="color:#7d6b5a;font-size:12px;text-align:left">
              <th style="padding-bottom:6px">Producto</th>
              <th style="padding-bottom:6px;text-align:center">Cant.</th>
              <th style="padding-bottom:6px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;font-size:18px;font-weight:bold;margin:16px 0 0">Total: ${money(order.total)}</p>
        ${process.env.CLIENT_URL ? `<p style="text-align:center;margin:20px 0 0"><a href="${process.env.CLIENT_URL}/allOrders" style="background:#2f7d4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">Ver pedidos</a></p>` : ""}
      </div>
    </div>
  </div>`;
};

export const notifyNewOrder = async (order) => {
  const to = (process.env.ORDER_NOTIFY_EMAILS || process.env.MAIL_USER || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (to.length === 0 || !process.env.MAIL_PASS) {
    console.warn("⚠️ Aviso de pedido no enviado: faltan MAIL_USER/MAIL_PASS u ORDER_NOTIFY_EMAILS");
    return;
  }

  await sendEmail(
    to.join(","),
    `🛒 Nuevo pedido de ${order.name} · ${money(order.total)}`,
    buildOrderEmail(order)
  );
};
