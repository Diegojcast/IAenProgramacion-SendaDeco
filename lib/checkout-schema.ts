import { z } from "zod"

/** Costo fijo de envío (ARS) — sustituir por cálculo real si aplica. */
export const CHECKOUT_SHIPPING_ARS = 500

export const checkoutFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "Ingresá al menos 2 caracteres")
      .max(120, "Nombre demasiado largo"),
    email: z.string().trim().email("Ingresá un email válido"),
    telefono: z
      .string()
      .trim()
      .min(8, "Ingresá un teléfono válido")
      .max(25, "Teléfono demasiado largo")
      .regex(/^[\d\s+()\-]+$/, "Solo números y símbolos de teléfono"),
    calle: z.string().optional(),
    ciudad: z.string().optional(),
    codigoPostal: z.string().optional(),
    deliveryMethod: z.enum(["envio", "retiro"]),
    paymentMethod: z.enum(["mercadopago", "transferencia", "efectivo"]),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "envio") return

    if (!data.calle?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La calle es obligatoria para envío a domicilio",
        path: ["calle"],
      })
    } else if (data.calle.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresá una dirección más completa",
        path: ["calle"],
      })
    }

    if (!data.ciudad?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La ciudad es obligatoria para envío",
        path: ["ciudad"],
      })
    } else if (data.ciudad.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresá la ciudad",
        path: ["ciudad"],
      })
    }

    const cp = data.codigoPostal?.trim() ?? ""
    if (!cp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El código postal es obligatorio para envío",
        path: ["codigoPostal"],
      })
    } else if (cp.length < 3 || cp.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Código postal inválido",
        path: ["codigoPostal"],
      })
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
