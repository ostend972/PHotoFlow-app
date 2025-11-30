



import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { NewProject } from './pages/NewProject';
import { ImageEditor } from './pages/ImageEditor';
import { Projects } from './pages/Projects';
import { Clients } from './pages/Clients';
import { Models } from './pages/Models';
import { Settings } from './pages/Settings';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Menu, Loader2 } from 'lucide-react';
import { api } from './lib/api';
import { AppSettings } from './types';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [initialSettings, setInitialSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const settings = await api.getSettings();
        setInitialSettings(settings);
        
        if (settings.general.isFirstRun) {
          setIsFirstRun(true);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleOnboardingComplete = () => {
    setIsFirstRun(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  if (isFirstRun && initialSettings) {
    return (
      <OnboardingWizard 
        initialSettings={initialSettings} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-background-secondary overflow-hidden">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
          {/* Mobile Header */}
          <div className="md:hidden p-4 border-b border-border bg-white flex items-center justify-between shrink-0">
            <span className="font-semibold text-lg">PhotoFlow</span>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new-project" element={<NewProject />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/models" element={<Models />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/ai-studio" element={<ImageEditor />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;