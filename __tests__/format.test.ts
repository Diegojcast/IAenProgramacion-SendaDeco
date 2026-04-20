import { formatPrice } from "@/lib/format"

describe("formatPrice", () => {
  it("formatea un precio entero en pesos ARS", () => {
    const result = formatPrice(5000)
    expect(result).toContain("5.000")
    expect(result.startsWith("$")).toBe(true)
  })

  it("formatea precio de 0", () => {
    const result = formatPrice(0)
    expect(result).toBe("$0")
  })

  it("usa separador de miles (punto en es-AR)", () => {
    expect(formatPrice(1000000)).toContain("1.000.000")
  })

  it("precio pequeño sin separador de miles", () => {
    const result = formatPrice(500)
    expect(result).toBe("$500")
  })

  it("número negativo no rompe la función", () => {
    const result = formatPrice(-1000)
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })
})
