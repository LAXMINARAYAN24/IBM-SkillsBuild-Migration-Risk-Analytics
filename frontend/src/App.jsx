import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Pages
import Dashboard from './pages/Dashboard';
import StateAnalytics from './pages/StateAnalytics';
import Explorer from './pages/Explorer';
import Predictions from './pages/Predictions';
import FileManagement from './pages/FileManagement';
import Tasks from './pages/Tasks';
import AiChat from './pages/AiChat';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import HelpDocs from './pages/HelpDocs';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Content Area with Dynamic Margin */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
          }`}
        >
          {/* Header / TopBar */}
          <TopBar
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            theme={theme}
            setTheme={setTheme}
          />

          {/* Main Page Routes */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<StateAnalytics />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/files" element={<FileManagement />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/ai-chat" element={<AiChat />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpDocs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
