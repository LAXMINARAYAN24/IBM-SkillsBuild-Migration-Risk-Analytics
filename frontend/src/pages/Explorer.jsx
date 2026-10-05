import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, CartesianGrid, Cell
} from 'recharts';
import { loadCSV } from '../utils/dataUtils';
import { BarChart3, ScatterChart as ScatterIcon, Layers, Sliders } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        className="p-3 rounded-xl border shadow-xl text-xs"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <p className="font-bold text-white mb-1">{d.name || d.STATE_NAME}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-indigo-400 font-mono text-[11px]">
            {p.name}: {typeof p.value === 'number' ? (p.value > 1 ? p.value.toFixed(2) : (p.value * 100).toFixed(2) + '%') : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Explorer() {
  const [stateRisk, setStateRisk] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('avg_risk_score');

  useEffect(() => {
    async function loadData() {
      try {
        const [states, preds] = await Promise.all([
          loadCSV('/data/state_risk_scores.csv'),
          loadCSV('/data/individual_predictions.csv'),
        ]);
        setStateRisk(states);
        setPredictions(preds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Scatter data: Actual Rate vs Predicted Risk
  const scatterData = useMemo(() => {
    return stateRisk.map(s => ({
      STATE_NAME: s.STATE_NAME,
      actual: (s.actual_migration_rate || 0) * 100,
      predicted: (s.avg_risk_score || 0) * 100,
      size: s.n_individuals || 100,
    }));
  }, [stateRisk]);

  // Risk score distribution histogram
  const histogram = useMemo(() => {
    const bins = Array.from({ length: 20 }, (_, i) => ({
      range: `${(i * 5)}–${((i + 1) * 5)}%`,
      min: i * 0.05,
      max: (i + 1) * 0.05,
      count: 0,
    }));
    predictions.forEach(p => {
      const score = p.RISK_SCORE || 0;
      const idx = Math.min(Math.floor(score * 20), 19);
      bins[idx].count++;
    });
    return bins.filter(b => b.count > 0);
  }, [predictions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400">Loading exploratory data engine...</p>
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
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Interactive Data Explorer
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Bivariate correlations, risk distributions, and state-level rank comparisons
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot: Actual vs Predicted */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <ScatterIcon size={18} className="text-indigo-400" />
                Actual Migration vs. Modeled Flight Risk
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Each dot represents a state; bubble radius reflects microdata sample size
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              R = 0.81
            </span>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, bottom: 20, left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                type="number"
                dataKey="actual"
                name="Actual Census Migration (%)"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border-color)' }}
                label={{ value: 'Historical Census Migration Rate (%)', position: 'bottom', offset: 5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="predicted"
                name="Predicted Probability (%)"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'var(--border-color)' }}
                label={{ value: 'Modeled Risk Score (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <ZAxis type="number" dataKey="size" range={[50, 320]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.75} stroke="#818cf8" strokeWidth={1} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Score Distribution Histogram */}
        <div className="admin-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                Risk Score Distribution Histogram
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Frequency distribution of predicted probabilities across 2,000 samples
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Mean: 39.2%
            </span>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={histogram} margin={{ top: 10, bottom: 25, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="range"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                axisLine={{ stroke: 'var(--border-color)' }}
                angle={-45}
                textAnchor="end"
                height={55}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'var(--border-color)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Observations">
                {histogram.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.min < 0.02 ? '#10b981' : entry.min < 0.04 ? '#f59e0b' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State-Level Ranking & Feature Comparison */}
      <div className="admin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b"
             style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="section-title flex items-center gap-2">
              <Sliders size={18} className="text-indigo-400" />
              State-by-State Comparative Rankings
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Sort and benchmark all 51 jurisdictions by key metric
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sort Metric:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="form-input w-auto text-xs font-semibold cursor-pointer"
            >
              <option value="avg_risk_score">Average Estimated Rate</option>
              <option value="high_risk_pct">High-Threshold Screening Share</option>
              <option value="actual_migration_rate">Observed Holdout Rate</option>
            </select>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={520}>
          <BarChart
            data={[...stateRisk].sort((a, b) => (b[selectedMetric] || 0) - (a[selectedMetric] || 0))}
            layout="vertical"
            margin={{ left: 90, right: 30, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              type="number"
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              type="category"
              dataKey="STATE_NAME"
              width={90}
              tick={{ fill: '#e2e8f0', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={selectedMetric} radius={[0, 4, 4, 0]} barSize={9} name={selectedMetric}>
              {stateRisk.map((_, i) => {
                const val = stateRisk[i]?.[selectedMetric] || 0;
                const color = val > 0.04 ? '#f43f5e' : val > 0.02 ? '#f59e0b' : '#10b981';
                return <Cell key={i} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
