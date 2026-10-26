import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ReceiptModal from './components/ReceiptModal';
import SupabaseConfigModal from './components/SupabaseConfigModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import PaymentsPage from './pages/PaymentsPage';
import MarketPage from './pages/MarketPage';
import ExpensesPage from './pages/ExpensesPage';
import BhogPage from './pages/BhogPage';
import SponsorsPage from './pages/SponsorsPage';
import CalculatorPage from './pages/CalculatorPage';
import SummaryPage from './pages/SummaryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PublicPortalPage from './pages/PublicPortalPage';

// Services
import { loadLocalDB, saveLocalDB, fetchSupabaseData, initialDatabase } from './services/dataService';
import { getSupabaseClient, getSupabaseCredentials } from './services/supabase';

export default function App() {
  const [db, setDb] = useState(() => loadLocalDB());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  // Modals & Notifications
  const [receiptState, setReceiptState] = useState(null); // { receipt, member }
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Sync / Load Supabase data
  const checkAndLoadSupabase = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsCloudConnected(false);
      return;
    }

    try {
      const cloudData = await fetchSupabaseData();
      if (cloudData) {
        setDb(cloudData);
        saveLocalDB(cloudData);
        setIsCloudConnected(true);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, continuing in offline mode:', err);
      setIsCloudConnected(false);
    }
  }, []);

  // Initial mount & Supabase Realtime subscription
  useEffect(() => {
    checkAndLoadSupabase();

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Realtime channel listener for multi-device sync
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Realtime DB change received:', payload);
          checkAndLoadSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkAndLoadSupabase]);

  // Update DB handler (Updates local state & triggers Supabase sync when available)
  const updateDB = useCallback((updater) => {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLocalDB(next);

      // Background sync to Supabase if connected
      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          try {
            if (next.settings) {
              await supabase.from('settings').upsert({
                id: 'primary_settings',
                club_name: next.settings.club_name,
                event_name: next.settings.event_name,
                other_income: next.settings.other_income,
                membership_types: next.settings.membership_types,
                market_categories: next.settings.market_categories,
                expense_categories: next.settings.expense_categories
              });
            }

            if (next.members !== prev.members && next.members?.length) {
              const cleaned = next.members.map(m => ({
                ...m,
                last_payment_date: m.last_payment_date ? m.last_payment_date : null
              }));
              await supabase.from('members').upsert(cleaned);
            }

            if (next.payments !== prev.payments && next.payments?.length) {
              await supabase.from('payments').upsert(next.payments);
            }

            if (next.marketEntries !== prev.marketEntries && next.marketEntries?.length) {
              await supabase.from('market_entries').upsert(next.marketEntries);
            }

            if (next.expenses !== prev.expenses && next.expenses?.length) {
              await supabase.from('expenses').upsert(next.expenses);
            }

            if (next.bhogCoupons !== prev.bhogCoupons && next.bhogCoupons?.length) {
              await supabase.from('bhog_coupons').upsert(next.bhogCoupons);
            }

            if (next.sponsors !== prev.sponsors && next.sponsors?.length) {
              await supabase.from('sponsors').upsert(next.sponsors);
            }
          } catch (err) {
            console.error('Background cloud sync error:', err);
          }
        })();
      }

      return next;
    });
  }, []);

  const handleOpenReceipt = (receipt, member) => {
    setReceiptState({ receipt, member });
  };

  return (
    <div className="min-h-screen bg-[#FDF8EA] text-[#2D1810] flex flex-col font-bengali">
      {/* Top Header */}
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isCloudConnected={isCloudConnected}
        onOpenCloudSettings={() => setIsCloudModalOpen(true)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onRefresh={checkAndLoadSupabase}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Hidden in public mode) */}
        {activeTab !== 'public' && (
          <Sidebar
            activeTab={activeTab}
            onNavigate={setActiveTab}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardPage
                db={db}
                onNavigate={setActiveTab}
                onOpenReceipt={handleOpenReceipt}
              />
            )}

            {activeTab === 'members' && (
              <MembersPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
                onOpenReceipt={handleOpenReceipt}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsPage
                db={db}
                onOpenReceipt={handleOpenReceipt}
              />
            )}

            {activeTab === 'market' && (
              <MarketPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
              />
            )}

            {activeTab === 'bhog' && (
              <BhogPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
              />
            )}

            {activeTab === 'sponsors' && (
              <SponsorsPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
              />
            )}

            {activeTab === 'calculator' && (
              <CalculatorPage db={db} />
            )}

            {activeTab === 'summary' && (
              <SummaryPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsPage db={db} />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
                isCloudConnected={isCloudConnected}
                onOpenCloudSettings={() => setIsCloudModalOpen(true)}
              />
            )}

            {activeTab === 'public' && (
              <PublicPortalPage
                db={db}
                onOpenReceipt={handleOpenReceipt}
              />
            )}
          </div>
        </main>
      </div>

      {/* Printable Digital Chanda Receipt Modal */}
      {receiptState && (
        <ReceiptModal
          receipt={receiptState.receipt}
          member={receiptState.member}
          onClose={() => setReceiptState(null)}
        />
      )}

      {/* Supabase Cloud Setup Modal */}
      {isCloudModalOpen && (
        <SupabaseConfigModal
          onClose={() => setIsCloudModalOpen(false)}
          onConfigSaved={checkAndLoadSupabase}
          localDb={db}
          showToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
