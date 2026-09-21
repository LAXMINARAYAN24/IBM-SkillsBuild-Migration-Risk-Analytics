import { useState } from 'react';
import {
  Settings, Sliders, Bell, Eye, Save, RotateCcw,
  CheckCircle2, Shield, Database, Cpu
} from 'lucide-react';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(50);
  const [mediumThreshold, setMediumThreshold] = useState(35);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highRiskNotifs, setHighRiskNotifs] = useState(true);
  const [autoRetrain, setAutoRetrain] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            Model & System Configuration
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Customize risk score decision thresholds, automated alerts, and analytics display preferences
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary text-xs px-4 py-2 flex items-center gap-2"
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          <span>{saved ? 'Saved Configuration!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Model Calibration Settings */}
      <div className="admin-card p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Sliders size={18} className="text-indigo-400" />
          <div>
            <h3 className="section-title">Logistic Regression Decision Thresholds</h3>
            <p className="text-xs text-gray-400">Control cutoff bounds for classification tiers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-white mb-2">
              <label>Critical / High Flight Risk Cutoff (%):</label>
              <span className="font-mono text-rose-400 text-sm">{threshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="70"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Probabilities above {threshold}% are flagged as High Flight Risk.
            </p>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-semibold text-white mb-2">
              <label>Moderate / Medium Risk Cutoff (%):</label>
              <span className="font-mono text-amber-400 text-sm">{mediumThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="45"
              value={mediumThreshold}
              onChange={(e) => setMediumThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Probabilities between {mediumThreshold}% and {threshold}% are labeled Medium Risk.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Alerts */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Bell size={18} className="text-amber-400" />
          <div>
            <h3 className="section-title">Automated Alerts & Telemetry</h3>
            <p className="text-xs text-gray-400">Configure notifications for state flight surges</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer"
                 style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div>
              <span className="font-bold text-white block">High Outflow Surge Notifications</span>
              <span className="text-[11px] text-gray-400">Trigger dashboard alert when any state exceeds 50% average flight risk</span>
            </div>
            <input
              type="checkbox"
              checked={highRiskNotifs}
              onChange={(e) => setHighRiskNotifs(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer"
                 style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div>
              <span className="font-bold text-white block">Email Weekly Executive Digest</span>
              <span className="text-[11px] text-gray-400">Send PDF migration summary to registered analyst email</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-600 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
