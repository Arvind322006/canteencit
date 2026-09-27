import React, { useState, useEffect } from 'react';
import { Trash2, Plus, AlertCircle, Sparkles, TrendingDown, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';

export default function AdminWaste() {
  const [wasteData, setWasteData] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Log state
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    food_id: '',
    food_name: '',
    prepared_qty: 100,
    sold_qty: 85,
    wasted_qty: 15,
    reason: 'Over-preparation'
  });

  useEffect(() => {
    loadWasteData();
    loadFoodList();
  }, []);

  const loadWasteData = async () => {
    try {
      const res = await api.getWasteRecords();
      if (res.success) {
        setWasteData(res);
      }
    } catch (err) {
      console.error('Error loading waste records:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodList = async () => {
    try {
      const res = await api.getFoodItems();
      if (res.success) {
        setFoodItems(res.items);
        if (res.items.length > 0) {
          setFormData(prev => ({
            ...prev,
            food_id: res.items[0].id,
            food_name: res.items[0].name
          }));
        }
      }
    } catch (err) {}
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      const remaining_qty = Math.max(0, formData.prepared_qty - formData.sold_qty);
      await api.logWasteRecord({
        ...formData,
        remaining_qty
      });
      setModalOpen(false);
      loadWasteData();
    } catch (err) {
      alert(err.message || 'Failed to log waste record');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Sustainability & Food Waste Optimization
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Food Waste Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Log End-of-Day Food Waste
          </button>
          <button
            onClick={loadWasteData}
            className="btn-secondary py-2.5 px-3 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="glass-card p-5 border-indigo-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Food Wasted</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-3xl text-white">
              {wasteData?.summary?.totalWastedQty || 0}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">portions recorded</span>
          </div>
        </div>

        <div className="glass-card p-5 border-amber-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Food Wastage Percentage</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-3xl text-amber-400">
              {wasteData?.summary?.wastePercentage || 0}%
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">target threshold &lt; 5.0%</span>
          </div>
        </div>

        <div className="glass-card p-5 border-red-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Wasted Food Dish</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-xl text-red-300">
              {wasteData?.summary?.mostWastedItem || 'Chicken Biryani'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">highest end-of-day leftover</span>
          </div>
        </div>

      </div>

      {/* System Recommendations Section */}
      <div className="glass-card p-6 border-emerald-500/40 relative overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="font-heading font-extrabold text-lg text-white">System Waste Reduction Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wasteData?.records?.slice(0, 4).map((rec) => (
            <div key={rec.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{rec.food_name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{rec.date}</span>
              </div>
              <p className="text-slate-300">
                Prepared: <span className="font-bold text-white">{rec.prepared_qty}</span> • Sold: <span className="font-bold text-emerald-400">{rec.sold_qty}</span> • Wasted: <span className="font-bold text-red-400">{rec.wasted_qty}</span>
              </p>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold flex items-start gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>Recommendation: {rec.recommendation || 'Maintain current preparation quantity.'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waste Trend Chart */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" /> Daily Food Wastage Trend
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wasteData?.records || []}>
              <defs>
                <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="wasted_qty" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorWaste)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Waste Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 space-y-4 animate-slide-up border border-slate-700">
            <h3 className="font-heading font-extrabold text-xl text-white">Log Daily Food Waste</h3>

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Food Item</label>
                <select
                  value={formData.food_id}
                  onChange={(e) => {
                    const sel = foodItems.find(f => f.id === e.target.value);
                    setFormData({
                      ...formData,
                      food_id: e.target.value,
                      food_name: sel ? sel.name : ''
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                >
                  {foodItems.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prepared</label>
                  <input
                    type="number"
                    required
                    value={formData.prepared_qty}
                    onChange={(e) => setFormData({ ...formData, prepared_qty: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sold</label>
                  <input
                    type="number"
                    required
                    value={formData.sold_qty}
                    onChange={(e) => setFormData({ ...formData, sold_qty: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Wasted</label>
                  <input
                    type="number"
                    required
                    value={formData.wasted_qty}
                    onChange={(e) => setFormData({ ...formData, wasted_qty: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Wastage</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none"
                >
                  <option value="Over-preparation on low attendance day">Over-preparation on low attendance day</option>
                  <option value="Unused gravy/batter at closing time">Unused gravy/batter at closing time</option>
                  <option value="Burnt/cooking error batch">Burnt/cooking error batch</option>
                  <option value="Weather / Rain turnout drop">Weather / Rain turnout drop</option>
                </select>
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
                  Log Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
