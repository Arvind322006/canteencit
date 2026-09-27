import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CreditCard, QrCode, Banknote, CheckCircle, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import QRCodeModal from '../components/QRCodeModal';

export default function StudentCheckout({ onBackToMenu, onViewOrders }) {
  const { cart, subtotal, clearCart, selectedSlot, setSelectedSlot } = useCart();
  const { user } = useAuth();
  
  const [slots, setSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const res = await api.getPickupSlots();
      if (res.success) {
        setSlots(res.slots);
        // Pre-select first non-full slot
        const available = res.slots.find(s => !s.is_full);
        if (available && !selectedSlot) {
          setSelectedSlot(available.slot_time);
        }
      }
    } catch (err) {
      console.error('Error fetching pickup slots:', err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      setErrorMsg('Please select a pickup time slot before placing your order.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        items: cart.map(i => ({ food_id: i.food_id, quantity: i.quantity })),
        pickup_slot: selectedSlot,
        payment_method: paymentMethod
      };

      const res = await api.placeOrder(orderPayload);

      if (res.success && res.order) {
        setPlacedOrder(res.order);
        clearCart();

        // Trigger confetti celebration!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-slide-up">
        <div className="glass-card p-8 border border-emerald-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 animate-pulse">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              Simulated Payment Successful
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-white">Order Placed Successfully! 🎉</h2>
            <p className="text-sm text-slate-300">
              Your meal is queued for preparation. Skip the queue and show your QR pass at Counter 1!
            </p>
          </div>

          {/* Order Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID:</span>
              <span className="font-mono font-bold text-indigo-300 text-sm">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pickup Slot:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {placedOrder.pickup_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Paid:</span>
              <span className="font-extrabold text-emerald-400">₹{placedOrder.total_amount} ({placedOrder.payment_method})</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setShowPassModal(true)}
              className="btn-primary flex-1 justify-center py-3 text-sm font-bold shadow-lg shadow-indigo-600/40"
            >
              <QrCode className="w-4 h-4" /> View Pickup QR Code Pass
            </button>
            <button
              onClick={onViewOrders}
              className="btn-secondary flex-1 justify-center py-3 text-sm font-bold"
            >
              Track Order Live
            </button>
          </div>

        </div>

        {showPassModal && (
          <QRCodeModal order={placedOrder} onClose={() => setShowPassModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBackToMenu}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white">Order Checkout & Pickup Slot</h1>
          <p className="text-xs text-slate-400">Select pickup timing & simulated payment method</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Slots & Payment selection */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Step 1: Pickup Slot Selection */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-extrabold text-lg text-white">1. Select Campus Pickup Slot</h3>
            </div>
            <p className="text-xs text-slate-400">
              Pickup slots control canteen counter rush. Slots become disabled when maximum capacity is reached.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={slot.is_full}
                  onClick={() => setSelectedSlot(slot.slot_time)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    slot.is_full
                      ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                      : selectedSlot === slot.slot_time
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/40'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm">{slot.slot_time}</span>
                    {slot.is_full ? (
                      <span className="text-[10px] font-bold text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">FULL</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {slot.remaining_capacity} left
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="font-heading font-extrabold text-lg text-white">2. Simulated Payment Method</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'UPI'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-bold">UPI / GPay</span>
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'CARD'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-6 h-6 text-purple-400" />
                <span className="text-xs font-bold">Campus Card</span>
              </button>

              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'CASH'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Banknote className="w-6 h-6 text-emerald-400" />
                <span className="text-xs font-bold">Pay at Counter</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Order Summary Card */}
        <div className="glass-card p-6 space-y-6 h-fit">
          <h3 className="font-heading font-extrabold text-lg text-white pb-3 border-b border-slate-800">Order Summary</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-800/60">
            {cart.map((item) => (
              <div key={item.food_id} className="pt-2 flex justify-between text-xs text-slate-300">
                <div>
                  <span className="font-bold text-white">{item.quantity}x</span> {item.name}
                </div>
                <span className="font-mono text-indigo-300 font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-bold text-white">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Selected Slot:</span>
              <span className="font-bold text-amber-300">{selectedSlot || 'Not Selected'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Student:</span>
              <span className="font-semibold text-white">{user?.name}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Payable:</span>
              <span className="text-indigo-400">₹{subtotal}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !selectedSlot}
            className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-xl shadow-indigo-600/40 disabled:opacity-50"
          >
            {loading ? 'Processing Payment...' : 'Confirm & Pay ₹' + subtotal}
          </button>
        </div>

      </div>

    </div>
  );
}
