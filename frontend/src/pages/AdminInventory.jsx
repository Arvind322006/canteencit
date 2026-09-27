import React, { useState, useEffect } from 'react';
import { Box, Plus, Edit2, AlertTriangle, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function AdminInventory() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stock_quantity: '',
    unit: 'kg',
    low_threshold: '',
    cost_per_unit: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await api.getInventory();
      if (res.success) {
        setIngredients(res.ingredients);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      stock_quantity: '',
      unit: 'kg',
      low_threshold: '',
      cost_per_unit: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (ing) => {
    setEditingItem(ing);
    setFormData({
      name: ing.name,
      stock_quantity: ing.stock_quantity,
      unit: ing.unit,
      low_threshold: ing.low_threshold,
      cost_per_unit: ing.cost_per_unit
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateInventory(editingItem.id, formData);
      } else {
        await api.addInventoryItem(formData);
      }
      setModalOpen(false);
      loadInventory();
    } catch (err) {
      alert(err.message || 'Failed to save inventory item');
    }
  };

  const lowStockCount = ingredients.filter(i => i.status !== 'Normal').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Inventory & Stock Tracking</h1>
          <p className="text-xs text-slate-400">Automated stock deduction per order recipe & threshold warnings</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Add New Ingredient
          </button>
          <button
            onClick={loadInventory}
            className="btn-secondary py-2.5 px-3 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Alert Card if Low Stock */}
      {lowStockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-xs">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-heading font-bold text-sm text-amber-200">{lowStockCount} Ingredients Require Urgent Restocking</h4>
            <p className="text-amber-300/80 mt-0.5">Automated stock warnings triggered. Update inventory counts after vendor delivery.</p>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="glass-card overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Ingredient Raw Material</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Low Stock Threshold</th>
                <th className="p-4">Unit Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {ingredients.map((ing) => (
                <tr key={ing.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  <td className="p-4 font-bold text-white text-sm">
                    {ing.name}
                  </td>

                  <td className="p-4 font-heading font-extrabold text-base text-indigo-300">
                    {ing.stock_quantity} {ing.unit}
                  </td>

                  <td className="p-4 text-slate-400 font-semibold">
                    {ing.low_threshold} {ing.unit}
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    ₹{ing.cost_per_unit || 0} / {ing.unit}
                  </td>

                  <td className="p-4">
                    <span className={`badge ${
                      ing.status === 'Normal' ? 'badge-normal' :
                      ing.status === 'Low Stock' ? 'badge-low' : 'badge-critical'
                    }`}>
                      {ing.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenEditModal(ing)}
                      className="btn-secondary py-1.5 px-3 text-xs font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Restock / Edit
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Restock */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 space-y-4 animate-slide-up border border-slate-700">
            <h3 className="font-heading font-extrabold text-xl text-white">
              {editingItem ? `Restock ${editingItem.name}` : 'Add Inventory Ingredient'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Basmati Rice"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="25"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="L">Liters (L)</option>
                    <option value="packs">Packs</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="10"
                    value={formData.low_threshold}
                    onChange={(e) => setFormData({ ...formData, low_threshold: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cost Per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="80"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                  />
                </div>
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
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
