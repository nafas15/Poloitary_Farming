import { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BirdMgmt } from './pages/BirdMgmt';
import { FeedMgmt } from './pages/FeedMgmt';
import { HealthMgmt } from './pages/HealthMgmt';
import { EggProduction } from './pages/EggProduction';
import { SalesMgmt } from './pages/SalesMgmt';
import { ExpenseMgmt } from './pages/ExpenseMgmt';
import { ProfitLoss } from './pages/ProfitLoss';
import { Reports } from './pages/Reports';

import './styles/index.css';

function MainAppContent() {
  const { currentUser } = useFarm();
  const [activeTab, setActiveTab] = useState('dashboard');

  // If not logged in, render the login page
  if (!currentUser) {
    return <Login />;
  }

  // Render the appropriate tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'birds':
        return <BirdMgmt />;
      case 'feed':
        return <FeedMgmt />;
      case 'health':
        return <HealthMgmt />;
      case 'eggs':
        return <EggProduction />;
      case 'sales':
        return <SalesMgmt />;
      case 'expenses':
        return <ExpenseMgmt />;
      case 'profit-loss':
        // Double-check Admin restriction at render level
        return currentUser.role === 'Admin' ? <ProfitLoss /> : <Dashboard />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header activeTab={activeTab} />
        <div className="tab-page-container">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <FarmProvider>
      <MainAppContent />
    </FarmProvider>
  );
}

export default App;
