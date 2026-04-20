import { checkoutFormSchema, CHECKOUT_SHIPPING_ARS } from "@/lib/checkout-schema"

// ─── Helpers ────────────────────────────────────────────────────────────────

const baseRetiro = {
  nombre: "Diego Castaño",
  email: "diego@example.com",
  telefono: "1157257644",
  deliveryMethod: "retiro" as const,
  paymentMethod: "transferencia" as const,
}

const baseEnvio = {
  ...baseRetiro,
  deliveryMethod: "envio" as const,
  calle: "Av. Corrientes 1234",
  ciudad: "Buenos Aires",
  codigoPostal: "1043",
}

function parseValid(data: unknown) {
  return checkoutFormSchema.safeParse(data)
}

function getErrors(data: unknown): Record<string, string> {
  const result = checkoutFormSchema.safeParse(data)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((i) => [i.path.join("."), i.message])
  )
}

// ─── CHECKOUT_SHIPPING_ARS ──────────────────────────────────────────────────

describe("CHECKOUT_SHIPPING_ARS", () => {
  it("es un número positivo", () => {
    expect(CHECKOUT_SHIPPING_ARS).toBeGreaterThan(0)
    expect(typeof CHECKOUT_SHIPPING_ARS).toBe("number")
  })
})

// ─── nombre ─────────────────────────────────────────────────────────────────

describe("campo nombre", () => {
  it("acepta nombre válido", () => {
    expect(parseValid(baseRetiro).success).toBe(true)
  })

  it("rechaza menos de 2 caracteres", () => {
    const errors = getErrors({ ...baseRetiro, nombre: "A" })
    expect(errors.nombre).toMatch(/2/)
  })

  it("rechaza nombre vacío", () => {
    const errors = getErrors({ ...baseRetiro, nombre: "" })
    expect(errors.nombre).toBeDefined()
  })

  it("rechaza nombre mayor a 120 caracteres", () => {
    const errors = getErrors({ ...baseRetiro, nombre: "A".repeat(121) })
    expect(errors.nombre).toBeDefined()
  })

  it("acepta nombre de exactamente 2 caracteres", () => {
    expect(parseValid({ ...baseRetiro, nombre: "AB" }).success).toBe(true)
  })

  it("acepta nombre de exactamente 120 caracteres", () => {
    expect(parseValid({ ...baseRetiro, nombre: "A".repeat(120) }).success).toBe(true)
  })

  it("hace trim antes de validar", () => {
    expect(parseValid({ ...baseRetiro, nombre: "  AB  " }).success).toBe(true)
  })
})

// ─── email ───────────────────────────────────────────────────────────────────

describe("campo email", () => {
  it("acepta email válido", () => {
    expect(parseValid(baseRetiro).success).toBe(true)
  })

  it("rechaza email sin @", () => {
    const errors = getErrors({ ...baseRetiro, email: "nodomain" })
    expect(errors.email).toBeDefined()
  })

  it("rechaza email sin dominio", () => {
    const errors = getErrors({ ...baseRetiro, email: "user@" })
    expect(errors.email).toBeDefined()
  })

  it("rechaza string vacío", () => {
    const errors = getErrors({ ...baseRetiro, email: "" })
    expect(errors.email).toBeDefined()
  })

  it("acepta email con subdominios", () => {
    expect(parseValid({ ...baseRetiro, email: "user@mail.sub.com" }).success).toBe(true)
  })
})

// ─── telefono ────────────────────────────────────────────────────────────────

