import { useState } from 'react';
import {
  HelpCircle, BookOpen, ExternalLink, Terminal, Code,
  ShieldCheck, Database, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function HelpDocs() {
  return (
    <div className="space-y-6 animate-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Documentation & System Guide
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Reference manual for the Migration Risk Intelligence Platform, dataset links, and Scikit-Learn modeling specs
          </p>
        </div>
      </div>

      {/* Dataset Sources & Direct Links */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Database size={18} className="text-indigo-400" />
          <h3 className="section-title">Official Dataset Provenance</h3>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          The platform operates strictly on official, verified federal demographic datasets covering the 2010–2019 decade. Direct citations and download links are documented below:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
               style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">U.S. Census Bureau State-to-State Migration Tables</span>
                <span className="badge badge-low text-[10px]">2010–2019</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Annual origin-destination flow matrices tracking net domestic interstate migration across all 50 states and Washington D.C.
              </p>
            </div>
            <a
              href="https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Census Portal</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
               style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">IPUMS Current Population Survey (CPS) Microdata</span>
                <span className="badge badge-indigo text-[10px]">1.4M Rows</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Harmonized demographic microdata from the Minnesota Population Center with age, adjusted income, education, and geographic indicators.
              </p>
            </div>
            <a
              href="https://cps.ipums.org/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>IPUMS Portal</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Start & Setup */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Terminal size={18} className="text-emerald-400" />
          <h3 className="section-title">Developer Quick Start & Execution</h3>
        </div>

        <p className="text-xs text-gray-300">
          To run the frontend analytics server and inspect model outputs locally:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-gray-300 space-y-2">
          <p className="text-gray-500"># 1. Install Python dependencies</p>
          <p className="text-emerald-400">pip install -r requirements.txt</p>
          <p className="text-gray-500 mt-2"># 2. Start the Vite React Dashboard</p>
          <p className="text-indigo-400">cd frontend &amp;&amp; npm run dev</p>
          <p className="text-gray-500 mt-2"># 3. Open dashboard in browser</p>
          <p className="text-gray-400">http://localhost:5173</p>
        </div>
      </div>

      {/* Model Methodology Card */}
      <div className="admin-card p-6 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <Code size={18} className="text-purple-400" />
          <h3 className="section-title">Mathematical Model Formulation</h3>
        </div>

        <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
          <p>
            The risk scoring engine employs a <strong>Regularized Logistic Regression</strong> classifier:
          </p>
          <div className="p-3 rounded-xl bg-black/30 border font-mono text-center text-indigo-400 text-xs my-2" style={{ borderColor: 'var(--border-color)' }}>
            P(Migrate = 1 | X) = 1 / (1 + e<sup>-(β<sub>0</sub> + β<sub>1</sub>Age + β<sub>2</sub>Income + β<sub>3</sub>StateFlowIndex)</sup>)
          </div>
          <p>
            The audited model has an ROC-AUC of <strong>0.6994</strong> on the 2018–2019 holdout. Because interstate moves are rare, consult average precision and calibration alongside accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
