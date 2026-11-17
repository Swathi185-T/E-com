import React from 'react';
import { Menu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Header({ activePage, setIsMobileOpen, backendHealthy }) {
  const titles = {
    predict: { title: 'Product Category Predictor', desc: 'Predict e-commerce product categories from title and description' },
    dashboard: { title: 'Analytics Dashboard', desc: 'Real-time category distributions and classification statistics' },
    history: { title: 'Prediction Audit History', desc: 'Search and inspect previous classification logs stored in SQLite' },
    performance: { title: 'Model Evaluation & Benchmarks', desc: 'True test accuracy, confusion matrix, and multi-algorithm comparison' },
    about: { title: 'Project Methodology & About', desc: 'Architectural overview of TF-IDF feature extraction and ML pipelines' }
  };

  const current = titles[activePage] || { title: 'E-Commerce Classification', desc: 'Machine Learning System' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {current.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {backendHealthy ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Backend API:</span> Connected
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            Connecting Backend...
          </div>
        )}
      </div>
    </header>
  );
}
