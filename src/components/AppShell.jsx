import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import ToastContainer from './ToastContainer';
import { useApp } from '../context/AppContext';

export default function AppShell({ children }) {
  const { currentRoute } = useApp();

  // On full-screen public pages like landing, optionally allow full-width while still keeping header/sidebar or custom styling
  const isLanding = currentRoute === 'landing';

  return (
    <div className="app-layout">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="app-main-viewport">
        <Header />

        <main className={isLanding ? 'landing-viewport' : 'page-container'}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Toast Feedback Alerts */}
      <ToastContainer />
    </div>
  );
}
