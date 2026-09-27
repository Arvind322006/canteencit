import React from 'react';
import { Star, Clock, Plus, Minus, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food, onOpenDetails }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const inCartItem = cart.find(item => item.food_id === food.id);

  return (
    <div className="glass-card glass-card-hover overflow-hidden flex flex-col justify-between group">
      
      {/* Top Image Section with Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={food.image_url}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Veg / Non-Veg Indicator Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-1.5 shadow-md">
          <span className={`w-2.5 h-2.5 rounded-full ${food.is_veg ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
          <span className="text-[11px] font-bold tracking-wide text-white uppercase">{food.is_veg ? 'VEG' : 'NON-VEG'}</span>
        </div>

        {/* Prep Time Tag */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-1 text-slate-300 text-xs font-semibold shadow-md">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{food.prep_time} mins</span>
        </div>

        {/* Availability Badge Overlay if out of stock */}
        {!food.is_available && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <span className="font-heading font-bold text-sm text-amber-300 tracking-wide uppercase">Sold Out For Today</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-heading font-bold text-lg text-white group-hover:text-indigo-300 transition-colors leading-snug">
              {food.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{food.rating ? food.rating.toFixed(1) : '4.5'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {food.description}
          </p>
        </div>

        {/* Bottom Price & Add to Cart Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="font-heading font-extrabold text-xl text-white">₹{food.price}</span>
          </div>

          {food.is_available ? (
            inCartItem ? (
              <div className="flex items-center bg-indigo-600/30 border border-indigo-500/60 rounded-xl overflow-hidden p-0.5 shadow-md">
                <button
                  onClick={() => updateQuantity(food.id, -1)}
                  className="p-1.5 hover:bg-indigo-600 text-white transition-colors rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-extrabold text-sm text-white">{inCartItem.quantity}</span>
                <button
                  onClick={() => updateQuantity(food.id, 1)}
                  className="p-1.5 hover:bg-indigo-600 text-white transition-colors rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(food)}
                className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            )
          ) : (
            <span className="text-xs text-slate-500 font-semibold italic">Unavailable</span>
          )}
        </div>

      </div>
    </div>
  );
}
