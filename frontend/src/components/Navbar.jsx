import React, { useState, useEffect } from 'react';
import { ShoppingBag, Utensils, Bell, User, LogOut, ShieldCheck, Clock, TrendingUp, Box, Trash2, PieChart, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAdmin, isStudent, logout, setAuthModalOpen, demoLogin } = useAuth();
  const { totalItemsCount, setCartDrawerOpen } = useCart();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, activeTab]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter(n => !n.is_read).length);
      }
    } catch (err) {
      // quiet fail
    }
  };

  const handleMarkRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {}
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Utensils className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">SMART<span className="gradient-text">CANTEEN</span></span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">v2.4 Pro</span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Campus Food • Zero Queues • AI Powered</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
          {!isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'home' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Utensils className="w-4 h-4" /> Menu
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-4 h-4" /> Track Orders
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PieChart className="w-4 h-4" /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('admin-orders')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-orders' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-4 h-4" /> Live Kitchen
              </button>
              <button
                onClick={() => setActiveTab('admin-forecast')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-forecast' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Demand
              </button>
              <button
                onClick={() => setActiveTab('admin-menu')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-menu' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Utensils className="w-4 h-4" /> Food Menu
              </button>
              <button
                onClick={() => setActiveTab('admin-inventory')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-inventory' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Box className="w-4 h-4" /> Inventory
              </button>
              <button
                onClick={() => setActiveTab('admin-waste')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-waste' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Trash2 className="w-4 h-4" /> Waste Monitor
              </button>
              <button
                onClick={() => setActiveTab('admin-analytics')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'admin-analytics' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Analytics
              </button>
            </>
          )}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Role Switcher Toggle */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 gap-1">
            <button
              onClick={() => {
                demoLogin('STUDENT');
                setActiveTab('home');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isStudent ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🎓 Student
            </button>
            <button
              onClick={() => {
                demoLogin('ADMIN');
                setActiveTab('admin-dashboard');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAdmin ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Canteen Admin
            </button>
          </div>

          {/* Cart Icon (Student side) */}
          {!isAdmin && (
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500/50 transition-all shadow-md group"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (!showNotifs) handleMarkRead();
              }}
              className="relative p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-indigo-500/50 transition-all shadow-md"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card p-4 shadow-2xl z-50 border border-slate-700/80 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" /> In-App Notifications
                  </h4>
                  <span className="text-xs text-slate-400">{notifications.length} updates</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50 my-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No new notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded-lg transition-colors">
                        <p className="text-xs font-bold text-indigo-300">{n.title}</p>
                        <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">Just now</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 pl-3 rounded-2xl">
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn-primary py-2.5 px-4 text-sm"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
