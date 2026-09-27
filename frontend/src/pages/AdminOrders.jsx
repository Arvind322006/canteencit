import React, { useState, useEffect } from 'react';
import { Clock, QrCode, RefreshCw, CheckCircle2, Utensils, XCircle, AlertCircle, ShoppingBag, Award } from 'lucide-react';
import { api } from '../services/api';
import QRScannerModal from '../components/QRScannerModal';

const STATUS_FILTERS = ['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY FOR PICKUP', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Out of stock');

  useEffect(() => {
    loadKitchenOrders();
    const interval = setInterval(loadKitchenOrders, 6000); // 6 sec live kitchen polling
    return () => clearInterval(interval);
  }, []);

  const loadKitchenOrders = async () => {
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    try {
      await api.updateOrderStatus(orderId, newStatus, reason);
      loadKitchenOrders();
      if (rejectionModalOrder) setRejectionModalOrder(null);
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Live Kitchen Order Board</h1>
          <p className="text-xs text-slate-400">Accept, prepare, and verify student orders in real time</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScanner(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <QrCode className="w-4 h-4" /> Scan QR Pass
          </button>

          <button
            onClick={loadKitchenOrders}
            className="btn-secondary py-2.5 px-3 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {st} ({st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-card p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-600 stroke-1" />
          <p className="font-heading font-bold text-lg text-slate-300">No Orders Under "{filterStatus}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="glass-card p-6 space-y-4 border border-slate-700/80 hover:border-indigo-500/40 transition-colors shadow-lg">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-lg text-indigo-300">#{order.id}</span>
                    <span className={`badge ${
                      order.status === 'PLACED' ? 'badge-placed' :
                      order.status === 'CONFIRMED' ? 'badge-confirmed' :
                      order.status === 'PREPARING' ? 'badge-preparing' :
                      order.status === 'READY FOR PICKUP' ? 'badge-ready' :
                      order.status === 'COMPLETED' ? 'badge-completed' : 'badge-cancelled'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Student: <span className="font-bold text-white">{order.user_name}</span> • Slot: <span className="font-bold text-amber-400">{order.pickup_slot}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Amount</span>
                  <span className="font-heading font-extrabold text-xl text-emerald-400">₹{order.total_amount} ({order.payment_method})</span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kitchen Prep List:</span>
                  <p className="text-white font-medium text-sm">
                    {order.items?.map(it => `${it.quantity}x ${it.food_name}`).join(', ')}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  Ordered at {new Date(order.created_at).toLocaleTimeString()}
                </span>
              </div>

              {/* Action Buttons for Kitchen Staff */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {order.status === 'PLACED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                    className="btn-primary py-2 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-500"
                  >
                    Confirm Order
                  </button>
                )}

                {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="btn-primary py-2 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-500"
                  >
                    Start Cooking / Prep
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'READY FOR PICKUP')}
                    className="btn-success py-2 px-4 text-xs font-bold"
                  >
                    Mark Ready for Pickup
                  </button>
                )}

                {order.status === 'READY FOR PICKUP' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    className="btn-success py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete Pickup & Hand Over
                  </button>
                )}

                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => setRejectionModalOrder(order)}
                    className="btn-danger text-xs font-bold py-2 px-3"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {showScanner && (
        <QRScannerModal 
          onClose={() => setShowScanner(false)} 
          onVerified={() => loadKitchenOrders()} 
        />
      )}

      {/* Cancellation modal */}
      {rejectionModalOrder && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 space-y-4 animate-slide-up">
            <h3 className="font-heading font-extrabold text-lg text-white">Cancel Order #{rejectionModalOrder.id}</h3>
            <p className="text-xs text-slate-400">Please provide a reason for order cancellation</p>

            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none"
            >
              <option value="Out of stock ingredient">Out of stock ingredient</option>
              <option value="Kitchen rush / High prep delay">Kitchen rush / High prep delay</option>
              <option value="Unreachable student / Pickup timeout">Unreachable student / Pickup timeout</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setRejectionModalOrder(null)}
                className="btn-secondary flex-1 py-2 text-xs font-bold"
              >
                Back
              </button>
              <button
                onClick={() => handleUpdateStatus(rejectionModalOrder.id, 'CANCELLED', rejectionReason)}
                className="btn-danger flex-1 py-2 text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
