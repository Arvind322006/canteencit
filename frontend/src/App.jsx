import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LoginModal from './components/LoginModal';

import StudentHome from './pages/StudentHome';
import StudentCheckout from './pages/StudentCheckout';
import StudentOrders from './pages/StudentOrders';

import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import AdminInventory from './pages/AdminInventory';
import AdminWaste from './pages/AdminWaste';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminForecastPage from './pages/AdminForecastPage';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin-dashboard' : 'home');

  // Route protection: if user is non-admin and tries to view admin tab, redirect to home
  React.useEffect(() => {
    if (activeTab.startsWith('admin-') && !isAdmin) {
      setActiveTab('home');
    }
  }, [activeTab, isAdmin]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-slate-100 font-sans">
      
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* STUDENT VIEWS */}
          {activeTab === 'home' && (
            <StudentHome onOpenCheckout={() => setActiveTab('checkout')} />
          )}

          {activeTab === 'checkout' && (
            <StudentCheckout 
              onBackToMenu={() => setActiveTab('home')}
              onViewOrders={() => setActiveTab('orders')}
            />
          )}

          {activeTab === 'orders' && (
            <StudentOrders onReorderClick={() => setActiveTab('checkout')} />
          )}

          {/* ADMIN VIEWS */}
          {activeTab === 'admin-dashboard' && (
            <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'admin-orders' && (
            <AdminOrders />
          )}

          {activeTab === 'admin-forecast' && (
            <AdminForecastPage />
          )}

          {activeTab === 'admin-menu' && (
            <AdminMenu />
          )}

          {activeTab === 'admin-inventory' && (
            <AdminInventory />
          )}

          {activeTab === 'admin-waste' && (
            <AdminWaste />
          )}

          {activeTab === 'admin-analytics' && (
            <AdminAnalytics />
          )}

        </main>
      </div>

      <Footer />

      {/* Slide-over Shopping Cart Drawer */}
      <CartDrawer onProceedCheckout={() => setActiveTab('checkout')} />

      {/* Auth Modal */}
      <LoginModal />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
