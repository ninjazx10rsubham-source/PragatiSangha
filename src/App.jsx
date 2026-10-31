import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import ReceiptModal from './components/ReceiptModal';
import LoginScreen from './components/LoginScreen';
import WelcomeSplash from './components/WelcomeSplash';

// Pages
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import PaymentsPage from './pages/PaymentsPage';
import MarketPage from './pages/MarketPage';
import ExpensesPage from './pages/ExpensesPage';
import SponsorsPage from './pages/SponsorsPage';
import CalculatorPage from './pages/CalculatorPage';
import SummaryPage from './pages/SummaryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PublicPortalPage from './pages/PublicPortalPage';

// Services
import { loadLocalDB, saveLocalDB, fetchSupabaseData, safeUpsertMembers, initialDatabase } from './services/dataService';
import { getSupabaseClient, getSupabaseCredentials } from './services/supabase';

export default function App() {
  const [db, setDb] = useState(() => loadLocalDB());

  // Browser History & Routing integration: read initial tab from URL hash
  const getInitialTab = () => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    const validTabs = ['dashboard', 'members', 'payments', 'market', 'expenses', 'sponsors', 'calculator', 'summary', 'reports', 'settings', 'public'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const isSavingRef = useRef(false);
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true); // Permanent Supabase connection
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if previously logged in; default to true for smooth desktop use
    const savedAuth = localStorage.getItem('pragati_admin_auth');
    return savedAuth !== null ? savedAuth === 'true' : true;
  });

  // Startup animation with Maa Shyama photo
  const [showSplash, setShowSplash] = useState(true);
  
  // Modals & Notifications
  const [receiptState, setReceiptState] = useState(null); // { receipt, member }
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // History-aware navigation function
  const navigateTo = useCallback((newTab, replace = false) => {
    setActiveTabState(newTab);
    const hash = '#' + newTab;
    if (replace) {
      window.history.replaceState({ tab: newTab }, '', hash);
    } else {
      window.history.pushState({ tab: newTab }, '', hash);
    }
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

        // Auto Self-Heal: if any member balance differs from cloud raw records, quietly sync back
        if (Array.isArray(cloudData._rawMembers) && cloudData._rawMembers.length > 0) {
          const diffMembers = cloudData.members.filter(m => {
            const raw = cloudData._rawMembers.find(rm => rm.id === m.id);
            return raw && (raw.collected_amount !== m.collected_amount || raw.status !== m.status || raw.last_payment_date !== m.last_payment_date);
          });
          if (diffMembers.length > 0) {
            safeUpsertMembers(supabase, diffMembers);
          }
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, continuing with local cache:', err);
      // Keep isCloudConnected true because client credentials are valid
      setIsCloudConnected(true);
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
          if (isSavingRef.current) {
            console.log('Skipping Realtime reload because local save is in progress');
            return;
          }
          checkAndLoadSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkAndLoadSupabase]);

  // Handle Browser Back / Forward buttons & Mobile Back Gesture
  useEffect(() => {
    // Ensure initial entry has state
    if (!window.history.state?.tab) {
      window.history.replaceState({ tab: activeTab }, '', '#' + activeTab);
    }

    const handlePopState = (event) => {
      // 1. If Receipt Modal is open, back button closes the modal without leaving!
      if (receiptState) {
        setReceiptState(null);
        return;
      }

      // 2. Otherwise navigate to previous tab from history state or hash
      const targetTab = event.state?.tab || window.location.hash.replace(/^#\/?/, '').trim() || 'dashboard';
      setActiveTabState(targetTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, receiptState]);

  // Update DB handler (Updates local state & triggers Supabase sync when available)
  const updateDB = useCallback((updater) => {
    setDb((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLocalDB(next);

      // Background sync to Supabase if connected
      const supabase = getSupabaseClient();
      if (supabase) {
        (async () => {
          isSavingRef.current = true;
          try {
            if (next.settings) {
              const settingsPayload = {
                id: 'primary_settings',
                club_name: next.settings.club_name,
                event_name: next.settings.event_name,
                other_income: next.settings.other_income,
                membership_types: next.settings.membership_types,
                market_categories: next.settings.market_categories,
                expense_categories: next.settings.expense_categories,
                puja_schedule: next.settings.puja_schedule || []
              };
              const { error: setErr } = await supabase.from('settings').upsert(settingsPayload);
              if (setErr && (setErr.code === '42703' || setErr.message?.includes('puja_schedule'))) {
                const { puja_schedule, ...rest } = settingsPayload;
                await supabase.from('settings').upsert(rest);
              }
            }

            // Sync payment deletion if any payment was removed
            if (prev.payments && next.payments) {
              const removedPaymentIds = prev.payments
                .filter(pm => !next.payments.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedPaymentIds.length) {
                console.log('Syncing payment deletion to Supabase:', removedPaymentIds);
                try {
                  await supabase.from('payments').delete().in('id', removedPaymentIds);
                } catch (e) {
                  console.error('Failed to sync payment deletion:', e);
                }
              }
            }

            // Sync member deletion if any member was removed
            if (prev.members && next.members) {
              const removedMemberIds = prev.members
                .filter(pm => !next.members.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedMemberIds.length) {
                console.log('Syncing member deletion to Supabase:', removedMemberIds);
                await supabase.from('members').delete().in('id', removedMemberIds);
              }
            }

            // Sync market entry deletion
            if (prev.marketEntries && next.marketEntries) {
              const removedMkIds = prev.marketEntries
                .filter(pm => !next.marketEntries.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedMkIds.length) {
                await supabase.from('market_entries').delete().in('id', removedMkIds);
              }
            }

            // Sync expense deletion
            if (prev.expenses && next.expenses) {
              const removedExpIds = prev.expenses
                .filter(pm => !next.expenses.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedExpIds.length) {
                await supabase.from('expenses').delete().in('id', removedExpIds);
              }
            }

            // Sync bhog coupon deletion
            if (prev.bhogCoupons && next.bhogCoupons) {
              const removedBhogIds = prev.bhogCoupons
                .filter(pm => !next.bhogCoupons.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedBhogIds.length) {
                await supabase.from('bhog_coupons').delete().in('id', removedBhogIds);
              }
            }

            // Sync sponsor deletion
            if (prev.sponsors && next.sponsors) {
              const removedSpIds = prev.sponsors
                .filter(pm => !next.sponsors.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedSpIds.length) {
                await supabase.from('sponsors').delete().in('id', removedSpIds);
              }
            }

            // Sync previous year member deletion
            if (prev.previousYearMembers && next.previousYearMembers) {
              const removedPrevIds = prev.previousYearMembers
                .filter(pm => !next.previousYearMembers.some(nm => nm.id === pm.id))
                .map(m => m.id);
              if (removedPrevIds.length) {
                try {
                  await supabase.from('previous_year_members').delete().in('id', removedPrevIds);
                } catch (e) {}
              }
            }

            if (next.members !== prev.members && next.members?.length) {
              const changedMembers = next.members.filter(nm => {
                const pm = (prev.members || []).find(m => m.id === nm.id);
                return !pm || JSON.stringify(pm) !== JSON.stringify(nm);
              });
              if (changedMembers.length > 0) {
                await safeUpsertMembers(supabase, changedMembers);
              }
            }

            if (next.payments !== prev.payments && next.payments?.length) {
              const changedPayments = next.payments.filter(np => {
                const pp = (prev.payments || []).find(p => p.id === np.id);
                return !pp || JSON.stringify(pp) !== JSON.stringify(np);
              });
              if (changedPayments.length > 0) {
                await supabase.from('payments').upsert(changedPayments);
              }
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

            if (next.previousYearMembers !== prev.previousYearMembers && next.previousYearMembers?.length) {
              try {
                await supabase.from('previous_year_members').upsert(next.previousYearMembers);
              } catch (e) {}
            }
          } catch (err) {
            console.error('Background cloud sync error:', err);
          } finally {
            setTimeout(() => {
              isSavingRef.current = false;
            }, 1500);
          }
        })();
      }

      return next;
    });
  }, []);

  const handleOpenReceipt = (receipt, member) => {
    // Push modal state so back button closes the receipt modal instead of exiting!
    window.history.pushState({ modal: 'receipt', tab: activeTab }, '', '#' + activeTab);
    setReceiptState({ receipt, member });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('pragati_admin_auth', 'true');
    showToast('অ্যাডমিন প্যানেলে সফলভাবে লগইন হয়েছেন!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('pragati_admin_auth', 'false');
    showToast('লগআউট সম্পন্ন হয়েছে। সমস্ত ক্লাউড ডেটা সম্পূর্ণ সুরক্ষিত রয়েছে।', 'info');
  };

  // If user is logged out and not viewing the public portal, show the festive LoginScreen
  if (!isAuthenticated && activeTab !== 'public') {
    return (
      <div className="font-bengali">
        {showSplash && (
          <WelcomeSplash
            onComplete={() => setShowSplash(false)}
            clubName={db.settings?.club_name}
            eventName={db.settings?.event_name}
          />
        )}
        <LoginScreen
          onLogin={handleLogin}
          onOpenPublic={() => navigateTo('public')}
          clubName={db.settings?.club_name}
          eventName={db.settings?.event_name}
          storedPin={db.settings?.admin_pin}
        />
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

  return (
    <div className="min-h-screen bg-[#FDF8EA] text-[#2D1810] flex flex-col font-bengali">
      {/* Startup Opening Animation with Maa Shyama Photo */}
      {showSplash && (
        <WelcomeSplash
          onComplete={() => setShowSplash(false)}
          clubName={db.settings?.club_name}
          eventName={db.settings?.event_name}
        />
      )}

      {/* Top Header */}
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isCloudConnected={isCloudConnected}
        activeTab={activeTab}
        onNavigate={navigateTo}
        onRefresh={checkAndLoadSupabase}
        onOpenSplash={() => setShowSplash(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Hidden in public mode) */}
        {activeTab !== 'public' && (
          <Sidebar
            activeTab={activeTab}
            onNavigate={navigateTo}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardPage
                db={db}
                onNavigate={navigateTo}
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
                onUpdateDB={updateDB}
                showToast={showToast}
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
              />
            )}

            {activeTab === 'public' && (
              <PublicPortalPage
                db={db}
                onUpdateDB={updateDB}
                showToast={showToast}
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
          onClose={() => {
            if (window.history.state?.modal) {
              window.history.back();
            } else {
              setReceiptState(null);
            }
          }}
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
