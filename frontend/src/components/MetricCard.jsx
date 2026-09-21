import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend = 'neutral',
  accent = 'indigo',
  delay = 0
}) {
  const accentClassMap = {
    indigo: 'stat-card-indigo',
    emerald: 'stat-card-emerald',
    rose: 'stat-card-rose',
    amber: 'stat-card-amber',
    sky: 'stat-card-sky',
  };

  const accentColorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-rose-400' : trend === 'down' ? 'text-emerald-400' : 'text-gray-400';

  return (
    <div
      className={`stat-card ${accentClassMap[accent] || 'stat-card-indigo'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accentColorMap[accent] || accentColorMap.indigo}`}>
            <Icon size={20} />
          </div>
          {trend !== 'neutral' && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendColor}`}>
              <TrendIcon size={12} />
              <span>{trend === 'up' ? '+High' : '-Low'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
