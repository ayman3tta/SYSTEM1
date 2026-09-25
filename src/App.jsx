import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpensesManager } from './components/ExpensesManager';
import { CapitalManager } from './components/CapitalManager';
import { BedsManager } from './components/BedsManager';
import { UtilityBillsManager } from './components/UtilityBillsManager';
import { SettlementModal } from './components/SettlementModal';

const MainContent = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-3 sm:p-5 md:p-6 max-w-5xl mx-auto w-full pb-28 md:pb-8">
        {activeTab === 'dashboard'   && <Dashboard />}
        {activeTab === 'expenses'    && <ExpensesManager />}
        {activeTab === 'capital'     && <CapitalManager />}
        {activeTab === 'beds'        && <BedsManager />}
        {activeTab === 'bills'       && <UtilityBillsManager />}
        {activeTab === 'settlement'  && <SettlementModal />}
      </div>
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-cairo selection:bg-blue-600 selection:text-white" dir="rtl">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
