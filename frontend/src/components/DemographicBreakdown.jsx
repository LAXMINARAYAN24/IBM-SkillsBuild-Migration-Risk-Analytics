import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, DollarSign, Calendar } from 'lucide-react';

const RISK_COLORS = {
  'High Risk': '#f43f5e',
  'Medium Risk': '#f59e0b',
  'Low Risk': '#10b981',
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DemographicBreakdown({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  // Risk category distribution
  const riskCounts = predictions.reduce((acc, p) => {
    const cat = p.RISK_CATEGORY || 'Medium Risk';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const riskData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));

  // Age distribution of high risk
  const ageGroups = { '18–24': 0, '25–34': 0, '35–44': 0, '45–54': 0, '55–64': 0, '65+': 0 };
  predictions.forEach(p => {
    const age = p.AGE;
    if (age < 25) ageGroups['18–24']++;
    else if (age < 35) ageGroups['25–34']++;
    else if (age < 45) ageGroups['35–44']++;
    else if (age < 55) ageGroups['45–54']++;
    else if (age < 65) ageGroups['55–64']++;
    else ageGroups['65+']++;
  });

  const maxAge = Math.max(...Object.values(ageGroups));

  // Income distribution
  const incomeGroups = { '<$25K': 0, '$25–50K': 0, '$50–75K': 0, '$75–100K': 0, '$100K+': 0 };
  predictions.forEach(p => {
    const inc = p.INCOME_CLEAN || 0;
    if (inc < 25000) incomeGroups['<$25K']++;
    else if (inc < 50000) incomeGroups['$25–50K']++;
    else if (inc < 75000) incomeGroups['$50–75K']++;
    else if (inc < 100000) incomeGroups['$75–100K']++;
    else incomeGroups['$100K+']++;
  });

  const maxIncome = Math.max(...Object.values(incomeGroups));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Risk Distribution Donut */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-indigo-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Risk Category Breakdown</h4>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
            >
              {riskData.map((entry) => (
                <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#6b7280'} stroke="var(--bg-card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'white'
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(val) => <span className="text-gray-300 font-medium">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Age Distribution */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Age Group Representation</h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">N=2,000</span>
        </div>
        <div className="space-y-2.5 mt-2">
          {Object.entries(ageGroups).map(([label, count]) => {
            const pct = (count / maxAge) * 100;
            return (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-gray-400 w-12 font-medium flex-shrink-0">{label}</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden bg-black/20">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #6366f1, #0ea5e9)'
                    }}
                  ></div>
                </div>
                <span className="text-[11px] font-mono text-gray-300 w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Income Distribution */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Personal Income Strata</h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Microdata</span>
        </div>
        <div className="space-y-2.5 mt-2">
          {Object.entries(incomeGroups).map(([label, count]) => {
            const pct = (count / maxIncome) * 100;
            return (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-gray-400 w-14 font-medium flex-shrink-0">{label}</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden bg-black/20">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    }}
                  ></div>
                </div>
                <span className="text-[11px] font-mono text-gray-300 w-10 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
