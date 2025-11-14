import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import LeadTable from './pages/LeadTable';
import PropertyExplorer from './pages/PropertyExplorer';
import UserTable from './pages/UserTable';
import CreateEditLeadForm from './pages/CreateEditLeadForm';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading component
function AuthLoading() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <div>Loading authentication...</div>
    </Box>
  );
}

// Component for the lead creation/editing page
function CreateEditLeadPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ p: 3 }}>
      <CreateEditLeadForm 
        open={true} 
        onClose={() => window.history.back()} 
      />
    </Box>
  );
}

// Enhanced ProtectedRoute component with role-based access
function RoleProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, user, role, isLoading } = useAuth();
  
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRole = role || user?.role;
  
  if (!userRole) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <div>Unable to determine user role. Please log in again.</div>
      </Box>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Your role: <strong>{userRole}</strong></p>
          <p>Required roles: {allowedRoles.join(', ')}</p>
        </div>
      </Box>
    );
  }

  return <>{children}</>;
}

// Basic ProtectedRoute for authenticated access only
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated, user, role, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  console.log('AppContent - Auth State:', { isAuthenticated, user, role });

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/leads" 
          element={
            <ProtectedRoute>
              <LeadTable />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/leads/new" 
          element={
            <ProtectedRoute>
              <CreateEditLeadPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/leads/edit/:id" 
          element={
            <ProtectedRoute>
              <CreateEditLeadPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/properties" 
          element={
            <ProtectedRoute>
              <PropertyExplorer />
            </ProtectedRoute>
          } 
        />
        
        {/* User Management - Role-based access */}
        <Route 
          path="/users" 
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'SALES']}>
              <UserTable />
            </RoleProtectedRoute>
          } 
        />
        
        {/* Default routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;