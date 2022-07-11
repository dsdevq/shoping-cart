import React, { createContext, ReactNode, useContext, useState } from 'react'
import { ShoppingCart } from '../components/ShoppingCart'
import { useLocalStorage } from '../hooks/useLocalStorage'
type ShoppingCartProviderProps = {
  children: ReactNode
}

type ShoppingCartContext = {
  openCart: () => void
  closeCart: () => void
  getItemQuantity: (id: number) => number
  increaseCartQuantity: (id: number) => void
  decreaseCartQuantity: (id: number) => void
  removeFromCart: (id: number) => void
  cartQuantity: number
  cartItems: CartItem[]
}


type CartItem = {
  id: number,
  quantity: number
}

const ShoppingCartContext = createContext({} as ShoppingCartContext)

export function useShoppingCart() {
  return useContext(ShoppingCartContext)
}


export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {

  const [isOpen, setIsOpen] = useState(false)
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('shopping-cart', [])

  const cartQuantity = cartItems.reduce(
    (quantity, item) => item.quantity + quantity, 0
  )

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  // is item ==> item.id === id, then return item.quantity, or 0
  const getItemQuantity = (id: number) => {
    return cartItems.find(item => item.id === id)?.quantity || 0
  }

  const increaseCartQuantity = (id: number) => {
    setCartItems(currItems => {
      // If we dont have this item in array
      if (currItems.find(item => item.id === id) == null) {
        // Then we need to add it
        return [...currItems, { id, quantity: 1 }]
      }
      else {
        // If item exists
        return currItems.map((item) => {
          if (item.id === id) {
            // Return old item, but increment quantity
            return { ...item, quantity: item.quantity + 1 }
          }
          else {
            // or just return item
            return item
          }
        })
      }
    })
  }

  const decreaseCartQuantity = (id: number) => {
    setCartItems(currItems => {
      // If item quantity is just 1
      if (currItems.find(item => item.id === id)?.quantity === 1) {
        // Then remove this item by using filter
        return currItems.filter((item) => item.id !== id)
      }
      else {
        // Or if its > 1
        return currItems.map((item) => {
          if (item.id === id) {
            // Return old item, but decrement quantity
            return { ...item, quantity: item.quantity - 1 }
          }
          else {
            // or just return item
            return item
          }
        })
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCartItems(currentItems => {
      return currentItems.filter(item => item.id !== id)
    })
  }


  return (
    <ShoppingCartContext.Provider
      value={{
        increaseCartQuantity,
        decreaseCartQuantity,
        getItemQuantity,
        removeFromCart,
        cartItems,
        cartQuantity,
        openCart,
        closeCart
      }}>
      {children}
      <ShoppingCart isOpen={isOpen} />
    </ShoppingCartContext.Provider>

  )
}