describe("campo telefono", () => {
  it("acepta teléfono numérico válido", () => {
    expect(parseValid(baseRetiro).success).toBe(true)
  })

  it("acepta teléfono con +, espacios, guiones y paréntesis", () => {
    expect(parseValid({ ...baseRetiro, telefono: "+54 9 (11) 5725-7644" }).success).toBe(true)
  })

  it("rechaza teléfono menor a 8 caracteres", () => {
    const errors = getErrors({ ...baseRetiro, telefono: "1234567" })
    expect(errors.telefono).toBeDefined()
  })

  it("rechaza teléfono mayor a 25 caracteres", () => {
    const errors = getErrors({ ...baseRetiro, telefono: "1".repeat(26) })
    expect(errors.telefono).toBeDefined()
  })

  it("rechaza letras en el teléfono", () => {
    const errors = getErrors({ ...baseRetiro, telefono: "1155abc7644" })
    expect(errors.telefono).toMatch(/números/)
  })

  it("acepta exactamente 8 caracteres", () => {
    expect(parseValid({ ...baseRetiro, telefono: "12345678" }).success).toBe(true)
  })
})

// ─── deliveryMethod ──────────────────────────────────────────────────────────

describe("campo deliveryMethod", () => {
  it("acepta 'envio'", () => {
    expect(parseValid(baseEnvio).success).toBe(true)
  })

  it("acepta 'retiro'", () => {
    expect(parseValid(baseRetiro).success).toBe(true)
  })

  it("rechaza valor no permitido", () => {
    const errors = getErrors({ ...baseRetiro, deliveryMethod: "drone" })
    expect(errors.deliveryMethod).toBeDefined()
  })
})

// ─── paymentMethod ───────────────────────────────────────────────────────────

describe("campo paymentMethod", () => {
  it("acepta 'transferencia'", () => {
    expect(parseValid({ ...baseRetiro, paymentMethod: "transferencia" }).success).toBe(true)
  })

  it("acepta 'efectivo'", () => {
    expect(parseValid({ ...baseRetiro, paymentMethod: "efectivo" }).success).toBe(true)
  })

  it("rechaza valor no permitido", () => {
    const errors = getErrors({ ...baseRetiro, paymentMethod: "cripto" })
    expect(errors.paymentMethod).toBeDefined()
  })
})

// ─── validaciones condicionales: envío a domicilio ───────────────────────────

describe("validaciones para deliveryMethod=envio", () => {
  it("acepta datos completos de envío", () => {
    expect(parseValid(baseEnvio).success).toBe(true)
  })

  it("rechaza calle vacía en envío", () => {
    const errors = getErrors({ ...baseEnvio, calle: "" })
    expect(errors.calle).toMatch(/obligatoria/)
  })

  it("rechaza calle ausente en envío", () => {
    const data = { ...baseEnvio }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (data as any).calle
    const errors = getErrors(data)
    expect(errors.calle).toBeDefined()
  })

  it("rechaza calle de menos de 3 caracteres en envío", () => {
    const errors = getErrors({ ...baseEnvio, calle: "AB" })
    expect(errors.calle).toMatch(/completa/)
  })

  it("rechaza ciudad vacía en envío", () => {
    const errors = getErrors({ ...baseEnvio, ciudad: "" })
    expect(errors.ciudad).toBeDefined()
  })

  it("rechaza ciudad de menos de 2 caracteres", () => {
    const errors = getErrors({ ...baseEnvio, ciudad: "A" })
    expect(errors.ciudad).toBeDefined()
  })

  it("rechaza codigoPostal vacío en envío", () => {
    const errors = getErrors({ ...baseEnvio, codigoPostal: "" })
    expect(errors.codigoPostal).toBeDefined()
  })

  it("rechaza codigoPostal menor a 3 caracteres", () => {
    const errors = getErrors({ ...baseEnvio, codigoPostal: "AB" })
    expect(errors.codigoPostal).toMatch(/inválido/)
  })

  it("rechaza codigoPostal mayor a 10 caracteres", () => {
    const errors = getErrors({ ...baseEnvio, codigoPostal: "A".repeat(11) })
    expect(errors.codigoPostal).toMatch(/inválido/)
  })

  it("en retiro, calle/ciudad/CP son opcionales", () => {
    const result = parseValid({ ...baseRetiro })
    expect(result.success).toBe(true)
  })

  it("en retiro, campos de dirección son ignorados si están presentes", () => {
    const result = parseValid({ ...baseRetiro, calle: "", ciudad: "", codigoPostal: "" })
    expect(result.success).toBe(true)
  })
})
