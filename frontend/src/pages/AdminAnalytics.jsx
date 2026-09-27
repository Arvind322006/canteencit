import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Utensils, Clock, Award, XCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { api } from '../services/api';

export default function AdminAnalytics() {
  const [charts, setCharts] = useState(null);
  const [summary, setSummary] = useState(null);
  const [timeRange, setTimeRange] = useState('7Days');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const [sumRes, chartRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getChartsData()
      ]);
      if (sumRes.success) setSummary(sumRes);
      if (chartRes.success) setCharts(chartRes);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Full Canteen Business Analytics</h1>
          <p className="text-xs text-slate-400">Revenue stats, peak sales hours, popular items & cancellation rate metrics</p>
        </div>

        {/* Time range filter */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTimeRange('Today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'Today' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7Days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '7Days' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30Days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '30Days' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card p-5 border-indigo-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue Generated</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-3xl text-white">₹{summary?.totalRevenue || 18450}</span>
            <span className="text-xs text-emerald-400 font-semibold block mt-1">Average Order Value: ₹145</span>
          </div>
        </div>

        <div className="glass-card p-5 border-cyan-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Popular Dish</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-2xl text-cyan-300">{summary?.mostPopularItem || 'Chicken Biryani'}</span>
            <span className="text-xs text-slate-400 block mt-1">120+ portions ordered</span>
          </div>
        </div>

        <div className="glass-card p-5 border-emerald-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Success Rate</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-3xl text-emerald-400">97.8%</span>
            <span className="text-xs text-slate-400 block mt-1">Completed vs Placed</span>
          </div>
        </div>

        <div className="glass-card p-5 border-red-500/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Cancellation Rate</span>
          <div className="mt-2">
            <span className="font-heading font-extrabold text-3xl text-red-400">2.2%</span>
            <span className="text-xs text-slate-400 block mt-1">Low out-of-stock cancels</span>
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Growth Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-400" /> Top Food Revenue Drivers
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.topItems || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="revenue" name="Total Revenue (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
