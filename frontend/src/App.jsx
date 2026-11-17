import React, { useState, useEffect } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import PredictPage from './pages/PredictPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import AboutPage from './pages/AboutPage';
import { checkHealth } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('predict');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  const verifyHealth = async () => {
    try {
      const data = await checkHealth();
      setBackendHealthy(true);
      setModelInfo(data);
    } catch (err) {
      setBackendHealthy(false);
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        modelInfo={modelInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activePage={activePage}
          setIsMobileOpen={setIsMobileOpen}
          backendHealthy={backendHealthy}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activePage === 'predict' && <PredictPage />}
            {activePage === 'dashboard' && <DashboardPage setActivePage={setActivePage} />}
            {activePage === 'history' && <HistoryPage />}
            {activePage === 'performance' && <ModelPerformancePage />}
            {activePage === 'about' && <AboutPage />}
          </div>
        </main>
      </div>
    </div>
  );
}
