import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  History, 
  BarChart3, 
  HelpCircle, 
  ShoppingBag,
  ExternalLink,
  Cpu
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, modelInfo }) {
  const navItems = [
    { id: 'predict', label: 'Predict Category', icon: Sparkles, badge: 'Live ML' },
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'performance', label: 'Model Performance', icon: BarChart3, badge: '97.1%' },
    { id: 'about', label: 'About & Methodology', icon: HelpCircle }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Logo & Title */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-none block">
                Classi<span className="text-blue-600">Commerce</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 block mt-0.5">
                ML Product Categorizer
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Model status pill & Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Model
              </span>
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-xs font-semibold text-slate-800 truncate" title={modelInfo?.active_model || 'Linear SVM'}>
              {modelInfo?.active_model || 'Linear SVM (Calibrated)'}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Categories:</span>
              <span className="font-semibold text-slate-700">8 Supported</span>
            </div>
          </div>
          <div className="mt-3 text-center text-[11px] text-slate-400">
            Flask & React ML System
          </div>
        </div>
      </aside>
    </>
  );
}
