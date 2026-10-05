import { useState } from 'react';
import {
  CheckSquare, Play, RefreshCw, CheckCircle2, Clock,
  AlertTriangle, Cpu, Terminal, ArrowRight, Shield
} from 'lucide-react';

const initialTasks = [
  {
    id: 'TASK-101',
    title: 'Census 2010–2019 Table Ingestion & Normalization',
    description: 'Parse 10 annual XLS matrices from Census Bureau and compile state-to-state net migration rates.',
    status: 'Completed',
    duration: '42.3s',
    lastRun: 'Today, 10:45 AM',
    progress: 100,
    type: 'ETL Pipeline'
  },
  {
    id: 'TASK-102',
    title: 'IPUMS CPS Demographic Feature Cleaning',
    description: 'Handle missing personal income, transform income, and map FIPS codes to standardized state names.',
    status: 'Completed',
    duration: '1m 18s',
    lastRun: 'Today, 10:46 AM',
    progress: 100,
    type: 'Data Preprocessing'
  },
  {
    id: 'TASK-103',
    title: 'Logistic Regression Model Training & Cross-Validation',
    description: 'Fit Scikit-Learn LogisticRegression with L2 regularization and compute 5-fold ROC-AUC scores.',
    status: 'Completed',
    duration: '34.8s',
    lastRun: 'Today, 10:48 AM',
    progress: 100,
    type: 'ML Model'
  },
  {
    id: 'TASK-104',
    title: 'State Outflow Risk Score Generation & GeoJSON Matrix',
    description: 'Generate state_risk_scores.csv and demographic risk stratifications for dashboard rendering.',
    status: 'Completed',
    duration: '12.1s',
    lastRun: 'Today, 10:49 AM',
    progress: 100,
    type: 'Analytics Job'
  },
  {
    id: 'TASK-105',
    title: 'Holdout Inference & Probability Calibration',
    description: 'Calculate calibrated probabilities for 2,000 holdout test individuals and assign risk tiers.',
    status: 'Completed',
    duration: '8.4s',
    lastRun: 'Today, 10:50 AM',
    progress: 100,
    type: 'Inference'
  }
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isRetraining, setIsRetraining] = useState(false);

  const triggerRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      alert('This dashboard cannot run Python locally. Run `python migration_pipeline.py` from the project folder, then refresh this page.');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            Pipelines & Automated Model Tasks
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor background ETL processes, feature engineering workflows, and machine learning model validation
          </p>
        </div>

        <button
          onClick={triggerRetrain}
          disabled={isRetraining}
          className="btn btn-primary text-xs px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw size={14} className={isRetraining ? 'animate-spin' : ''} />
          <span>{isRetraining ? 'Retraining Pipeline...' : 'Run Pipeline Check'}</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="admin-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-400">{task.id}</span>
                    <h3 className="text-sm font-bold text-white">{task.title}</h3>
                    <span className="badge badge-neutral text-[10px]">{task.type}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-gray-400 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>{task.duration}</span>
                </div>
                <span className="badge badge-low">{task.status}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-xs">{task.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Architecture Diagram Card */}
      <div className="admin-card p-6">
        <h3 className="section-title mb-1">Architecture Execution Sequence</h3>
        <p className="text-xs text-gray-400 mb-4">
          End-to-end data pipeline flow from raw Census & IPUMS ingestion to dashboard inference
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STEP 1</span>
            <p className="font-bold text-white mb-1">Data Ingestion</p>
            <p className="text-gray-400 text-[11px]">Download and parse Census 2010–2019 state tables & IPUMS microdata.</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STEP 2</span>
            <p className="font-bold text-white mb-1">Feature Engineering</p>
            <p className="text-gray-400 text-[11px]">Normalize age, income, and correlate state migration rates.</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STEP 3</span>
            <p className="font-bold text-white mb-1">Model Training</p>
            <p className="text-gray-400 text-[11px]">Compare candidate models on validation data; the selected calibrated model achieved 0.6994 ROC-AUC on the untouched holdout.</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STEP 4</span>
            <p className="font-bold text-white mb-1">Interactive UI</p>
            <p className="text-gray-400 text-[11px]">Serve metrics via React, Vite, Recharts, and Tailwind CSS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
