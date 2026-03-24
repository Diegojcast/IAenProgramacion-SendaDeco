"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Product, CartItem, Order } from "@/types"

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string, color: Product["color"]) => void
  updateQuantity: (productId: string, color: Product["color"], quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  currentOrder: Order | null
  setCurrentOrder: (order: Order | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.color === product.color
      )
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.color === product.color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: string, color: Product["color"]) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.color === color))
    )
  }, [])

  const updateQuantity = useCallback(
    (productId: string, color: Product["color"], quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, color)
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === productId && item.color === color ? { ...item, quantity } : item
        )
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        currentOrder,
        setCurrentOrder
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
