import React, { useEffect, useState } from 'react';
import { 
  Award, 
  BarChart3, 
  Target, 
  Cpu, 
  CheckCircle2, 
  Grid, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { getModelPerformance } from '../services/api';

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlgo, setSelectedAlgo] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getModelPerformance();
        setMetrics(data);
        setSelectedAlgo(data.best_model);
      } catch (err) {
        setError(err.message || 'Failed to load model metrics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading verified test benchmarks...</span>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
        {error || 'Model metrics not available. Ensure train_model.py has run.'}
      </div>
    );
  }

  // Format comparison data for Recharts
  const comparisonData = Object.entries(metrics.comparison || {}).map(([name, vals]) => ({
    name: name.replace('Support Vector Machine', 'SVM'),
    accuracy: Math.round(vals.accuracy * 1000) / 10,
    f1_score: Math.round(vals.f1_score * 1000) / 10,
    precision: Math.round(vals.precision * 1000) / 10,
    recall: Math.round(vals.recall * 1000) / 10,
    time: vals.training_time_seconds
  }));

  const activeDetailed = metrics.detailed_metrics?.[selectedAlgo] || metrics.detailed_metrics?.[metrics.best_model];
  const categories = metrics.categories || [];
  const confusionMatrix = activeDetailed?.confusion_matrix || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-2">
              <Award className="h-3.5 w-3.5 text-blue-300" />
              <span>Highest Performing Model Selected</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">{metrics.best_model}</h2>
            <p className="text-xs text-blue-200/80 mt-1">
              Evaluated on {metrics.test_samples} unseen test products (Stratified 80/20 Split). Trained on {metrics.train_samples} real product records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 block">Test Accuracy</span>
              <span className="text-2xl font-black text-white">
                {(metrics.selected_metrics.accuracy * 100).toFixed(2)}%
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 block">Weighted F1</span>
              <span className="text-2xl font-black text-white">
                {(metrics.selected_metrics.f1_score * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Test Accuracy</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {(metrics.selected_metrics.accuracy * 100).toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Overall classification rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Precision (Weighted)</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">
            {(metrics.selected_metrics.precision * 100).toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Low false positive rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Recall (Weighted)</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">
            {(metrics.selected_metrics.recall * 100).toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Coverage of true positives</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">F1-Score (Weighted)</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {(metrics.selected_metrics.f1_score * 100).toFixed(2)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Harmonic balance of precision/recall</span>
        </div>
      </div>

      {/* Multi-Algorithm Comparison Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Machine Learning Algorithm Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated side-by-side using identical TF-IDF feature matrices and stratified test samples.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span> Accuracy
            <span className="h-2 w-2 rounded-full bg-indigo-600 ml-2"></span> F1-Score
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} />
              <YAxis domain={[85, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                formatter={(val) => [`${val}%`]}
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="accuracy" name="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1_score" name="F1-Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Algorithm detail badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          {Object.entries(metrics.comparison || {}).map(([name, vals]) => (
            <div 
              key={name}
              onClick={() => setSelectedAlgo(name)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedAlgo === name 
                  ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20' 
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-slate-900 truncate">{name}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Acc: <strong className="text-slate-800">{(vals.accuracy * 100).toFixed(1)}%</strong></span>
                <span>F1: <strong className="text-slate-800">{(vals.f1_score * 100).toFixed(1)}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confusion Matrix Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Grid className="h-4 w-4 text-purple-600" />
              Confusion Matrix: {selectedAlgo}
            </h3>
            <p className="text-xs text-slate-500">
              Rows represent True Categories; Columns represent Predicted Categories. High diagonal values indicate high classification accuracy.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 px-3 text-left font-bold text-slate-500 uppercase text-[10px]">
                  True \ Predicted
                </th>
                {categories.map((cat) => (
                  <th key={cat} className="py-2.5 px-2 font-semibold text-slate-700 text-[10px] max-w-[90px] truncate" title={cat}>
                    {cat.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((rowCat, rIdx) => (
                <tr key={rowCat} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-left font-bold text-slate-900 whitespace-nowrap bg-slate-50/40">
                    {rowCat}
                  </td>
                  {categories.map((colCat, cIdx) => {
                    const count = confusionMatrix[rIdx]?.[cIdx] ?? 0;
                    const isDiagonal = rIdx === cIdx;
                    return (
                      <td 
                        key={colCat} 
                        className={`py-2 px-2 font-mono font-medium ${
                          isDiagonal 
                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100' 
                            : count > 0 ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Keywords / Features per Category */}
      {metrics.top_keywords && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Model Explainability: Top TF-IDF Discriminating Keywords per Category
            </h3>
            <p className="text-xs text-slate-500">
              Highest-weighted vocabulary terms learned by the classifier for each retail category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metrics.top_keywords).map(([category, words]) => (
              <div key={category} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Top n-grams</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {words.map((w, wIdx) => (
                    <span 
                      key={wIdx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 shadow-2xs hover:border-blue-300 transition-colors"
                      title={`TF-IDF Weight: ${w.weight}`}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
