import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { api } from '../services/api';

export default function AdminForecastPage() {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      const res = await api.getDemandForecast();
      if (res.success) {
        setForecastData(res);
      }
    } catch (err) {
      console.error('Error fetching demand forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Machine Learning Statistical Engine
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Smart Food Demand Forecasting</h1>
          <p className="text-xs text-slate-400">Prevents canteen food wastage & eliminates unexpected item stockouts</p>
        </div>

        <button
          onClick={loadForecast}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
        >
          <RefreshCw className="w-4 h-4" /> Recalculate Predictions
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-slate-400 animate-pulse">
          Calculating statistical moving averages & pre-orders demand...
        </div>
      ) : !forecastData?.hasEnoughData ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-white">Not enough historical data</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Prediction model will automatically activate once at least 2 full days of order history are recorded in the database.
          </p>
        </div>
      ) : (
        <>
          {/* Formula Explanation Banner */}
          <div className="glass-card p-6 border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Demand Prediction Formula & Methodology
              </h3>
              <span className="text-xs font-mono text-cyan-300">Historical Days Sample: {forecastData.totalHistoricalDays} days</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-400">Predicted Demand =</span> (0.60 × 7-Day Moving Avg Orders) + (0.40 × Today's Pre-orders Velocity).<br />
              <span className="font-bold text-emerald-400">Recommended Preparation =</span> Predicted Demand + 8% Kitchen Safety Buffer.
            </p>
          </div>

          {/* Forecast Cards Table */}
          <div className="glass-card overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-heading font-bold text-base text-white">Dish Preparation Quantity Recommendations</h3>
              <span className="text-xs text-slate-400">Auto-updated for today's kitchen shift</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">7-Day Past Avg</th>
                    <th className="p-4">Today Pre-Orders</th>
                    <th className="p-4">Predicted Demand</th>
                    <th className="p-4">Recommended Prep</th>
                    <th className="p-4">Safety Buffer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {forecastData.forecast?.map((item) => (
                    <tr key={item.foodId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white text-sm">{item.foodName}</td>
                      <td className="p-4 text-slate-400 font-semibold">{item.category}</td>
                      <td className="p-4 font-mono text-slate-200">{item.historicalAverage} portions</td>
                      <td className="p-4 font-mono text-cyan-400 font-bold">{item.todayPreOrders} pre-orders</td>
                      <td className="p-4 font-heading font-extrabold text-amber-400 text-sm">{item.predictedDemand} portions</td>
                      <td className="p-4 font-heading font-extrabold text-emerald-400 text-sm bg-emerald-500/10">
                        {item.recommendedPrep} portions
                      </td>
                      <td className="p-4 font-mono text-slate-400">+{item.safetyBuffer} buffer</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualization Chart */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" /> Recommended Prep vs Historical Average
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData.forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="foodName" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="historicalAverage" name="Historical Daily Avg" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predictedDemand" name="Predicted Demand" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recommendedPrep" name="Recommended Prep" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
