import { useState, useMemo } from 'react';
import {
  Search, ChevronUp, ChevronDown, Download, Eye, X,
  Filter, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { getRiskBadgeClass } from '../utils/dataUtils';

export default function PredictionTable({ data, showControls = true }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [sortField, setSortField] = useState('RISK_SCORE');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const pageSize = 15;

  // Extract unique state names
  const uniqueStates = useMemo(() => {
    if (!data) return [];
    const states = Array.from(new Set(data.map(d => d.STATE_NAME).filter(Boolean))).sort();
    return states;
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data || [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.STATE_NAME?.toLowerCase().includes(q) ||
        r.RISK_CATEGORY?.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'All') {
      result = result.filter(r => r.RISK_CATEGORY === riskFilter);
    }
    if (stateFilter !== 'All') {
      result = result.filter(r => r.STATE_NAME === stateFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return result;
  }, [data, search, riskFilter, stateFilter, sortField, sortDir]);

  const pageData = filteredData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-500 opacity-50" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-400" />
      : <ChevronDown className="w-3 h-3 text-indigo-400" />;
  };

  const exportCSV = () => {
    const headers = ['State', 'Year', 'Age', 'Income', 'Risk Score', 'Risk Category'];
    const rows = filteredData.map(r => [
      r.STATE_NAME,
      r.YEAR,
      r.AGE,
      r.INCOME_CLEAN?.toFixed(0),
      r.RISK_SCORE?.toFixed(4),
      r.RISK_CATEGORY
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="admin-card overflow-hidden">
      {/* Controls Bar */}
      {showControls && (
        <div
          className="p-4 border-b flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          {/* Search + State selector */}
          <div className="flex items-center flex-wrap gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search state name, risk category..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="form-input pl-9 text-xs"
              />
            </div>

            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setPage(0); }}
              className="form-input w-auto text-xs font-medium cursor-pointer"
            >
              <option value="All">All States ({uniqueStates.length})</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Risk Filters & Export */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              {['All', 'High Risk', 'Medium Risk', 'Low Risk'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setRiskFilter(filter); setPage(0); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    riskFilter === filter
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={exportCSV}
              className="btn btn-outline text-xs px-3 py-1.5"
              title="Export Current Filtered Rows to CSV"
            >
              <Download size={14} className="text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              {[
                { key: 'STATE_NAME', label: 'Jurisdiction / State' },
                { key: 'YEAR', label: 'Census Year' },
                { key: 'AGE', label: 'Age Cohort' },
                { key: 'INCOME_CLEAN', label: 'Household Income' },
                { key: 'RISK_SCORE', label: 'Predicted Flight Risk' },
                { key: 'RISK_CATEGORY', label: 'Risk Tier' },
                { key: 'actions', label: 'Inspector' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'actions' && handleSort(col.key)}
                  className={col.key !== 'actions' ? 'cursor-pointer hover:text-white transition-colors' : ''}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.key !== 'actions' && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length > 0 ? (
              pageData.map((row, i) => {
                const scorePct = (row.RISK_SCORE || 0) * 100;
                return (
                  <tr key={i} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedRecord(row)}>
                    <td>
                      <span className="font-bold text-white text-xs">{row.STATE_NAME}</span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-gray-400">{row.YEAR}</span>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-gray-300">{row.AGE} yrs</span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-gray-300">
                        ${row.INCOME_CLEAN ? Math.round(row.INCOME_CLEAN).toLocaleString() : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 h-2 bg-black/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${scorePct}%`,
                              background:
                                scorePct > 50
                                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                  : scorePct > 35
                                  ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                                  : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-white">
                          {row.RISK_SCORE?.toFixed(4)} ({scorePct.toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          row.RISK_CATEGORY === 'High Risk'
                            ? 'badge-high'
                            : row.RISK_CATEGORY === 'Medium Risk'
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {row.RISK_CATEGORY}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(row);
                        }}
                        className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="View Record Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                  No individual prediction records matched the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <p className="text-gray-400">
          Displaying <strong className="text-white">{filteredData.length > 0 ? page * pageSize + 1 : 0}</strong> to{' '}
          <strong className="text-white">{Math.min((page + 1) * pageSize, filteredData.length)}</strong> of{' '}
          <strong className="text-white">{filteredData.length.toLocaleString()}</strong> individual records
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn btn-secondary text-xs px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1 font-mono text-xs text-gray-300">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn btn-secondary text-xs px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Individual Record Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm modal-enter">
          <div
            className="w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-400" />
                  Individual Risk Profile Audit
                </h3>
                <p className="text-xs text-gray-400">Record ID: {selectedRecord.STATE_NAME}-{selectedRecord.YEAR}-{selectedRecord.AGE}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <span className="text-gray-400">Jurisdiction</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedRecord.STATE_NAME}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <span className="text-gray-400">Census Year</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedRecord.YEAR}</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <span className="text-gray-400">Age Cohort</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedRecord.AGE} Years</p>
              </div>
              <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <span className="text-gray-400">Adjusted Income</span>
                <p className="text-sm font-bold text-white mt-0.5">${selectedRecord.INCOME_CLEAN?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">Logistic Regression Flight Probability</span>
                <span className="text-sm font-mono font-bold text-indigo-400">
                  {((selectedRecord.RISK_SCORE || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(selectedRecord.RISK_SCORE || 0) * 100}%`,
                    background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)'
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 font-mono">
                <span>0% Safe</span>
                <span>Decision Threshold: 50%</span>
                <span>100% Definite Flight</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-gray-300 leading-relaxed">
              <p className="font-bold text-indigo-300 mb-1">Model Rationale:</p>
              Probability is computed from demographic microdata features normalized with state-level out-migration flow indices.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="btn btn-primary text-xs px-5 py-2"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
