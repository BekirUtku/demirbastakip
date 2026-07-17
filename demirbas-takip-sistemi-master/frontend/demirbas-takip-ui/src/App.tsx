import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Assets from './pages/Assets';
import Personnel from './pages/Personnel';
import Assignments from './pages/Assignments';
import MailSettingsPage from './pages/MailSettings';
import BarcodeScanner from './pages/BarcodeScanner';
import Companies from './pages/Companies';
import Reports from './pages/Reports';
import ErrorBoundary from './components/common/ErrorBoundary';
import EmailSignatures from './pages/EmailSignatures';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="main-layout">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <AppLayout><Categories /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/assets" element={
            <ProtectedRoute>
              <AppLayout><ErrorBoundary pageName="assets"><Assets /></ErrorBoundary></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/email-signatures" element={
            <ProtectedRoute>
              <AppLayout><ErrorBoundary pageName="email-signatures"><EmailSignatures /></ErrorBoundary></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/personnel" element={
            <ProtectedRoute>
              <AppLayout><ErrorBoundary pageName="personnel"><Personnel /></ErrorBoundary></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <AppLayout><ErrorBoundary pageName="assignments"><Assignments /></ErrorBoundary></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/companies" element={
            <ProtectedRoute>
              <AppLayout><Companies /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/barcode-scanner" element={
            <ProtectedRoute>
              <AppLayout><BarcodeScanner /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <AppLayout><Reports /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/mail-settings" element={
            <ProtectedRoute>
              <AppLayout><MailSettingsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
