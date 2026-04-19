import { Resend } from "resend"
import { prisma } from "@/lib/db/prisma"
import type { Order } from "@/types"
import { formatPrice } from "@/lib/data"

const FROM = process.env.EMAIL_FROM ?? "Senda Deco <noreply@sendadeco.com>"
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

function buildHtml(order: Order): string {
  const adminUrl = `${APP_URL}/admin/orders`

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece8;font-size:14px;color:#3d3530;">
          ${item.name}${item.selectedColor ? ` <span style="color:#9c8e87;">(${item.selectedColor})</span>` : ""}
          &nbsp;&times;${item.quantity}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ece8;font-size:14px;color:#3d3530;text-align:right;white-space:nowrap;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo pedido recibido</title>
</head>
<body style="margin:0;padding:0;background:#faf8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ece8e3;">
          <!-- Header -->
          <tr>
            <td style="background:#3d3530;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;color:#c4b8b0;">Senda Deco · Panel Admin</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 6px;font-size:20px;font-weight:600;color:#3d3530;">Nuevo pedido recibido</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#9c8e87;">
                De: <strong style="color:#3d3530;">${order.customer.nombre}</strong>
                &nbsp;·&nbsp;
                <a href="mailto:${order.customer.email}" style="color:#9c8e87;">${order.customer.email}</a>
              </p>

              <p style="margin:0 0 16px;font-size:13px;color:#9c8e87;">
                Orden <strong style="color:#3d3530;">#${order.id}</strong>
                &nbsp;·&nbsp;
                Entrega: <strong style="color:#3d3530;">${order.deliveryMethod === "envio" ? "Envío a domicilio" : "Retiro en persona"}</strong>
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <thead>
                  <tr>
                    <th style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9c8e87;text-align:left;font-weight:500;">Producto</th>
                    <th style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9c8e87;text-align:right;font-weight:500;">Precio</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:600;color:#3d3530;border-top:2px solid #ece8e3;">Total</td>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:600;color:#3d3530;text-align:right;border-top:2px solid #ece8e3;white-space:nowrap;">${formatPrice(order.total)}</td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${adminUrl}"
                 style="display:block;text-align:center;background:#3d3530;color:#faf8f6;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">
                Ver en el panel de admin
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 40px;text-align:center;background:#faf8f6;border-top:1px solid #ece8e3;">
              <p style="margin:0;font-size:12px;color:#c4b8b0;">Este mensaje es solo para uso interno.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendAdminOrderNotification(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[email:admin] RESEND_API_KEY not set — skipping admin notification")
    return
  }

  // Fetch all admin worker emails
  const admins = await prisma.worker.findMany({
    where: { isAdmin: true },
    select: { email: true, firstName: true },
  })

  if (admins.length === 0) {
    console.log("[email:admin] No admin workers found — skipping notification")
    return
  }

  const resend = new Resend(apiKey)
  const emails = admins.map((a) => a.email).filter((e) => typeof e === "string" && e.includes("@"))

  if (emails.length === 0) {
    console.warn("[email:admin] No valid email addresses found — skipping")
    return
  }

  try {
    // Send individually so a failure for one recipient doesn't block others
    for (const email of emails) {
      const result = await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Nuevo pedido recibido #${order.id} — Senda Deco`,
        html: buildHtml(order),
      })
      if (result.error) {
        console.error(`[email:admin] Resend error for ${email}:`, JSON.stringify(result.error))
      } else {
        console.log(`[email:admin] Sent to ${email}, id:`, result.data?.id)
      }
    }
  } catch (err) {
    console.error("[email:admin] Unexpected exception:", err)
  }
}
