import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const { activeTab, notification } = useShop();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all transform animate-bounce ${
          notification.type === 'error' 
            ? 'bg-rose-600 text-white shadow-rose-600/30' 
            : 'bg-emerald-600 text-white shadow-emerald-600/30'
        }`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <Navbar />

      {/* Dynamic Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'cart' && <CartPage />}
        {activeTab === 'auth' && <AuthPage />}
        {activeTab === 'profile' && <ProfilePage />}
        {activeTab === 'admin' && <AdminPage />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}