import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-xl border shadow-xl text-xs"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <p className="font-bold text-white mb-1">{label}</p>
        <p className="text-indigo-400 font-mono font-medium">
          Predicted Outflow Risk: {(payload[0].value * 100).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function MigrationChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = [...data]
    .sort((a, b) => b.avg_risk_score - a.avg_risk_score)
    .slice(0, 10)
    .map(d => ({
      name: d.STATE_NAME,
      score: d.avg_risk_score,
    }));

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Flame size={18} className="text-rose-400" />
            Top 10 Outflow Risk States
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Average modeled migration flight score (2018–2019 predictions)
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Rank 1: {chartData[0]?.name}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
          <XAxis
            type="number"
            domain={[0, 0.65]}
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={20}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
