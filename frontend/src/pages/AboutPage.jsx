import React from 'react';
import { 
  HelpCircle, 
  Layers, 
  Binary, 
  Workflow, 
  Cpu, 
  CheckCircle2, 
  Database,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-3">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>System Architecture & Machine Learning Concepts</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          How E-Commerce Product Classification Works
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          In large-scale modern retail platforms (like Amazon, Flipkart, Walmart), millions of new SKUs are cataloged daily. Automating catalog taxonomy classification through NLP & Machine Learning replaces expensive manual curation and ensures optimal search discoverability.
        </p>
      </div>

      {/* 1. What is Product Classification & Why Machine Learning? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">1. What is Product Classification?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Product classification is the algorithmic assignment of an e-commerce item into standardized categorical buckets (such as <em>Electronics</em>, <em>Fashion</em>, <em>Grocery</em>, or <em>Sports</em>) based strictly on unstructured text: product names, brand terms, and feature descriptions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">2. Why Use Machine Learning?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traditional keyword lookup and regex rules fail because sellers use varied vocabularies, typos, abbreviations (e.g. <em>"512GB SSD FHD IPS"</em>), and cross-category terminology. Machine learning models generalize contextual patterns and multi-word semantic cues robustly.
          </p>
        </div>
      </div>

      {/* 2. How TF-IDF Vectorization Works */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Binary className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">3. How TF-IDF Vectorization Works</h3>
            <span className="text-xs text-slate-400">Term Frequency - Inverse Document Frequency</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Machine learning algorithms operate on numerical vectors rather than raw strings. We convert cleaned text into numerical features using <strong>TF-IDF</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">Term Frequency (TF):</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Measures how frequently a term occurs within an individual product description. Sublinear TF scaling <code className="bg-white px-1 py-0.5 rounded border">1 + log(tf)</code> prevents disproportionate impact from repeated terms.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">Inverse Document Frequency (IDF):</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Down-weights ubiquitous words (like <em>"quality"</em>, <em>"brand"</em>, <em>"product"</em>) that appear everywhere, and amplifies distinctive category markers (like <em>"cotton"</em>, <em>"ram"</em>, <em>"instant"</em>).
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
          <strong>N-Gram Range (1, 2):</strong> Captures both single words (<em>"smartphone"</em>) and paired sequences (<em>"running shoes"</em>, <em>"instant coffee"</em>) to preserve semantic intent.
        </div>
      </div>

      {/* 3. Implemented Machine Learning Algorithms */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">4. Algorithms Implemented & Compared</h3>
            <span className="text-xs text-slate-400">4 Scikit-Learn Classifiers Trained on Stratified Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Linear Support Vector Machine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Top Performer</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Constructs an optimal maximum-margin hyperplane in 12,000-dimensional TF-IDF space. Wrapped in CalibratedClassifierCV to output calibrated class probabilities.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900">Logistic Regression</div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Applies a multi-class softmax regression with L2 regularization. Highly robust baseline with native probability distributions across classes.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900">Multinomial Naive Bayes</div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Calculates joint conditional probabilities under the naive feature-independence assumption. Extremely fast and memory efficient for text classification.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900">Random Forest Classifier</div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Ensemble of 120 randomized decision trees using bootstrap aggregation. Models non-linear combinations of textual features.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Complete End-to-End Pipeline Walkthrough */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">5. End-to-End Inference Flow</h3>
        
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">1</span>
            <div>
              <strong className="text-slate-900">Client Input:</strong> User inputs product name and description in the React frontend.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">2</span>
            <div>
              <strong className="text-slate-900">REST API Request:</strong> Sent via <code className="bg-white px-1 py-0.5 rounded border">POST /api/predict</code> to Flask backend.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">3</span>
            <div>
              <strong className="text-slate-900">Text Sanitization & Vectorization:</strong> Strips HTML/punctuations, applies TF-IDF mapping with the fitted vocabulary.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">4</span>
            <div>
              <strong className="text-slate-900">Calibrated Classification:</strong> Model predicts top category and calculates probability scores across all 8 classes.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">5</span>
            <div>
              <strong className="text-slate-900">SQLite Audit Log & Visualization:</strong> Result is persistently saved to SQLite and returned to React for Recharts visualization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
