// src/pages/PropertyExplorer.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Business,
  Apartment,
  MeetingRoom,
  Person,
  Refresh,
  LocationOn,
  Star,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { propertyAPI, isUsingMockData } from '../api/apiClient';
import SiteTable from '../components/property/SiteTable';
import BuildingTable from '../components/property/BuildingTable';
import UnitTable from '../components/property/UnitTable';
import OwnerTable from '../components/property/OwnerTable';
import SiteFormDialog from '../components/property/SiteFormDialog';
import BuildingFormDialog from '../components/property/BuildingFormDialog';
import UnitFormDialog from '../components/property/UnitFormDialog';
import OwnerFormDialog from '../components/property/OwnerFormDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PropertyExplorer() {
  const [currentTab, setCurrentTab] = useState(0);
  const [siteFormOpen, setSiteFormOpen] = useState(false);
  const [buildingFormOpen, setBuildingFormOpen] = useState(false);
  const [unitFormOpen, setUnitFormOpen] = useState(false);
  const [ownerFormOpen, setOwnerFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  // Fetch all property data
  const { 
    data: sites, 
    isLoading: sitesLoading, 
    error: sitesError,
    refetch: refetchSites 
  } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      try {
        const res = await propertyAPI.sites.getAll();
        return res.data;
      } catch (error) {
        console.error('Error fetching sites:', error);
        throw error;
      }
    },
    retry: 2,
  });

  const { 
    data: buildings, 
    isLoading: buildingsLoading, 
    error: buildingsError,
    refetch: refetchBuildings 
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      try {
        const res = await propertyAPI.buildings.getAll();
        return res.data;
      } catch (error) {
        console.error('Error fetching buildings:', error);
        throw error;
      }
    },
    retry: 2,
  });

  const { 
    data: units, 
    isLoading: unitsLoading, 
    error: unitsError,
    refetch: refetchUnits 
  } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      try {
        const res = await propertyAPI.units.getAll();
        return res.data;
      } catch (error) {
        console.error('Error fetching units:', error);
        throw error;
      }
    },
    retry: 2,
  });

  const { 
    data: owners, 
    isLoading: ownersLoading, 
    error: ownersError,
    refetch: refetchOwners 
  } = useQuery({
    queryKey: ['owners'],
    queryFn: async () => {
      try {
        const res = await propertyAPI.owners.getAll();
        return res.data;
      } catch (error) {
        console.error('Error fetching owners:', error);
        throw error;
      }
    },
    retry: 2,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const refetchAll = () => {
    refetchSites();
    refetchBuildings();
    refetchUnits();
    refetchOwners();
    setSnackbar({ 
      open: true, 
      message: 'Data refreshed successfully', 
      severity: 'success' 
    });
  };

  const handleFormSuccess = (message: string) => {
    refetchAll();
    setSnackbar({ 
      open: true, 
      message, 
      severity: 'success' 
    });
  };

  const handleFormError = (error: any) => {
    setSnackbar({ 
      open: true, 
      message: error?.message || 'An error occurred', 
      severity: 'error' 
    });
  };

  // Calculate statistics
  const totalSites = sites?.length || 0;
  const totalBuildings = buildings?.length || 0;
  const totalUnits = units?.length || 0;
  const totalOwners = owners?.length || 0;
  
  const availableUnits = units?.filter((unit: any) => unit.status === 'AVAILABLE').length || 0;
  const leasedUnits = units?.filter((unit: any) => unit.status === 'LEASED').length || 0;
  const soldUnits = units?.filter((unit: any) => unit.status === 'SOLD').length || 0;

  const isUsingMock = isUsingMockData();
  const isLoading = sitesLoading || buildingsLoading || unitsLoading || ownersLoading;

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    subtitle 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
    subtitle?: string;
  }) => (
    <Card 
      sx={{ 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="h3" 
              component="div" 
              fontWeight="700"
              color={`${color}.main`}
              sx={{ 
                background: color === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                      color === 'secondary' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                      color === 'success' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                      color === 'warning' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' :
                      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.primary" 
              fontWeight="600"
              sx={{ mt: 1 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${getColorGradient(color)})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getColorGradient = (color: string) => {
    switch (color) {
      case 'primary': return '#667eea, #764ba2';
      case 'secondary': return '#f093fb, #f5576c';
      case 'success': return '#4facfe, #00f2fe';
      case 'warning': return '#43e97b, #38f9d7';
      case 'error': return '#fa709a, #fee140';
      default: return '#667eea, #764ba2';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Mock Data Warning */}
      {isUsingMock && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Currently using mock data. Please check if the backend server is running.
        </Alert>
      )}

      {/* Header Section */}
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
          }
        }}
      >
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                fontWeight="800"
                sx={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Property Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Manage your real estate portfolio - sites, buildings, units, and owners
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={refetchAll}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Sites"
              value={totalSites}
              icon={<Business sx={{ fontSize: 32 }} />}
              color="primary"
              subtitle="Property locations"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Buildings"
              value={totalBuildings}
              icon={<Apartment sx={{ fontSize: 32 }} />}
              color="secondary"
              subtitle="Building structures"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Units"
              value={totalUnits}
              icon={<MeetingRoom sx={{ fontSize: 32 }} />}
              color="success"
              subtitle={`${availableUnits} available, ${leasedUnits} leased`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Owners"
              value={totalOwners}
              icon={<Person sx={{ fontSize: 32 }} />}
              color="warning"
              subtitle="Property owners"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs Navigation */}
      <Paper 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 60,
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
              }
            }}
          >
            <Tab 
              icon={<Business />} 
              iconPosition="start" 
              label={`Sites (${totalSites})`} 
            />
            <Tab 
              icon={<Apartment />} 
              iconPosition="start" 
              label={`Buildings (${totalBuildings})`} 
            />
            <Tab 
              icon={<MeetingRoom />} 
              iconPosition="start" 
              label={`Units (${totalUnits})`} 
            />
            <Tab 
              icon={<Person />} 
              iconPosition="start" 
              label={`Owners (${totalOwners})`} 
            />
          </Tabs>
        </Box>

        {/* Sites Tab */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="600">
              Site Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSiteFormOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add New Site
            </Button>
          </Box>
          <SiteTable />
        </TabPanel>

        {/* Buildings Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="600">
              Building Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setBuildingFormOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add New Building
            </Button>
          </Box>
          <BuildingTable />
        </TabPanel>

        {/* Units Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="600">
              Unit Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setUnitFormOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add New Unit
            </Button>
          </Box>
          <UnitTable />
        </TabPanel>

        {/* Owners Tab */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="600">
              Owner Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOwnerFormOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add New Owner
            </Button>
          </Box>
          <OwnerTable />
        </TabPanel>
      </Paper>

      {/* Form Dialogs */}
      <SiteFormDialog
        open={siteFormOpen}
        onClose={() => setSiteFormOpen(false)}
        onSaveSuccess={() => {
          setSiteFormOpen(false);
          handleFormSuccess('Site created successfully');
        }}
        onSaveError={handleFormError}
      />

      <BuildingFormDialog
        open={buildingFormOpen}
        onClose={() => setBuildingFormOpen(false)}
        onSaveSuccess={() => {
          setBuildingFormOpen(false);
          handleFormSuccess('Building created successfully');
        }}
        onSaveError={handleFormError}
      />

      <UnitFormDialog
        open={unitFormOpen}
        onClose={() => setUnitFormOpen(false)}
        onSaveSuccess={() => {
          setUnitFormOpen(false);
          handleFormSuccess('Unit created successfully');
        }}
        onSaveError={handleFormError}
      />

      <OwnerFormDialog
        open={ownerFormOpen}
        onClose={() => setOwnerFormOpen(false)}
        onSaveSuccess={() => {
          setOwnerFormOpen(false);
          handleFormSuccess('Owner created successfully');
        }}
        onSaveError={handleFormError}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}