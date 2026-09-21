import { useState, useEffect } from 'react';
import PredictionTable from '../components/PredictionTable';
import { loadCSV } from '../utils/dataUtils';
import { Table2, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Download } from 'lucide-react';

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const preds = await loadCSV('/data/individual_predictions.csv');
        setPredictions(preds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400">Loading individual prediction microdata...</p>
      </div>
    );
  }

  // Stats summary
  const total = predictions.length;
  const highRisk = predictions.filter(p => p.RISK_CATEGORY === 'High Risk').length;
  const medRisk = predictions.filter(p => p.RISK_CATEGORY === 'Medium Risk').length;
  const lowRisk = predictions.filter(p => p.RISK_CATEGORY === 'Low Risk').length;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Table2 className="w-6 h-6 text-indigo-400" />
            Individual Migration Risk Predictions
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse, filter, and audit individual microdata inference records with Logistic Regression risk stratification
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card p-4.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Scored</p>
              <p className="text-2xl font-black text-white mt-1 font-mono">{total.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Layers size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Test Holdout Cohort</p>
        </div>

        <div className="admin-card p-4.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">High Risk (&gt;50%)</p>
              <p className="text-2xl font-black text-rose-400 mt-1 font-mono">{highRisk.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ShieldAlert size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{((highRisk / total) * 100).toFixed(1)}% of cohort</p>
        </div>

        <div className="admin-card p-4.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Medium Risk (35-50%)</p>
              <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{medRisk.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{((medRisk / total) * 100).toFixed(1)}% of cohort</p>
        </div>

        <div className="admin-card p-4.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Low Risk (&lt;35%)</p>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{lowRisk.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{((lowRisk / total) * 100).toFixed(1)}% of cohort</p>
        </div>
      </div>

      {/* Main Table */}
      <PredictionTable data={predictions} />
    </div>
  );
}
