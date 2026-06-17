import { useState, lazy, Suspense } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { isSupabaseConfigured } from './lib/supabaseClient';

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
function PageLoader({ message = 'Loading...' }: { message?: string }) {
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
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MainAppContent() {
  const { currentUser, isLoading } = useFarm();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not logged in, render the login page
  if (!currentUser) {
    return <Login />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

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
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />
      <main className="main-content">
        <Header activeTab={activeTab} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="tab-page-container">
          {isLoading ? (
            <PageLoader message="Syncing with database..." />
          ) : (
            <Suspense fallback={<PageLoader message="Loading page..." />}>
              {renderTabContent()}
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '560px', width: '100%', padding: '2.5rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <h2 className="text-gradient-rose" style={{ fontSize: '1.8rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Supabase Credentials Missing
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The application built successfully, but the webpage UI cannot load because the database connection credentials are not configured in your deployment.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.75rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>How to fix this in Vercel:</h4>
            <ol style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>Go to your <strong>Vercel Dashboard</strong> and open this project.</li>
              <li>Navigate to <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
              <li>Add the following two variables (copy their values from your local <code>.env</code> file):
                <ul style={{ listStyleType: 'circle', paddingLeft: '1.25rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <li><code>VITE_SUPABASE_URL</code></li>
                  <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                </ul>
              </li>
              <li>Go to the <strong>Deployments</strong> tab, select your latest deployment, click the three dots, and choose <strong>Redeploy</strong>.</li>
            </ol>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="btn btn-primary">
              Go to Vercel Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FarmProvider>
      <MainAppContent />
    </FarmProvider>
  );
}

export default App;

