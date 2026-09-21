import { useState } from 'react';
import {
  Database, FileSpreadsheet, HardDrive, Download, CheckCircle2,
  AlertCircle, ExternalLink, ShieldCheck, RefreshCw, Folder, Search
} from 'lucide-react';

const datasetFiles = [
  {
    name: 'state_risk_scores.csv',
    category: 'Model Output',
    size: '4.8 KB',
    records: '51 states + D.C.',
    source: 'Trained Logistic Regression Pipeline',
    status: 'Verified',
    date: '2026-09-18',
    downloadUrl: '/data/state_risk_scores.csv'
  },
  {
    name: 'individual_predictions.csv',
    category: 'Model Output',
    size: '142 KB',
    records: '2,000 Microdata rows',
    source: 'Holdout Test Inference Split',
    status: 'Verified',
    date: '2026-09-18',
    downloadUrl: '/data/individual_predictions.csv'
  },
  {
    name: 'eda_summary.json',
    category: 'Metadata',
    size: '1.2 KB',
    records: 'System Metrics & AUC',
    source: 'Evaluation Pipeline',
    status: 'Verified',
    date: '2026-09-18',
    downloadUrl: '/data/eda_summary.json'
  },
  {
    name: 'Census State-to-State (2010–2019)',
    category: 'Raw Ingestion',
    size: '48.2 MB',
    records: '10 Annual Tables',
    source: 'U.S. Census Bureau Demographics',
    status: 'Active',
    date: '2026-09-17',
    externalUrl: 'https://www.census.gov/data/tables/time-series/demo/geographic-mobility/state-to-state-migration.html'
  },
  {
    name: 'IPUMS CPS Demographic Microdata',
    category: 'Raw Ingestion',
    size: '310 MB',
    records: '1,400,000 Individuals',
    source: 'IPUMS Current Population Survey',
    status: 'Active',
    date: '2026-09-17',
    externalUrl: 'https://cps.ipums.org/'
  },
  {
    name: 'eda_and_modeling.ipynb',
    category: 'Jupyter Artifact',
    size: '1.2 MB',
    records: 'Full ML Pipeline & EDA',
    source: 'Submission Code Notebook',
    status: 'Compiled',
    date: '2026-09-18',
    downloadUrl: '#'
  }
];

export default function FileManagement() {
  const [search, setSearch] = useState('');

  const filteredFiles = datasetFiles.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase()) ||
    f.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-400" />
            Data Sources & File Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Centralized data lake containing census flow tables, IPUMS CPS microdata, and evaluation artifacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            Data Integrity: 100% Validated
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Data Volume</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">358.4 MB</p>
          <p className="text-[11px] text-gray-400 mt-1">10 Census matrices + 1.4M microdata</p>
        </div>
        <div className="admin-card p-4.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Total Records Ingested</p>
          <p className="text-2xl font-black text-indigo-400 mt-1 font-mono">1,402,051</p>
          <p className="text-[11px] text-gray-400 mt-1">Fully cleaned and standardized</p>
        </div>
        <div className="admin-card p-4.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Pipeline Status</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">Ready & Synced</p>
          <p className="text-[11px] text-gray-400 mt-1">Direct static distribution</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-3"
             style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search datasets, formats, or sources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Showing {filteredFiles.length} files
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dataset / Artifact</th>
                <th>Category</th>
                <th>Size</th>
                <th>Records</th>
                <th>Origin / Authority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                        <FileSpreadsheet size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">{file.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">Updated: {file.date}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-medium text-gray-300">{file.category}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-gray-400">{file.size}</span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-300">{file.records}</span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-400">{file.source}</span>
                  </td>
                  <td>
                    <span className="badge badge-low flex items-center gap-1">
                      <CheckCircle2 size={11} /> {file.status}
                    </span>
                  </td>
                  <td>
                    {file.downloadUrl ? (
                      <a
                        href={file.downloadUrl}
                        download
                        className="btn btn-secondary text-xs px-2.5 py-1.5 inline-flex"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>
                    ) : (
                      <a
                        href={file.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary text-xs px-2.5 py-1.5 inline-flex"
                      >
                        <ExternalLink size={13} />
                        <span>Source</span>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
