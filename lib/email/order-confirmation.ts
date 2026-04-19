import { Resend } from "resend"
import type { Order } from "@/types"
import { formatPrice } from "@/lib/data"

const FROM = process.env.EMAIL_FROM ?? "Senda Deco <noreply@sendadeco.com>"
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

function buildHtml(order: Order): string {
  const trackingUrl = `${APP_URL}/seguimiento?order=${order.id}`

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
  <title>Confirmación de pedido</title>
</head>
<body style="margin:0;padding:0;background:#faf8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ece8e3;">
          <!-- Header -->
          <tr>
            <td style="background:#3d3530;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:500;color:#faf8f6;letter-spacing:0.04em;">Senda Deco</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#3d3530;">Tu pedido fue confirmado</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#9c8e87;">Hola ${order.customer.nombre}, gracias por tu compra.</p>

              <!-- Order ID -->
              <p style="margin:0 0 20px;font-size:13px;color:#9c8e87;">
                Número de orden: <span style="color:#3d3530;font-weight:500;">#${order.id}</span>
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <thead>
                  <tr>
                    <th style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9c8e87;text-align:left;font-weight:500;">Producto</th>
                    <th style="padding:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9c8e87;text-align:right;font-weight:500;">Precio</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:600;color:#3d3530;border-top:2px solid #ece8e3;">Total</td>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:600;color:#3d3530;text-align:right;border-top:2px solid #ece8e3;white-space:nowrap;">${formatPrice(order.total)}</td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="${trackingUrl}"
                 style="display:block;text-align:center;background:#3d3530;color:#faf8f6;text-decoration:none;padding:14px 24px;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:0.02em;">
                Seguir mi pedido
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;background:#faf8f6;border-top:1px solid #ece8e3;">
              <p style="margin:0;font-size:12px;color:#c4b8b0;">© ${new Date().getFullYear()} Senda Deco. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation email")
    return
  }

  const resend = new Resend(apiKey)

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: order.customer.email,
      subject: `Confirmación de pedido #${order.id} — Senda Deco`,
      html: buildHtml(order),
    })

    if (result.error) {
      console.error("[email] Failed to send order confirmation:", JSON.stringify(result.error))
    }
  } catch (err) {
    console.error("[email] Unexpected exception while sending:", err)
  }
}
