import {
  resolveFulfillmentSnapshot,
  calculateProductDeliveryTime,
  calculateCartDeliveryTime,
  formatDeliveryRange,
  formatProductDeliveryLabel,
  formatCartDeliveryLabel,
} from "@/lib/delivery"
import type { Product, CartItem, FulfillmentSnapshot } from "@/types"

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    name: "Macramé Test",
    categories: ["macrame"],
    price: 5000,
    production_time: 48, // horas
    drying_time: 24,     // horas
    variants: [{ colorSlug: "crudo", stock: 0 }],
    description: "",
    featured: false,
    imageIds: [],
    ...overrides,
  }
}

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    ...makeProduct(),
    quantity: 1,
    selectedColor: "crudo",
    ...overrides,
  }
}

// ─── resolveFulfillmentSnapshot ──────────────────────────────────────────────

describe("resolveFulfillmentSnapshot", () => {
  it("usa el stock de variantes cuando no hay snapshot parcial", () => {
    const product = makeProduct({ variants: [{ colorSlug: "crudo", stock: 3 }] })
    const snapshot = resolveFulfillmentSnapshot(product)
    expect(snapshot.finishedStock).toBe(3)
    expect(snapshot.materialsAvailable).toBe(true)
    expect(snapshot.materialLeadDays).toBe(0)
  })

  it("suma el stock de todas las variantes", () => {
    const product = makeProduct({
      variants: [
        { colorSlug: "crudo", stock: 2 },
        { colorSlug: "gris", stock: 5 },
      ],
    })
    const snapshot = resolveFulfillmentSnapshot(product)
    expect(snapshot.finishedStock).toBe(7)
  })

  it("el snapshot parcial sobreescribe el stock calculado", () => {
    const product = makeProduct({ variants: [{ colorSlug: "crudo", stock: 10 }] })
    const snapshot = resolveFulfillmentSnapshot(product, { finishedStock: 0 })
    expect(snapshot.finishedStock).toBe(0)
  })

  it("nunca devuelve materialLeadDays negativo", () => {
    const product = makeProduct()
    const snapshot = resolveFulfillmentSnapshot(product, { materialLeadDays: -5 })
    expect(snapshot.materialLeadDays).toBe(0)
  })

  it("propaga requestedQuantity del snapshot parcial", () => {
    const product = makeProduct()
    const snapshot = resolveFulfillmentSnapshot(product, { requestedQuantity: 3 })
    expect(snapshot.requestedQuantity).toBe(3)
  })

  it("product sin variantes tiene finishedStock = 0", () => {
    const product = makeProduct({ variants: [] })
    const snapshot = resolveFulfillmentSnapshot(product)
    expect(snapshot.finishedStock).toBe(0)
  })
})

// ─── calculateProductDeliveryTime ───────────────────────────────────────────

describe("calculateProductDeliveryTime", () => {
  describe("cuando hay stock terminado", () => {
    it("retorna 1-3 días (stock inmediato)", () => {
      const product = makeProduct({ variants: [{ colorSlug: "crudo", stock: 5 }] })
      const result = calculateProductDeliveryTime(product)
      expect(result.minDays).toBe(1)
      expect(result.maxDays).toBe(3)
      expect(result.source).toBe("stock")
    })

    it("los materiales y pipeline no afectan el plazo cuando hay stock", () => {
      const product = makeProduct({
        variants: [{ colorSlug: "crudo", stock: 1 }],
        production_time: 240,
        drying_time: 96,
      })
      const result = calculateProductDeliveryTime(product, { materialsAvailable: false, materialLeadDays: 30 })
      expect(result.minDays).toBe(1)
      expect(result.maxDays).toBe(3)
      expect(result.materialDelayDays).toBe(0)
    })
  })

  describe("cuando NO hay stock terminado (made_to_order)", () => {
    it("calcula días redondeando hacia arriba (48+24 horas = 3 días)", () => {
      const product = makeProduct({
        variants: [{ colorSlug: "crudo", stock: 0 }],
        production_time: 48,
        drying_time: 24,
      })
      const result = calculateProductDeliveryTime(product)
      expect(result.minDays).toBe(3)
      expect(result.maxDays).toBe(3)
      expect(result.source).toBe("made_to_order")
    })

    it("redondea hacia arriba horas parciales (25 horas = 2 días)", () => {
      const product = makeProduct({
        variants: [],
        production_time: 25,
        drying_time: 0,
      })
      const result = calculateProductDeliveryTime(product)
      expect(result.minDays).toBe(2)
    })

    it("exactamente 24 horas = 1 día (sin redondeo extra)", () => {
      const product = makeProduct({ variants: [], production_time: 24, drying_time: 0 })
      const result = calculateProductDeliveryTime(product)
      expect(result.minDays).toBe(1)
    })

    it("0 horas de producción y secado = 0 días", () => {
      const product = makeProduct({ variants: [], production_time: 0, drying_time: 0 })
      const result = calculateProductDeliveryTime(product)
      expect(result.minDays).toBe(0)
      expect(result.maxDays).toBe(0)
    })

    it("suma materialLeadDays cuando materiales están disponibles", () => {
      const product = makeProduct({ variants: [], production_time: 24, drying_time: 0 })
      const result = calculateProductDeliveryTime(product, {
        materialsAvailable: true,
        materialLeadDays: 5,
      })
      expect(result.minDays).toBe(6) // 1 día pipeline + 5 días materiales
      expect(result.materialDelayDays).toBe(5)
    })

    it("suma materialLeadDays cuando materiales NO están disponibles", () => {
      const product = makeProduct({ variants: [], production_time: 24, drying_time: 0 })
      const result = calculateProductDeliveryTime(product, {
        materialsAvailable: false,
        materialLeadDays: 10,
      })
      expect(result.minDays).toBe(11) // 1 día pipeline + 10 días espera
    })

    it("sin materialLeadDays y materiales no disponibles usa el default (0 días extra)", () => {
      const product = makeProduct({ variants: [], production_time: 24, drying_time: 0 })
      const result = calculateProductDeliveryTime(product, {
        materialsAvailable: false,
        materialLeadDays: 0,
      })
      expect(result.minDays).toBe(1) // solo pipeline
    })
  })
})

