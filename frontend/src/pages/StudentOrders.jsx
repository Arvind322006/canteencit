import React, { useState, useEffect } from 'react';
import { Clock, QrCode, RefreshCw, Star, CheckCircle, ShoppingBag, Utensils, MessageSquare } from 'lucide-react';
import OrderTracker from '../components/OrderTracker';
import QRCodeModal from '../components/QRCodeModal';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function StudentOrders({ onReorderClick }) {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQRPass, setSelectedQRPass] = useState(null);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000); // Polling every 8 seconds for live status updates
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        addToCart({
          id: item.food_id,
          name: item.food_name,
          price: item.price,
          prep_time: 10,
          is_veg: 1,
          image_url: ''
        });
      });
      if (onReorderClick) onReorderClick();
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewOrder || !reviewOrder.items || reviewOrder.items.length === 0) return;

    setReviewSubmitting(true);
    setReviewSuccessMsg('');

    try {
      const firstItem = reviewOrder.items[0];
      await api.submitReview({
        food_id: firstItem.food_id,
        food_name: firstItem.food_name,
        rating,
        comment
      });

      setReviewSuccessMsg('Review submitted successfully! Thank you for your feedback.');
      setTimeout(() => {
        setReviewOrder(null);
        setReviewSuccessMsg('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white">Live Order Tracking & History</h1>
          <p className="text-xs text-slate-400">Track real-time kitchen progress, view pickup QR passes, or reorder previous meals</p>
        </div>
        <button
          onClick={loadOrders}
          className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Refresh
        </button>
      </div>

      {/* Active Orders Section */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" /> Active Canteen Orders ({activeOrders.length})
        </h2>

        {loading ? (
          <div className="glass-card p-6 animate-pulse space-y-4">
            <div className="bg-slate-800 h-6 w-1/3 rounded" />
            <div className="bg-slate-800 h-16 w-full rounded-xl" />
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400">
            <Utensils className="w-12 h-12 mx-auto mb-2 text-slate-600 stroke-1" />
            <p className="font-heading font-bold text-base text-slate-300">No Active Orders Right Now</p>
            <p className="text-xs text-slate-500 mt-1">Place an order from today's menu to track it here live.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeOrders.map((order) => (
              <div key={order.id} className="glass-card p-6 space-y-6 border border-slate-700/80 shadow-xl">
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-lg text-indigo-300">#{order.id}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {order.pickup_slot}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Placed at {new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedQRPass(order)}
                      className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <QrCode className="w-4 h-4" /> Show Pickup QR Pass
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <OrderTracker status={order.status} rejectionReason={order.rejection_reason} />

                {/* Items Summary */}
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order Items:</span>
                    <p className="text-white font-medium">
                      {order.items?.map(it => `${it.quantity}x ${it.food_name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Total Paid</span>
                    <span className="font-heading font-extrabold text-base text-emerald-400">₹{order.total_amount}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Order History Section */}
      <section className="space-y-4 pt-6">
        <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-400" /> Past Orders & Reorder History
        </h2>

        {pastOrders.length === 0 ? (
          <div className="glass-card p-6 text-center text-xs text-slate-500">
            No completed past orders yet.
          </div>
        ) : (
          <div className="glass-card overflow-hidden divide-y divide-slate-800">
            {pastOrders.map((order) => (
              <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-200">#{order.id}</span>
                    <span className={`badge ${order.status === 'COMPLETED' ? 'badge-completed' : 'badge-cancelled'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {order.items?.map(it => `${it.quantity}x ${it.food_name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()} • Slot: {order.pickup_slot}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-heading font-extrabold text-base text-white">₹{order.total_amount}</span>

                  {order.status === 'COMPLETED' && (
                    <button
                      onClick={() => setReviewOrder(order)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                      title="Rate food"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Rate
                    </button>
                  )}

                  <button
                    onClick={() => handleReorder(order)}
                    className="btn-secondary py-2 px-3 text-xs font-bold"
                  >
                    Reorder Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QR Code Pass Modal */}
      {selectedQRPass && (
        <QRCodeModal order={selectedQRPass} onClose={() => setSelectedQRPass(null)} />
      )}

      {/* Rating & Review Modal */}
      {reviewOrder && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 relative border border-slate-700/80 animate-slide-up space-y-4">
            <h3 className="font-heading font-extrabold text-xl text-white">Give Food Feedback</h3>
            <p className="text-xs text-slate-400">Rate your experience for {reviewOrder.items?.[0]?.food_name}</p>

            {reviewSuccessMsg ? (
              <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl border border-emerald-500/30 text-center font-bold">
                {reviewSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Your Review Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Hot & fresh biryani! Loved the flavor."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewOrder(null)}
                    className="btn-secondary flex-1 py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="btn-primary flex-1 py-2.5 text-xs font-bold"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
