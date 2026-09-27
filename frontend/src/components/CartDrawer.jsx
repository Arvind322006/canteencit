import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer({ onProceedCheckout }) {
  const { cart, cartDrawerOpen, setCartDrawerOpen, updateQuantity, removeFromCart, subtotal, totalItemsCount } = useCart();
  const { user, setAuthModalOpen } = useAuth();

  if (!cartDrawerOpen) return null;

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    if (!user) {
      setAuthModalOpen(true);
    } else {
      onProceedCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-slate-800 flex flex-col justify-between shadow-2xl animate-slide-left">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h3 className="font-heading font-extrabold text-xl text-white">Your Canteen Tray</h3>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {totalItemsCount} items
              </span>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-800/80">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShoppingBag className="w-16 h-16 mx-auto mb-3 text-slate-600 stroke-1" />
                <p className="font-heading font-bold text-lg text-slate-300">Your Tray is Empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Explore today's fresh menu and add your favorite meals to pre-order.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.food_id} className="py-4 flex items-center justify-between gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-sm text-white truncate">{item.name}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-400" /> {item.prep_time} mins prep
                    </span>
                    <div className="font-heading font-extrabold text-indigo-400 text-sm mt-1">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.food_id, -1)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs text-white px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.food_id, 1)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.food_id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Campus Express Convenience Fee</span>
                  <span className="font-bold text-emerald-400">FREE (₹0)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-indigo-400">₹{subtotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