// ─── calculateCartDeliveryTime ───────────────────────────────────────────────

describe("calculateCartDeliveryTime", () => {
  it("carrito vacío retorna 0-0", () => {
    const result = calculateCartDeliveryTime([])
    expect(result.minDays).toBe(0)
    expect(result.maxDays).toBe(0)
  })

  it("un solo ítem propaga su plazo directamente", () => {
    const item = makeCartItem({ variants: [], production_time: 48, drying_time: 0 })
    const result = calculateCartDeliveryTime([item])
    expect(result.minDays).toBe(2)
    expect(result.maxDays).toBe(2)
  })

  it("usa el mayor plazo entre múltiples ítems (max)", () => {
    const fast = makeCartItem({ variants: [{ colorSlug: "crudo", stock: 5 }] })
    const slow = makeCartItem({ variants: [], production_time: 120, drying_time: 0 })
    const result = calculateCartDeliveryTime([fast, slow])
    // fast: 1-3 (stock), slow: 5 días (120h)
    expect(result.minDays).toBe(5)
    expect(result.maxDays).toBe(5)
  })

  it("respeta quantity del CartItem a través del resolver", () => {
    const item = makeCartItem({ quantity: 3, variants: [], production_time: 24, drying_time: 0 })
    const result = calculateCartDeliveryTime([item])
    // La cantidad se propaga pero no multiplica días (es solo contextual)
    expect(result.minDays).toBe(1)
  })

  it("el resolver puede sobreescribir el snapshot de un ítem", () => {
    const item = makeCartItem({ variants: [], production_time: 48, drying_time: 0 })
    // Resolver dice que hay stock terminado → 1-3 días
    const result = calculateCartDeliveryTime([item], () => ({ finishedStock: 10 }))
    expect(result.minDays).toBe(1)
    expect(result.maxDays).toBe(3)
  })
})

// ─── formatDeliveryRange ────────────────────────────────────────────────────

describe("formatDeliveryRange", () => {
  it("0-0 retorna '0'", () => {
    expect(formatDeliveryRange(0, 0)).toBe("0")
  })

  it("mismo min y max retorna un solo número", () => {
    expect(formatDeliveryRange(7, 7)).toBe("7")
  })

  it("rango diferente retorna 'min-max'", () => {
    expect(formatDeliveryRange(1, 3)).toBe("1-3")
  })
})

// ─── formatProductDeliveryLabel ─────────────────────────────────────────────

describe("formatProductDeliveryLabel", () => {
  it("producto con stock retorna '1-3'", () => {
    const product = makeProduct({ variants: [{ colorSlug: "crudo", stock: 1 }] })
    expect(formatProductDeliveryLabel(product)).toBe("1-3")
  })

  it("producto sin stock retorna días de producción", () => {
    const product = makeProduct({ variants: [], production_time: 48, drying_time: 0 })
    expect(formatProductDeliveryLabel(product)).toBe("2")
  })
})

// ─── formatCartDeliveryLabel ────────────────────────────────────────────────

describe("formatCartDeliveryLabel", () => {
  it("carrito vacío retorna '0'", () => {
    expect(formatCartDeliveryLabel([])).toBe("0")
  })

  it("carrito con solo stock retorna '1-3'", () => {
    const items = [makeCartItem({ variants: [{ colorSlug: "crudo", stock: 2 }] })]
    expect(formatCartDeliveryLabel(items)).toBe("1-3")
  })
})
