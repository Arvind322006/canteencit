import React from 'react';
import { Utensils, Shield, Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="font-heading font-extrabold text-xl text-white">SMART<span className="gradient-text">CANTEEN</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Next-gen college canteen management platform. Zero queue pre-ordering, AI demand forecasting & food waste reduction.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-3">Campus Pickup Slots</h4>
          <ul className="text-xs space-y-2 text-slate-400">
            <li>Breakfast: 08:30 AM – 10:00 AM</li>
            <li>Lunch Slot A: 12:30 PM – 01:00 PM</li>
            <li>Lunch Slot B: 01:00 PM – 01:30 PM</li>
            <li>Evening Snacks: 04:30 PM – 05:30 PM</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-3">Core Innovations</h4>
          <ul className="text-xs space-y-2 text-slate-400">
            <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Instant QR Counter Verification</li>
            <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Automated Inventory Deduction</li>
            <li className="flex items-center gap-1.5"><Utensils className="w-3.5 h-3.5 text-amber-400" /> Smart Demand Prediction</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-white uppercase tracking-wider mb-3">Canteen Counter Help</h4>
          <p className="text-xs text-slate-400 mb-2">Location: Main Student Activity Center, Block C</p>
          <p className="text-xs text-slate-400">Helpline: +91 98765 43210</p>
          <div className="mt-4 pt-4 border-t border-slate-900 text-[11px] text-slate-500">
            © 2026 Smart Canteen Inc. College Edition.
          </div>
        </div>

      </div>
    </footer>
  );
}
