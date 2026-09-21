import { useState, useEffect, useRef } from 'react';
import {
  Search, Bell, Moon, Sun, Globe, ChevronDown, Check,
  User, Settings, LogOut, HelpCircle, Shield, AlertTriangle, Database, Zap, Menu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const languages = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const initialNotifications = [
  {
    id: 1,
    title: 'High Outflow Risk Alert',
    desc: 'Wyoming migration probability reached 52.4%',
    time: '5m ago',
    unread: true,
    type: 'alert',
    icon: AlertTriangle,
    color: 'text-rose-400 bg-rose-500/10'
  },
  {
    id: 2,
    title: 'Model Validation Complete',
    desc: 'Logistic Regression AUC evaluated at 0.7248',
    time: '35m ago',
    unread: true,
    type: 'success',
    icon: Zap,
    color: 'text-emerald-400 bg-emerald-500/10'
  },
  {
    id: 3,
    title: 'Census Datasets Ingested',
    desc: '1,400,000 IPUMS & Census records active',
    time: '2h ago',
    unread: false,
    type: 'info',
    icon: Database,
    color: 'text-sky-400 bg-sky-500/10'
  },
];

export default function TopBar({ sidebarCollapsed, setSidebarCollapsed, theme, setTheme }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const langRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Toggle theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const currentLangObj = languages.find(l => l.code === selectedLang) || languages[0];

  const quickSearchResults = [
    { title: 'Executive Risk Dashboard', path: '/', category: 'Analytics' },
    { title: 'Data Explorer & Scatter Plot', path: '/explorer', category: 'Analytics' },
    { title: 'Individual Predictions Table', path: '/predictions', category: 'Management' },
    { title: 'AI Risk Intelligence Copilot', path: '/ai-chat', category: 'Applications' },
    { title: 'Dataset & File Management', path: '/files', category: 'Management' },
    { title: 'ETL Pipeline & Model Tasks', path: '/tasks', category: 'Applications' },
    { title: 'Model Settings & Thresholds', path: '/settings', category: 'Pages' },
    { title: 'IPUMS & Census Documentation', path: '/help', category: 'Support' },
  ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header
      className="sticky top-0 z-40 h-[66px] px-4 lg:px-6 flex items-center justify-between border-b transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left: Sidebar toggle + Search */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1 hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search state risk, analytics, predictions, or metrics... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchModal(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) setShowSearchModal(true);
            }}
            className="w-full pl-10 pr-12 py-2 rounded-xl text-xs sm:text-sm font-normal transition-all"
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono rounded border text-gray-400 hidden md:inline-block"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
          >
            ⌘K
          </kbd>

          {/* Quick Search Dropdown Modal */}
          {showSearchModal && (
            <div
              className="absolute left-0 top-full mt-2 w-full rounded-xl p-2 z-50 dropdown-enter"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--dropdown-shadow)',
              }}
            >
              <div className="text-[11px] font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Quick Results
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {quickSearchResults.length > 0 ? (
                  quickSearchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigate(res.path);
                        setShowSearchModal(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors"
                    >
                      <span className="font-medium text-white">{res.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                        {res.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-gray-400">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Language, Theme, Notifications, User */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Real-time Status indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
             style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Census & IPUMS Live</span>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-white/5 transition-colors border"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            title="Select Language"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="hidden md:inline text-xs font-medium">{currentLangObj.name.split(' ')[0]}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 z-50 dropdown-enter"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--dropdown-shadow)',
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setLangOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {selectedLang === lang.code && <Check size={14} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-400 hover:text-white transition-all border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={17} className="text-indigo-400 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-gray-400 hover:text-white transition-all border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
            title="System Alerts & Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50 dropdown-enter"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--dropdown-shadow)',
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-white/[0.03] ${
                        n.unread ? 'bg-indigo-500/[0.04]' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{n.desc}</p>
                      </div>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-2.5 border-t text-center"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <Link
                  to="/tasks"
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] font-semibold text-indigo-400 hover:underline"
                >
                  View Automated Pipelines & Logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-white/5 transition-colors border"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              SS
            </div>
            <div className="text-left hidden lg:block pr-1">
              <p className="text-xs font-bold leading-none text-white">Sahul S.</p>
              <p className="text-[10px] text-indigo-400 font-medium mt-0.5">Lead Risk Analyst</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 z-50 dropdown-enter"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--dropdown-shadow)',
              }}
            >
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-xs font-bold text-white">Sahul S.</p>
                <p className="text-[11px] text-gray-400 truncate">sahul.analyst@ibm-risk.ai</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Role: Administrator
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  <span>Analyst Profile & Roles</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={15} className="text-gray-400" />
                  <span>Model Settings & Thresholds</span>
                </Link>
                <Link
                  to="/help"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <HelpCircle size={15} className="text-gray-400" />
                  <span>Documentation & Guide</span>
                </Link>
              </div>

              <div className="border-t pt-1" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    alert('Session reset. Re-authenticated as Lead Risk Analyst.');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Sign Out / Switch User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
