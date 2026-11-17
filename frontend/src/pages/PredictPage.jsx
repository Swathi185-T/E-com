import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Tag, 
  BarChart2, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Lightbulb,
  Layers,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { predictCategory } from '../services/api';

const SAMPLE_PRESETS = [
  {
    title: "Electronics",
    name: "Samsung Galaxy S24 Ultra 5G",
    desc: "AI smartphone with 200MP camera, 12GB RAM, 512GB titanium storage, Snapdragon 8 Gen 3, and AMOLED 120Hz display."
  },
  {
    title: "Fashion",
    name: "Levi's Men's Slim Fit Casual Denim Shirt",
    desc: "100% pure cotton long sleeve button-down western style casual washed denim shirt for men."
  },
  {
    title: "Home & Kitchen",
    name: "Prestige Induction Non-Stick Hard Anodized Pan",
    desc: "Durable granite cookware pan with induction bottom, heat resistant handle, and scratch resistant surface."
  },
  {
    title: "Beauty & Care",
    name: "L'Oreal Paris Revitalift Hyaluronic Acid Serum",
    desc: "Intensive anti-aging facial hydrating serum with 1.5% pure hyaluronic acid for plumping and radiant skin."
  },
  {
    title: "Books",
    name: "Atomic Habits by James Clear Paperback",
    desc: "An easy and proven way to build good habits and break bad ones, bestselling self-help guide to productivity."
  },
  {
    title: "Sports & Outdoors",
    name: "Yonex Muscle Power Light Badminton Racquet",
    desc: "Lightweight graphite shaft badminton racket with isometric frame designed for fast swings and power smashes."
  },
  {
    title: "Toys & Games",
    name: "LEGO Classic Creative Bricks Building Set",
    desc: "Educational building block construction set containing 500 colorful pieces with wheels and windows for kids."
  },
  {
    title: "Grocery",
    name: "Nescafe Classic Instant Coffee Jar 200g",
    desc: "100% pure natural instant coffee powder roasted from select Robusta beans for rich morning aroma and flavor."
  }
];

const CATEGORY_COLORS = {
  'Electronics': '#3b82f6',
  'Fashion': '#ec4899',
  'Home & Kitchen': '#f59e0b',
  'Beauty & Personal Care': '#8b5cf6',
  'Books': '#10b981',
  'Sports & Outdoors': '#ef4444',
  'Toys & Games': '#06b6d4',
  'Grocery': '#84cc16'
};

export default function PredictPage() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!productName.trim() && !description.trim()) {
      setError('Please enter a product name or product description.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await predictCategory(productName, description);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to predict category. Please ensure the backend is running.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProductName('');
    setDescription('');
    setResult(null);
    setError(null);
  };

  const loadPreset = (preset) => {
    setProductName(preset.name);
    setDescription(preset.desc);
    setResult(null);
    setError(null);
  };

  // Prepare chart data from all probabilities
  const chartData = (result?.all_probabilities || []).map((item) => ({
    name: item.category,
    probability: Math.round(item.score * 1000) / 10,
    color: CATEGORY_COLORS[item.category] || '#6366f1'
  }));

  return (
    <div className="space-y-6">
      {/* Sample presets header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-slate-700 text-xs font-semibold uppercase tracking-wider">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>Quick Sample Presets (Click to test instantly):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-transparent hover:border-blue-200"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Classify Product
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Fill in the product name and description below. The TF-IDF vectorizer will transform the text and the machine learning model will predict its category.
          </p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Description <span className="text-slate-400 font-normal">(Features, specs, materials)</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Industry leading noise canceling headphones with dual noise sensor technology, 30-hour battery life, microphone for clear hands-free calls..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Analyzing & Predicting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Predict Category</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Result Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-fadeIn">
              {/* Top Prediction Highlight Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30 border border-blue-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5 text-blue-700 uppercase tracking-wider font-bold">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Prediction Outcome
                  </span>
                  <span className="bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-200 text-blue-800 text-[11px]">
                    ID #{result.id}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Predicted Category:</span>
                    <span 
                      className="text-2xl font-extrabold tracking-tight mt-0.5 inline-block"
                      style={{ color: CATEGORY_COLORS[result.predicted_category] || '#1e293b' }}
                    >
                      {result.predicted_category}
                    </span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs text-slate-500 font-medium block">Confidence Score:</span>
                    <span className="text-2xl font-black text-slate-900 inline-flex items-center gap-1">
                      {result.confidence_percentage}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-2.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: result.confidence_percentage,
                        backgroundColor: CATEGORY_COLORS[result.predicted_category] || '#2563eb'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Top 3 Predicted Categories */}
              {result.top_three && result.top_three.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    Top Category Candidates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {result.top_three.map((item, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          idx === 0 
                            ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-medium' 
                            : 'bg-slate-50/60 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-500">#{idx + 1}</span>
                          <span className="font-bold">{item.percentage}</span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-1 truncate" title={item.category}>
                          {item.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Probability Distribution Bar Chart */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                  Estimated Probabilities Across All 8 Categories
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 11, fill: '#475569' }} 
                        width={90}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Estimated Probability']}
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          color: '#fff', 
                          borderRadius: '8px', 
                          fontSize: '12px' 
                        }}
                      />
                      <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Informational Probability Disclaimer */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Confidence Note:</strong> {result.probability_note}
                </span>
              </div>
            </div>
          ) : (
            /* Placeholder State */
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                <Tag className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Awaiting Product Details
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
                Enter an e-commerce product title and description on the left, or click any sample preset above to see real-time classification results.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs border border-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span>Supports Electronics, Fashion, Home, Beauty, Books, Sports, Toys & Grocery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
