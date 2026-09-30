import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpensesManager } from './components/ExpensesManager';
import { BedsManager } from './components/BedsManager';
import { UtilityBillsManager } from './components/UtilityBillsManager';
import { FinancePage } from './components/FinancePage';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';

const MainContent = () => {
  const { activeTab } = useApp();
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  return (
    <main key={activeTab} ref={mainRef} className="flex-1 overflow-y-auto">
      <div className="p-3 sm:p-5 md:p-6 max-w-5xl mx-auto w-full pb-28 md:pb-8">
        {activeTab === 'dashboard'  && <Dashboard />}
        {activeTab === 'beds'       && <BedsManager />}
        {activeTab === 'expenses'   && <ExpensesManager />}
        {activeTab === 'bills'      && <UtilityBillsManager />}
        {activeTab === 'finance'    && <FinancePage />}
      </div>
    </main>
  );
};

const AppShell = () => {
  const { sheetsModalOpen, setSheetsModalOpen, monthlyReportOpen, setMonthlyReportOpen } = useApp();

  return (
    <div
      className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-cairo selection:bg-blue-600 selection:text-white relative"
      dir="rtl"
    >
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>

      {/* Global Modals */}
      <GoogleSheetsModal
        isOpen={sheetsModalOpen}
        onClose={() => setSheetsModalOpen(false)}
      />
      <MonthlyReportModal
        isOpen={monthlyReportOpen}
        onClose={() => setMonthlyReportOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
