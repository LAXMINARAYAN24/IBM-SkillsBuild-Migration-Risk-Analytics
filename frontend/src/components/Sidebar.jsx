import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, ScatterChart as ScatterIcon, Table2,
  Database, CheckSquare, MessageSquare, FileText, User,
  Settings, HelpCircle, Shield, ChevronLeft, ChevronRight,
  Flame, Sparkles, MapPin, Radio
} from 'lucide-react';

const navigationGroups = [
  {
    category: 'Analytics',
    items: [
      {
        to: '/',
        icon: LayoutDashboard,
        label: 'Analytics Dashboard',
        badge: 'Live',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      },
      {
        to: '/analytics',
        icon: MapPin,
        label: 'State Risk Metrics',
        badge: '51 States',
        badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
      },
      {
        to: '/explorer',
        icon: BarChart3,
        label: 'Data Explorer',
      },
    ]
  },
  {
    category: 'Management',
    items: [
      {
        to: '/predictions',
        icon: Table2,
        label: 'Individual Predictions',
        badge: '2,000',
        badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      },
      {
        to: '/files',
        icon: Database,
        label: 'Data & File Center',
      },
      {
        to: '/tasks',
        icon: CheckSquare,
        label: 'Pipelines & Tasks',
        badge: 'Active',
        badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30'
      },
    ]
  },
  {
    category: 'Applications',
    items: [
      {
        to: '/ai-chat',
        icon: MessageSquare,
        label: 'AI Risk Copilot',
        badge: 'AI',
        badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
      },
      {
        to: '/reports',
        icon: FileText,
        label: 'Executive Reports',
      },
    ]
  },
  {
    category: 'Pages & Support',
    items: [
      {
        to: '/profile',
        icon: User,
        label: 'Analyst Profile & RBAC',
      },
      {
        to: '/settings',
        icon: Settings,
        label: 'Model Settings',
      },
      {
        to: '/help',
        icon: HelpCircle,
        label: 'Documentation & Help',
      },
    ]
  }
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center h-[66px] px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                MigrateRisk <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">v2.4</span>
              </h1>
              <p className="text-[10px] font-medium" style={{ color: 'var(--accent-secondary)' }}>
                Intelligence Platform
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle (visible when expanded) */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navigationGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            {!collapsed && (
              <p
                className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.category}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  isActive
                    ? 'nav-link-active'
                    : 'nav-link'
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate text-xs font-medium">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom Pro / Info Card & Collapse Button */}
      <div className="p-3 border-t space-y-2.5" style={{ borderColor: 'var(--border-color)' }}>
        {!collapsed ? (
          <div
            className="p-3 rounded-xl border relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Radio size={13} className="text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-white">System Status</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                OPERATIONAL
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-gray-400">
              IPUMS CPS + U.S. Census Bureau<br />
              1.405M eligible microdata records
            </p>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
