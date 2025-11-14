import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  console.log('Layout - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <NavBar />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1,
          minHeight: '100vh'
        }}
      >
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Height of the Header
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#f8fafc',
            width: '100%',
            overflow: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}