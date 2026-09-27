import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Utensils, Star, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Lunch',
    is_veg: true,
    prep_time: 10,
    image_url: ''
  });

  useEffect(() => {
    loadMenu();
    loadCategories();
  }, [searchQuery]);

  const loadMenu = async () => {
    try {
      const res = await api.getFoodItems({ search: searchQuery });
      if (res.success) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {}
  };

  const handleToggleAvailability = async (id, currentVal) => {
    try {
      await api.toggleAvailability(id, !currentVal);
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, is_available: !currentVal ? 1 : 0 } : item
      ));
    } catch (err) {
      alert('Failed to toggle availability.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.deleteFoodItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Lunch',
      is_veg: true,
      prep_time: 10,
      image_url: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      is_veg: Boolean(item.is_veg),
      prep_time: item.prep_time,
      image_url: item.image_url
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateFoodItem(editingItem.id, formData);
      } else {
        await api.addFoodItem(formData);
      }
      setModalOpen(false);
      loadMenu();
    } catch (err) {
      alert(err.message || 'Failed to save food item');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Food Menu Management</h1>
          <p className="text-xs text-slate-400">Add, edit, or toggle live availability of canteen dishes</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" /> Add New Dish
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        <input
          type="text"
          placeholder="Search food item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Food Items Table */}
      <div className="glass-card overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Prep Time</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Live Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {item.name}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{item.description}</p>
                    </div>
                  </td>

                  <td className="p-4 font-semibold text-slate-200">{item.category}</td>

                  <td className="p-4 font-heading font-extrabold text-white text-sm">₹{item.price}</td>

                  <td className="p-4 text-slate-300">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {item.prep_time} mins</span>
                  </td>

                  <td className="p-4">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating ? item.rating.toFixed(1) : '4.5'}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailability(item.id, Boolean(item.is_available))}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        item.is_available
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {item.is_available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition-colors"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="glass-card max-w-lg w-full p-6 space-y-4 animate-slide-up border border-slate-700">
            <h3 className="font-heading font-extrabold text-xl text-white">
              {editingItem ? 'Edit Dish' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="Special Chicken Biryani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="140"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-sm"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dietary Type</label>
                  <select
                    value={formData.is_veg ? 'VEG' : 'NON_VEG'}
                    onChange={(e) => setFormData({ ...formData, is_veg: e.target.value === 'VEG' })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-sm"
                  >
                    <option value="VEG">Vegetarian 🟢</option>
                    <option value="NON_VEG">Non-Vegetarian 🔴</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short dish description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-2.5 text-xs font-bold"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
