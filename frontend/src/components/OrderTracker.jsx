import React from 'react';
import { CheckCircle2, Clock, Utensils, ShoppingBag, Award, XCircle } from 'lucide-react';

const STAGES = [
  { key: 'PLACED', label: 'Order Placed', icon: ShoppingBag, desc: 'Order received at counter' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, desc: 'Kitchen accepted order' },
  { key: 'PREPARING', label: 'Preparing', icon: Utensils, desc: 'Chef is cooking your meal' },
  { key: 'READY FOR PICKUP', label: 'Ready for Pickup', icon: Clock, desc: 'Hot & fresh at Counter 1' },
  { key: 'COMPLETED', label: 'Completed', icon: Award, desc: 'Picked up successfully' }
];

export default function OrderTracker({ status, rejectionReason }) {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-300">
        <XCircle className="w-6 h-6 text-red-400 shrink-0" />
        <div>
          <h4 className="font-heading font-bold text-sm text-red-200">Order Cancelled</h4>
          <p className="text-xs text-red-300/80 mt-0.5">{rejectionReason || 'Item became out of stock or kitchen closed.'}</p>
        </div>
      </div>
    );
  }

  const getStageIndex = (st) => STAGES.findIndex(s => s.key === st);
  const currentIndex = getStageIndex(status);

  return (
    <div className="w-full py-4">
      {/* Horizontal Steps Layout */}
      <div className="relative flex items-center justify-between">
        
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0" />
        
        {/* Active Filled Progress Line */}
        <div 
          className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-700"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (STAGES.length - 1)) * 100))}%`
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              {/* Circle Node */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50 ring-4 ring-indigo-500/30 scale-110'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 border border-slate-700 text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
              </div>

              {/* Stage Text */}
              <div className="text-center mt-2 max-w-[90px]">
                <span className={`text-[11px] font-bold block leading-tight ${
                  isCurrent ? 'text-indigo-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {stage.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
