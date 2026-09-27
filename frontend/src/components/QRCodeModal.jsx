import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, Clock, ShieldCheck, Download } from 'lucide-react';

export default function QRCodeModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card max-w-md w-full p-6 relative border border-slate-700/80 animate-slide-up text-center">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Order ID */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">Pickup QR Pass</h3>
          <p className="text-xs text-slate-400 mt-1">Show this QR code at Canteen Counter 1 to collect your food.</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-2xl inline-block shadow-2xl my-3 border-4 border-indigo-500/20">
          <QRCodeSVG
            value={order.id}
            size={180}
            level="H"
            includeMargin={true}
          />
          <span className="block mt-2 font-mono font-bold text-xs text-slate-900 tracking-wider">
            {order.id}
          </span>
        </div>

        {/* Pickup Details Card */}
        <div className="bg-slate-900/90 rounded-xl p-3 text-left border border-slate-800 space-y-1.5 my-3 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Pickup Slot:</span>
            <span className="font-bold text-indigo-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {order.pickup_slot}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Total Paid:</span>
            <span className="font-bold text-emerald-400">₹{order.total_amount} ({order.payment_method})</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Student:</span>
            <span className="font-semibold text-white">{order.user_name}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full justify-center py-3 text-sm mt-2"
        >
          <CheckCircle className="w-4 h-4" /> Ready for Pickup
        </button>

      </div>
    </div>
  );
}
