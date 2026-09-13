import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/AppShell';
import ErrorBoundary from './components/ErrorBoundary';

// Primary Views
import LandingPage from './components/LandingPage';
import HowItWorks from './components/HowItWorks';
import Dashboard from './components/Dashboard';
import DigitalWallet from './components/DigitalWallet';
import CredentialsList from './components/CredentialsList';
import CredentialDetail from './components/CredentialDetail';
import IssueCredentialWizard from './components/IssueCredentialWizard';
import QRVerificationView from './components/QRVerificationView';
import VerificationResultView from './components/VerificationResultView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import ActivityView from './components/ActivityView';
import LoginView from './components/LoginView';
import BlockchainExplorer from './components/BlockchainExplorer';
import AdminPortal from './components/AdminPortal';

function AppContent() {
  const { currentRoute, isAuthenticated, userProfile } = useApp();

  const publicRoutes = ['landing', 'how-it-works', 'login', 'verify', 'verification-result', 'explorer', 'blockchain'];

  if (!isAuthenticated && !publicRoutes.includes(currentRoute)) {
    return <LoginView />;
  }

  // Admin route protection
  if (currentRoute === 'admin') {
    const isAdmin = userProfile?.role?.toLowerCase().includes('admin');
    if (!isAdmin) {
      return <Dashboard />;
    }
  }

  switch (currentRoute) {
    case 'login':
      return <LoginView />;
    case 'landing':
      return <LandingPage />;
    case 'how-it-works':
      return <HowItWorks />;
    case 'dashboard':
      return <Dashboard />;
    case 'wallet':
      return <DigitalWallet />;
    case 'credentials':
      return <CredentialsList />;
    case 'credential-detail':
      return <CredentialDetail />;
    case 'issue':
      return <IssueCredentialWizard />;
    case 'verify':
      return <QRVerificationView />;
    case 'verification-result':
      return <VerificationResultView />;
    case 'explorer':
    case 'blockchain':
      return <BlockchainExplorer />;
    case 'admin':
      return <AdminPortal />;
    case 'profile':
      return <ProfileView />;
    case 'settings':
      return <SettingsView />;
    case 'activity':
      return <ActivityView />;
    default:
      return isAuthenticated ? <Dashboard /> : <LandingPage />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <AppShell>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </AppShell>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
