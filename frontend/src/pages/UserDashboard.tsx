import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  People,
  Business,
  Apartment,
  TrendingUp,
  Add,
  ArrowForward,
  LocationOn,
  Refresh,
  Person,
  CalendarToday,
  Star,
  CheckCircle,
  Warning,
  LocalParking,
  SquareFoot,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { userAPI, leadAPI, propertyAPI } from '../api/apiClient';
import { Link } from 'react-router-dom';
import { Lead } from '../types/Lead';
import { User } from '../types/User';

interface Unit {
  id: string;
  unitNumber: string;
  price?: number;
  areaSqm?: number;
  status: string;
  buildingId: string;
  building?: {
    id: string;
    name: string;
    site?: {
      name: string;
      city: string;
    };
  };
  type: string;
  floor: number;
  parkingSlots: number;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
  city: string;
  buildingCount?: number;
}

interface Building {
  id: string;
  name: string;
  site?: {
    name: string;
    city: string;
  };
  unitCount?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalLeads: number;
  totalSites: number;
  totalBuildings: number;
  totalUnits: number;
  availableUnits: number;
  leasedUnits: number;
  reservedUnits: number;
  totalValue: number;
}

export default function UserDashboard() {
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll().then(res => res.data),
    retry: 3,
  });

  const { 
    data: leads, 
    isLoading: leadsLoading, 
    error: leadsError,
    refetch: refetchLeads 
  } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: () => leadAPI.getAll().then(res => res.data),
    retry: 3,
  });

  const { 
    data: units, 
    isLoading: unitsLoading, 
    error: unitsError,
    refetch: refetchUnits 
  } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: () => propertyAPI.units.getAll().then(res => res.data),
    retry: 3,
  });

  const { 
    data: sites, 
    isLoading: sitesLoading, 
    error: sitesError,
    refetch: refetchSites 
  } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => propertyAPI.sites.getAll().then(res => res.data),
    retry: 3,
  });

  const { 
    data: buildings, 
    isLoading: buildingsLoading,
    refetch: refetchBuildings 
  } = useQuery<Building[]>({
    queryKey: ['buildings'],
    queryFn: () => propertyAPI.buildings.getAll().then(res => res.data),
    retry: 3,
  });

  const isLoading = usersLoading || leadsLoading || unitsLoading || sitesLoading || buildingsLoading;
  const hasError = usersError || leadsError || unitsError || sitesError;

  // Enhanced data processing
  const enhancedUnits = React.useMemo(() => {
    if (!units || !buildings) return [];
    
    return units.map(unit => {
      const building = buildings.find(b => b.id === unit.buildingId);
      return {
        ...unit,
        building: building || { name: 'Unknown Building' }
      };
    });
  }, [units, buildings]);

  const dashboardStats: DashboardStats = React.useMemo(() => {
    const availableUnits = enhancedUnits.filter(unit => unit.status === 'AVAILABLE').length;
    const leasedUnits = enhancedUnits.filter(unit => unit.status === 'LEASED').length;
    const reservedUnits = enhancedUnits.filter(unit => unit.status === 'RESERVED').length;
    const totalValue = enhancedUnits.reduce((sum, unit) => sum + (unit.price || 0), 0);

    return {
      totalUsers: users?.length || 0,
      totalLeads: leads?.length || 0,
      totalSites: sites?.length || 0,
      totalBuildings: buildings?.length || 0,
      totalUnits: enhancedUnits.length,
      availableUnits,
      leasedUnits,
      reservedUnits,
      totalValue,
    };
  }, [users, leads, sites, buildings, enhancedUnits]);

  const handleRefresh = () => {
    refetchUsers();
    refetchLeads();
    refetchUnits();
    refetchSites();
    refetchBuildings();
  };

  // StatCard Component
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    subtitle,
    trend,
    loading = false
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
    subtitle?: string;
    trend?: string;
    loading?: boolean;
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
        },
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            {loading ? (
              <>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="90%" height={20} />
              </>
            ) : (
              <>
                <Typography 
                  variant="h4" 
                  component="div" 
                  fontWeight="700"
                  sx={{ 
                    background: color === 'primary' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
                          color === 'secondary' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                          color === 'success' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                          color === 'warning' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' :
                          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  {value}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.primary" 
                  fontWeight="600"
                  sx={{ mb: 0.5 }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {subtitle}
                  </Typography>
                )}
                {trend && (
                  <Chip
                    label={trend}
                    size="small"
                    sx={{
                      backgroundColor: `${getStatusColor('AVAILABLE')}15`,
                      color: getStatusColor('AVAILABLE'),
                      fontWeight: '500',
                      borderRadius: 2,
                    }}
                  />
                )}
              </>
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
              ml: 2,
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
      case 'info': return '#fa709a, #fee140';
      default: return '#667eea, #764ba2';
    }
  };

  // Format currency in ETB (Birr)
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'ETB 0';
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW': 
      case 'AVAILABLE': 
        return '#48bb78';
      case 'CONTACTED': 
      case 'RESERVED': 
        return '#ed8936';
      case 'QUALIFIED': 
      case 'LEASED': 
        return '#667eea';
      case 'CONVERTED': 
      case 'SOLD': 
        return '#9f7aea';
      case 'CLOSED_LOST': 
        return '#ef4444';
      default: return '#a0aec0';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'RESERVED': return <Star sx={{ fontSize: 16 }} />;
      case 'LEASED': return <Business sx={{ fontSize: 16 }} />;
      case 'SOLD': return <CheckCircle sx={{ fontSize: 16 }} />;
      default: return <Warning sx={{ fontSize: 16 }} />;
    }
  };

  const stats = [
    {
      title: 'Total Properties',
      value: dashboardStats.totalSites,
      icon: <Apartment sx={{ fontSize: 28 }} />,
      color: 'primary' as const,
      subtitle: `${dashboardStats.totalBuildings} buildings`,
      loading: sitesLoading,
    },
    {
      title: 'Portfolio Value',
      value: formatCurrency(dashboardStats.totalValue),
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      color: 'success' as const,
      subtitle: 'Total property value',
      loading: unitsLoading,
    },
    {
      title: 'Available Units',
      value: dashboardStats.availableUnits,
      icon: <CheckCircle sx={{ fontSize: 28 }} />,
      color: 'info' as const,
      subtitle: `${dashboardStats.totalUnits} total units`,
      trend: `${Math.round((dashboardStats.availableUnits / dashboardStats.totalUnits) * 100)}% available`,
      loading: unitsLoading,
    },
    {
      title: 'Active Leads',
      value: dashboardStats.totalLeads,
      icon: <People sx={{ fontSize: 28 }} />,
      color: 'warning' as const,
      subtitle: 'Potential customers',
      loading: leadsLoading,
    },
  ];

  const recentLeads = leads?.slice(0, 5) || [];
  const availableUnits = enhancedUnits.filter(unit => unit.status === 'AVAILABLE').slice(0, 5);
  const recentUnits = enhancedUnits.slice(0, 5);

  if (isLoading && !hasError) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Card 
        sx={{ 
          mb: 4, 
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                fontWeight="800"
                sx={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  mb: 2,
                }}
              >
                Property Management Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 3 }}>
                Welcome back! Manage your real estate portfolio efficiently.
              </Typography>

              {/* Quick Stats */}
              <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ opacity: 0.8 }} />
                  <Typography variant="body1" fontWeight="500">
                    {dashboardStats.totalSites} Sites
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Apartment sx={{ opacity: 0.8 }} />
                  <Typography variant="body1" fontWeight="500">
                    {dashboardStats.totalBuildings} Buildings
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business sx={{ opacity: 0.8 }} />
                  <Typography variant="body1" fontWeight="500">
                    {dashboardStats.totalUnits} Units
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People sx={{ opacity: 0.8 }} />
                  <Typography variant="body1" fontWeight="500">
                    {dashboardStats.totalLeads} Leads
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
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

          {/* Quick Actions */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/properties/units/new"
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                color: '#667eea',
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(255,255,255,0.3)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 6px 20px rgba(255,255,255,0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add New Unit
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/leads/new"
              sx={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                color: '#667eea',
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 14px 0 rgba(255,255,255,0.3)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 6px 20px rgba(255,255,255,0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Add New Lead
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/properties"
              sx={{
                borderRadius: 3,
                px: 3,
                fontWeight: '600',
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              View Properties
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alerts */}
      {hasError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            '& .MuiAlert-message': {
              fontWeight: '500',
            }
          }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Failed to load some dashboard data. Some information may be incomplete.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
              trend={stat.trend}
              loading={stat.loading}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Leads */}
        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              height: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                <People />
                Recent Leads
              </Typography>
              <Button 
                component={Link} 
                to="/leads" 
                size="small"
                endIcon={<ArrowForward />}
                sx={{
                  textTransform: 'none',
                  fontWeight: '600',
                  color: '#667eea',
                  borderRadius: 2,
                }}
              >
                View All
              </Button>
            </Box>
            
            {leadsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index} sx={{ p: 2.5, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={48} height={48} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="80%" height={20} />
                      </Box>
                      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : recentLeads.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentLeads.map((lead) => (
                  <Box
                    key={lead.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      background: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: getStatusColor(lead.status),
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        {lead.firstName?.[0]}{lead.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {lead.firstName} {lead.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Business sx={{ fontSize: 16 }} />
                          {lead.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={lead.status || 'New'}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(lead.status)}15`,
                        color: getStatusColor(lead.status),
                        fontWeight: '600',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: `${getStatusColor(lead.status)}30`,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary" gutterBottom>
                  No leads found
                </Typography>
                <Button
                  component={Link}
                  to="/leads/new"
                  variant="outlined"
                  startIcon={<Add />}
                  sx={{ 
                    mt: 1,
                    borderRadius: 2,
                    fontWeight: '600',
                  }}
                >
                  Add Your First Lead
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Available Units */}
        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              height: 'fit-content',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Apartment />
                Available Units
              </Typography>
              <Button 
                component={Link} 
                to="/properties" 
                size="small"
                endIcon={<ArrowForward />}
                sx={{
                  textTransform: 'none',
                  fontWeight: '600',
                  color: '#667eea',
                  borderRadius: 2,
                }}
              >
                View All
              </Button>
            </Box>
            
            {unitsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index} sx={{ p: 2.5, borderRadius: 3 }}>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : availableUnits.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {availableUnits.map((unit) => (
                  <Box
                    key={unit.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      background: 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="body1" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Apartment sx={{ fontSize: 20, color: '#667eea' }} />
                          Unit {unit.unitNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16 }} />
                          {unit.building?.name || 'Unknown Building'}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="700" color="primary">
                        {formatCurrency(unit.price)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={getStatusIcon(unit.status)}
                        label={unit.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(unit.status)}15`,
                          color: getStatusColor(unit.status),
                          fontWeight: '600',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: `${getStatusColor(unit.status)}30`,
                        }}
                      />
                      {unit.areaSqm && (
                        <Chip
                          icon={<SquareFoot sx={{ fontSize: 14 }} />}
                          label={`${unit.areaSqm} sqm`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            fontWeight: '500',
                            borderColor: 'rgba(102, 126, 234, 0.3)',
                          }}
                        />
                      )}
                      {unit.parkingSlots > 0 && (
                        <Chip
                          icon={<LocalParking sx={{ fontSize: 14 }} />}
                          label={`${unit.parkingSlots} parking`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2, 
                            fontWeight: '500',
                            borderColor: 'rgba(102, 126, 234, 0.3)',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Apartment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary" gutterBottom>
                  No available units at the moment.
                </Typography>
                <Button
                  component={Link}
                  to="/properties/units/new"
                  variant="outlined"
                  startIcon={<Add />}
                  sx={{ 
                    mt: 1,
                    borderRadius: 2,
                    fontWeight: '600',
                  }}
                >
                  Add New Unit
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Stats Row */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Leased Units
            </Typography>
            <Typography variant="h3" fontWeight="700" color="primary">
              {dashboardStats.leasedUnits}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currently occupied
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Reserved Units
            </Typography>
            <Typography variant="h3" fontWeight="700" color="warning.main">
              {dashboardStats.reservedUnits}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Under reservation
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Occupancy Rate
            </Typography>
            <Typography variant="h3" fontWeight="700" color="success.main">
              {Math.round(((dashboardStats.leasedUnits + dashboardStats.reservedUnits) / dashboardStats.totalUnits) * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current occupancy
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}