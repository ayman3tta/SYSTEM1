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
    <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'expenses' && <ExpensesManager />}
      {activeTab === 'capital' && <CapitalManager />}
      {activeTab === 'beds' && <BedsManager />}
      {activeTab === 'bills' && <UtilityBillsManager />}
      {activeTab === 'settlement' && <SettlementModal />}
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-cairo selection:bg-blue-600 selection:text-white relative">
        <Header />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
