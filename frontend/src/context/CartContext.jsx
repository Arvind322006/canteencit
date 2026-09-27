import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('canteen_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSlot, setSelectedSlot] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('canteen_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (foodItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.food_id === foodItem.id);
      if (existing) {
        return prev.map(item =>
          item.food_id === foodItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        food_id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        image_url: foodItem.image_url,
        prep_time: foodItem.prep_time,
        is_veg: foodItem.is_veg,
        quantity: 1
      }];
    });
  };

  const updateQuantity = (foodId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.food_id === foodId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (foodId) => {
    setCart(prev => prev.filter(item => item.food_id !== foodId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedSlot('');
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItemsCount,
      subtotal,
      selectedSlot,
      setSelectedSlot,
      cartDrawerOpen,
      setCartDrawerOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
