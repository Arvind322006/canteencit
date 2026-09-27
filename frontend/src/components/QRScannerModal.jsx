import React, { useState } from 'react';
import { X, QrCode, Search, CheckCircle2, AlertTriangle, ShieldCheck, Utensils } from 'lucide-react';
import { api } from '../services/api';

export default function QRScannerModal({ onClose, onVerified }) {
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!scanInput.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setVerifiedOrder(null);

    try {
      const res = await api.verifyQR(scanInput.trim());
      if (res.success && res.order) {
        setVerifiedOrder(res.order);
        if (onVerified) onVerified(res.order);
      } else {
        setErrorMsg('Invalid Order ID or QR Code.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!verifiedOrder) return;
    try {
      await api.updateOrderStatus(verifiedOrder.id, 'COMPLETED');
      setVerifiedOrder(prev => ({ ...prev, status: 'COMPLETED' }));
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to mark order completed.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card max-w-lg w-full p-6 relative border border-slate-700/80 animate-slide-up">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">Counter QR Verification Scanner</h3>
            <p className="text-xs text-slate-400">Scan or type student Order ID to confirm pickup</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="e.g. CAN-2026-00101"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2.5 px-4 text-xs font-bold shrink-0"
          >
            {loading ? 'Verifying...' : 'Verify Order'}
          </button>
        </form>

        {/* Quick Demo Scan Buttons for Canteen Staff testing */}
        <div className="mb-4 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Demo Scan Simulator:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setScanInput('CAN-2026-00101'); }}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 font-mono"
            >
              CAN-2026-00101
            </button>
            <button
              onClick={() => { setScanInput('CAN-2026-00102'); }}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 font-mono"
            >
              CAN-2026-00102
            </button>
            <button
              onClick={() => { setScanInput('CAN-2026-00103'); }}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 font-mono"
            >
              CAN-2026-00103
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verification Result Card */}
        {verifiedOrder && (
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-heading font-extrabold text-white text-base">ORDER VERIFIED!</span>
              </div>
              <span className="badge badge-ready">{verifiedOrder.status}</span>
            </div>

            <div className="my-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-white">{verifiedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-semibold text-indigo-300">{verifiedOrder.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup Slot:</span>
                <span className="font-bold text-amber-400">{verifiedOrder.pickup_slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-semibold text-emerald-400">₹{verifiedOrder.total_amount} ({verifiedOrder.payment_method})</span>
              </div>
            </div>

            {/* Food Items List */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 my-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Items to Hand Over:</span>
              <ul className="space-y-1 text-xs text-slate-200 divide-y divide-slate-900">
                {verifiedOrder.items?.map(it => (
                  <li key={it.id} className="pt-1 flex justify-between">
                    <span>{it.quantity}x {it.food_name}</span>
                    <span className="text-slate-400 font-mono">₹{it.price * it.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {verifiedOrder.status !== 'COMPLETED' ? (
              <button
                onClick={handleCompletePickup}
                className="btn-success w-full justify-center py-3 text-sm font-bold flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" /> Hand Over Food & Mark Completed
              </button>
            ) : (
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 text-center font-bold text-xs rounded-xl border border-emerald-500/30">
                ✓ Order Handed Over & Marked Complete
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
