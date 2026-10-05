import { useState, useEffect } from 'react';
import { MapPin, Search, Download, ArrowUpDown, Filter, ShieldCheck, Flame } from 'lucide-react';
import { loadCSV } from '../utils/dataUtils';
import RiskHeatmap from '../components/RiskHeatmap';

export default function StateAnalytics() {
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('avg_risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadCSV('/data/state_risk_scores.csv');
        setStates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const filteredStates = states
    .filter(s => s.STATE_NAME?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400">Loading spatial risk metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-indigo-400" />
            51 Jurisdictions State Risk Metrics
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Calibrated 2018–2019 estimates, high-threshold screening shares, and observed holdout rates
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <RiskHeatmap data={states} />

      {/* State Metric Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-3"
             style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {filteredStates.length} states listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('STATE_NAME')} className="cursor-pointer hover:text-white">
                  State / Jurisdiction <ArrowUpDown size={12} className="inline ml-1" />
                </th>
                <th onClick={() => handleSort('avg_risk_score')} className="cursor-pointer hover:text-white">
                  Average Risk Score <ArrowUpDown size={12} className="inline ml-1" />
                </th>
                <th onClick={() => handleSort('high_risk_pct')} className="cursor-pointer hover:text-white">
                  High Risk Share <ArrowUpDown size={12} className="inline ml-1" />
                </th>
                <th onClick={() => handleSort('actual_migration_rate')} className="cursor-pointer hover:text-white">
                  Census Migration Rate <ArrowUpDown size={12} className="inline ml-1" />
                </th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {filteredStates.map((s, idx) => (
                <tr key={s.STATE_NAME}>
                  <td className="font-bold text-white text-xs">
                    <span className="text-gray-500 font-mono mr-2">#{idx + 1}</span>
                    {s.STATE_NAME}
                  </td>
                  <td className="font-mono text-xs font-semibold text-indigo-400">
                    {(s.avg_risk_score * 100).toFixed(2)}%
                  </td>
                  <td className="font-mono text-xs text-gray-300">
                    {(s.high_risk_pct * 100).toFixed(1)}%
                  </td>
                  <td className="font-mono text-xs text-gray-400">
                    {(s.actual_migration_rate * 100).toFixed(2)}%
                  </td>
                  <td>
                    <span className={`badge ${s.high_risk_pct >= 0.15 ? 'badge-high' : s.high_risk_pct >= 0.08 ? 'badge-medium' : 'badge-low'}`}>
                      {s.high_risk_pct >= 0.15 ? 'Elevated screening share' : s.high_risk_pct >= 0.08 ? 'Moderate screening share' : 'Lower screening share'}
                    </span>
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
