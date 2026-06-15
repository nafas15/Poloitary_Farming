import { useState, lazy, Suspense } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';

// Lazy-loaded pages — Vite will split these into separate chunks
const Dashboard    = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const BirdMgmt     = lazy(() => import('./pages/BirdMgmt').then(m => ({ default: m.BirdMgmt })));
const FeedMgmt     = lazy(() => import('./pages/FeedMgmt').then(m => ({ default: m.FeedMgmt })));
const HealthMgmt   = lazy(() => import('./pages/HealthMgmt').then(m => ({ default: m.HealthMgmt })));
const EggProduction = lazy(() => import('./pages/EggProduction').then(m => ({ default: m.EggProduction })));
const SalesMgmt    = lazy(() => import('./pages/SalesMgmt').then(m => ({ default: m.SalesMgmt })));
const ExpenseMgmt  = lazy(() => import('./pages/ExpenseMgmt').then(m => ({ default: m.ExpenseMgmt })));
const ProfitLoss   = lazy(() => import('./pages/ProfitLoss').then(m => ({ default: m.ProfitLoss })));
const Reports      = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));

import './styles/index.css';

// Lightweight page-transition loader
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid var(--color-emerald)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

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
      case 'dashboard':    return <Dashboard />;
      case 'birds':        return <BirdMgmt />;
      case 'feed':         return <FeedMgmt />;
      case 'health':       return <HealthMgmt />;
      case 'eggs':         return <EggProduction />;
      case 'sales':        return <SalesMgmt />;
      case 'expenses':     return <ExpenseMgmt />;
      case 'profit-loss':
        return currentUser.role === 'Admin' ? <ProfitLoss /> : <Dashboard />;
      case 'reports':      return <Reports />;
      default:             return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header activeTab={activeTab} />
        <div className="tab-page-container">
          <Suspense fallback={<PageLoader />}>
            {renderTabContent()}
          </Suspense>
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

