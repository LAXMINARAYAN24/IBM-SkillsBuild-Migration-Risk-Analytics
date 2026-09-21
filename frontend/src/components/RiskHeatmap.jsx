import { useState } from 'react';
import { Map, Info } from 'lucide-react';
import { STATE_ABBR } from '../utils/dataUtils';

export default function RiskHeatmap({ data }) {
  const [hoveredState, setHoveredState] = useState(null);
  if (!data || data.length === 0) return null;

  const maxScore = Math.max(...data.map(d => d.avg_risk_score));
  const minScore = Math.min(...data.map(d => d.avg_risk_score));

  const getHeatStyle = (score) => {
    const normalized = (score - minScore) / (maxScore - minScore);
    if (normalized > 0.75) return { background: 'linear-gradient(135deg, #ef4444, #dc2626)', text: 'text-white' };
    if (normalized > 0.5) return { background: 'linear-gradient(135deg, #f97316, #ea580c)', text: 'text-white' };
    if (normalized > 0.25) return { background: 'linear-gradient(135deg, #f59e0b, #d97706)', text: 'text-white' };
    return { background: 'linear-gradient(135deg, #10b981, #059669)', text: 'text-white' };
  };

  const sortedData = [...data].sort((a, b) => b.avg_risk_score - a.avg_risk_score);

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Map size={18} className="text-indigo-400" />
            50-State + D.C. Migration Heat Grid
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Hover over any state tile to inspect modeled flight metrics
          </p>
        </div>
        {hoveredState && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono">
            <span className="font-bold text-white">{hoveredState.STATE_NAME}:</span>
            <span className="text-indigo-400">{(hoveredState.avg_risk_score * 100).toFixed(2)}% Risk</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-1.5 py-1">
        {sortedData.map((state) => {
          const abbr = STATE_ABBR[state.STATE_NAME] || state.STATE_NAME.slice(0, 2).toUpperCase();
          const { background, text } = getHeatStyle(state.avg_risk_score);

          return (
            <div
              key={state.STATE_NAME}
              onMouseEnter={() => setHoveredState(state)}
              onMouseLeave={() => setHoveredState(null)}
              className={`group relative rounded-lg p-2 text-center cursor-pointer transition-all duration-150 hover:scale-115 hover:z-20 hover:shadow-xl ${text}`}
              style={{ background }}
            >
              <p className="text-xs font-bold leading-none">{abbr}</p>
              <p className="text-[9px] opacity-90 font-mono mt-0.5">
                {(state.avg_risk_score * 100).toFixed(0)}%
              </p>

              {/* Tooltip Card */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div
                  className="p-3 rounded-xl border shadow-2xl whitespace-nowrap text-left text-xs"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <p className="text-xs font-bold text-white border-b pb-1 mb-1.5" style={{ borderColor: 'var(--border-color)' }}>
                    {state.STATE_NAME} ({abbr})
                  </p>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Risk Score:</span>
                      <span className="font-bold text-indigo-400">{(state.avg_risk_score * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">High-Risk Share:</span>
                      <span className="text-rose-400">{(state.high_risk_pct * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Actual Census Outflow:</span>
                      <span className="text-emerald-400">{(state.actual_migration_rate * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-3 mt-5 pt-3 border-t text-[11px]"
           style={{ borderColor: 'var(--border-color)' }}>
        <span className="text-gray-400 font-medium">Risk Spectrum:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-gray-400">Low (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-gray-400">Moderate (30–40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-gray-400">Elevated (40–50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-gray-400">Critical (&gt;50%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
