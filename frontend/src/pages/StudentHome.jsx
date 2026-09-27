import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Utensils, Zap, Clock, ShieldCheck, Filter } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import { api } from '../services/api';

export default function StudentHome({ onOpenCheckout }) {
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadFoodItems();
  }, [selectedCategory, searchQuery, vegOnly]);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories([{ id: 'cat_all', name: 'All' }, ...res.categories]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const loadFoodItems = async () => {
    setLoading(true);
    try {
      const res = await api.getFoodItems({
        category: selectedCategory,
        search: searchQuery,
        vegOnly
      });
      if (res.success) {
        setFoodItems(res.items);
      }
    } catch (err) {
      console.error('Error fetching food items:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" /> College Smart Canteen System
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight text-white leading-tight">
            Skip the Queue.<br />
            <span className="gradient-text">Order Before You Arrive.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pre-order your favorite campus meals, choose your convenient pickup slot, and collect fresh food without standing in lunch line queues!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#menu-section"
              className="btn-primary py-3.5 px-6 text-sm font-bold shadow-xl shadow-indigo-600/40"
            >
              <Utensils className="w-4 h-4" /> Order Fresh Meal Now
            </a>

            <div className="flex items-center gap-6 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 font-medium"><Zap className="w-4 h-4 text-amber-400" /> 0 Min Wait</span>
              <span className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-cyan-400" /> Slot Booking</span>
              <span className="flex items-center gap-1.5 font-medium"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Quick QR Pickup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Filter & Search Bar Section */}
      <section id="menu-section" className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-white">Today's Campus Menu</h2>
            <p className="text-xs text-slate-400">Freshly prepared in campus kitchen with high quality ingredients</p>
          </div>

          {/* Search Input & Veg Filter Toggle */}
          <div className="flex items-center gap-3">
            
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search Biryani, Dosa, Coffee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Veg Only Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                vegOnly
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              Veg Only
            </button>

          </div>
        </div>

        {/* Categories Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass-card h-80 animate-pulse p-4 space-y-4">
                <div className="bg-slate-800 h-40 rounded-xl" />
                <div className="bg-slate-800 h-6 w-3/4 rounded-lg" />
                <div className="bg-slate-800 h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : foodItems.length === 0 ? (
          <div className="glass-card text-center py-16 text-slate-400">
            <Utensils className="w-12 h-12 mx-auto mb-3 text-slate-600 stroke-1" />
            <p className="font-heading font-bold text-lg text-slate-300">No Food Items Found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foodItems.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
