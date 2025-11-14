import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Snackbar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Visibility,
  Business,
  FilterList,
  Phone,
  Email,
  CalendarToday,
  TrendingUp,
  Clear,
  Warning,
  Person,
  Group,
  Assignment,
  CheckCircle,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadAPI } from '../api/apiClient';
import CreateEditLeadForm from './CreateEditLeadForm';
import LeadStatusMenu from './LeadStatusMenu';
import { Lead } from '../types/Lead';
import { Link } from 'react-router-dom';

export default function LeadTable() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<{
    status: string | null;
    source: string | null;
  }>({
    status: null,
    source: null,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Fetch leads with error handling
  const { 
    data: leads, 
    isLoading, 
    error,
    refetch 
  } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await leadAPI.getAll();
      return res.data as Lead[];
    },
    retry: 3,
  });

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await leadAPI.delete(id);
    },
    onSuccess: (_, deletedId) => {
      // Optimistically update the cache
      queryClient.setQueryData(['leads'], (oldLeads: Lead[] | undefined) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.filter(lead => lead.id !== deletedId);
      });
      
      setSnackbar({ 
        open: true, 
        message: 'Lead deleted successfully', 
        severity: 'success' 
      });
    },
    onError: (error: any) => {
      console.error('Delete failed:', error);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      const errorMessage = error?.response?.data?.message || 'Failed to delete lead';
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    },
  });

  // Filter leads based on active filters
  const filteredLeads = React.useMemo(() => {
    if (!leads) return [];
    
    return leads.filter(lead => {
      // Status filter
      if (activeFilters.status && lead.status !== activeFilters.status) {
        return false;
      }
      
      // Source filter
      if (activeFilters.source && lead.source !== activeFilters.source) {
        return false;
      }
      
      return true;
    });
  }, [leads, activeFilters]);

  const openCreateForm = () => {
    setEditingLead(null);
    setFormOpen(true);
  };

  const openEditForm = (lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    const leadName = `${lead.firstName} ${lead.lastName}`;
    setLeadToDelete({ id: lead.id, name: leadName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteMutation.mutate(leadToDelete.id);
    }
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleStatusFilter = (status: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      status: status === 'ALL' ? null : status
    }));
    handleFilterClose();
  };

  const handleSourceFilter = (source: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      source: source === 'ALL' ? null : source
    }));
    handleFilterClose();
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: null,
      source: null,
    });
    handleFilterClose();
  };

  const clearFilter = (filterType: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: null
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW': return { 
        bg: 'rgba(102, 126, 234, 0.1)', 
        color: '#667eea', 
        border: 'rgba(102, 126, 234, 0.3)',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
      case 'CONTACTED': return { 
        bg: 'rgba(255, 152, 0, 0.1)', 
        color: '#ff9800', 
        border: 'rgba(255, 152, 0, 0.3)',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      };
      case 'QUALIFIED': return { 
        bg: 'rgba(76, 175, 80, 0.1)', 
        color: '#4caf50', 
        border: 'rgba(76, 175, 80, 0.3)',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      };
      case 'OPPORTUNITY': return { 
        bg: 'rgba(156, 39, 176, 0.1)', 
        color: '#9c27b0', 
        border: 'rgba(156, 39, 176, 0.3)',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      };
      case 'CONTRACT': return { 
        bg: 'rgba(33, 150, 243, 0.1)', 
        color: '#2196f3', 
        border: 'rgba(33, 150, 243, 0.3)',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
      case 'CLOSED_WON': return { 
        bg: 'rgba(76, 175, 80, 0.1)', 
        color: '#4caf50', 
        border: 'rgba(76, 175, 80, 0.3)',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      };
      case 'CLOSED_LOST': return { 
        bg: 'rgba(244, 67, 54, 0.1)', 
        color: '#f44336', 
        border: 'rgba(244, 67, 54, 0.3)',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      };
      default: return { 
        bg: 'rgba(158, 158, 158, 0.1)', 
        color: '#9e9e9e', 
        border: 'rgba(158, 158, 158, 0.3)',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      };
    }
  };

  // Get unique values for filter options
  const statusOptions = React.useMemo(() => {
    if (!leads) return [];
    return Array.from(new Set(leads.map(lead => lead.status).filter(Boolean))) as string[];
  }, [leads]);

  const sourceOptions = React.useMemo(() => {
    if (!leads) return [];
    return Array.from(new Set(leads.map(lead => lead.source).filter(Boolean))) as string[];
  }, [leads]);

  // Enhanced columns with better styling (priority column removed)
  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'primary.main',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {params.row.firstName?.[0]?.toUpperCase()}{params.row.lastName?.[0]?.toUpperCase()}
        </Avatar>
      ),
    },
    { 
      field: 'name', 
      headerName: 'Lead Name', 
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="600">
            {params.row.firstName} {params.row.lastName}
          </Typography>
          {params.row.company && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Business sx={{ fontSize: 12 }} />
              {params.row.company}
            </Typography>
          )}
        </Box>
      ),
    },
    { 
      field: 'contact', 
      headerName: 'Contact Info', 
      flex: 1.2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2" noWrap title={params.row.email}>
              {params.row.email}
            </Typography>
          </Box>
          {params.row.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {params.row.phone}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <LeadStatusMenu 
          id={params.row.id} 
          status={params.value} 
          size="small"
        />
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="500">
          {params.value || 'Website'}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={new Date(params.value).toLocaleString()}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2">
              {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isDeleting = deleteMutation.isPending && deleteMutation.variables === params.row.id;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Lead">
              <IconButton
                size="small"
                onClick={() => openEditForm(params.row.originalData)}
                disabled={isDeleting}
                sx={{
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    color: 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                component={Link}
                to={`/leads/${params.row.id}`}
                disabled={isDeleting}
                sx={{
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  color: '#4caf50',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    color: 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isDeleting ? "Deleting..." : "Delete Lead"}>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row.originalData)}
                disabled={isDeleting}
                sx={{
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  color: '#f44336',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    color: 'rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  // Map backend fields to grid rows
  const rows = filteredLeads?.map((lead: Lead) => ({
    id: lead.id,
    firstName: lead.firstName || '-',
    lastName: lead.lastName || '-',
    name: `${lead.firstName} ${lead.lastName}`,
    email: lead.email || '-',
    phone: lead.phone || '-',
    company: lead.company || '-',
    status: lead.status || 'NEW',
    source: lead.source || 'Website',
    createdAt: lead.createdAt,
    originalData: lead,
  })) || [];

  // Calculate statistics based on filtered data
  const totalLeads = filteredLeads?.length || 0;
  const newLeads = filteredLeads?.filter(lead => lead.status === 'NEW').length || 0;
  const contactedLeads = filteredLeads?.filter(lead => lead.status === 'CONTACTED').length || 0;
  const qualifiedLeads = filteredLeads?.filter(lead => lead.status === 'QUALIFIED').length || 0;
  const convertedLeads = filteredLeads?.filter(lead => lead.status === 'CLOSED_WON').length || 0;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  // Count active filters for badge
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  // StatCard Component for consistent styling
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    subtitle 
  }: { 
    title: string; 
    value: number | string; 
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
                Lead Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Manage and track your sales leads effectively
                {activeFilterCount > 0 && (
                  <Chip 
                    label={`${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active`}
                    size="small"
                    sx={{ 
                      ml: 2, 
                      fontWeight: '600',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {activeFilters.status && (
                    <Chip
                      label={`Status: ${activeFilters.status}`}
                      size="small"
                      onDelete={() => clearFilter('status')}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: '500',
                      }}
                    />
                  )}
                  {activeFilters.source && (
                    <Chip
                      label={`Source: ${activeFilters.source}`}
                      size="small"
                      onDelete={() => clearFilter('source')}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: '500',
                      }}
                    />
                  )}
                  <Tooltip title="Clear all filters">
                    <IconButton 
                      size="small" 
                      onClick={clearAllFilters}
                      sx={{ color: 'white' }}
                    >
                      <Clear />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              <Tooltip title="Filter Leads">
                <Badge badgeContent={activeFilterCount} color="primary">
                  <IconButton
                    onClick={handleFilterClick}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    <FilterList />
                  </IconButton>
                </Badge>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={() => refetch()}
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
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateForm}
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                  color: '#667eea',
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
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
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <>
          {/* Stats Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Leads"
                value={totalLeads}
                icon={<Person sx={{ fontSize: 32 }} />}
                color="primary"
                subtitle="All leads"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="New Leads"
                value={newLeads}
                icon={<Assignment sx={{ fontSize: 32 }} />}
                color="secondary"
                subtitle="Require contact"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Qualified"
                value={qualifiedLeads}
                icon={<Group sx={{ fontSize: 32 }} />}
                color="success"
                subtitle="High potential"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Conversion Rate"
                value={`${conversionRate}%`}
                icon={<TrendingUp sx={{ fontSize: 32 }} />}
                color="warning"
                subtitle="Success rate"
              />
            </Grid>
          </Grid>

          {/* Error Alert */}
          {error && (
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
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Failed to load leads. Please try again.
            </Alert>
          )}

          {/* Data Grid */}
          <Paper 
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
          >
            {isLoading && <LinearProgress />}
            <DataGrid
              rows={rows}
              columns={columns}
              loading={isLoading || deleteMutation.isPending}
              pageSizeOptions={[5, 10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
                  fontWeight: '600',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: '600',
                  color: '#667eea',
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.02)',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  backgroundColor: 'rgba(102, 126, 234, 0.02)',
                },
                '& .MuiTablePagination-root': {
                  fontWeight: '500',
                },
              }}
            />
          </Paper>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: '450px',
            maxWidth: '500px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: '600', color: 'error.main', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning color="error" sx={{ fontSize: 28 }} />
            <Box>
              Confirm Delete
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'normal', mt: 0.5 }}>
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText>
            Are you sure you want to delete the lead <strong>"{leadToDelete?.name}"</strong>?
            <br /><br />
            This will permanently remove:
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 1 }}>
              <li>All lead information</li>
              <li>Contact details</li>
              <li>Associated notes and activities</li>
              <li>Any related data</li>
            </Box>
            This action cannot be reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={cancelDelete}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: '600',
              borderColor: 'grey.400',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'grey.600',
                backgroundColor: 'grey.50',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? null : <Delete />}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
              }
            }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Lead'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            mt: 1,
            minWidth: 200,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <MenuItem disabled sx={{ fontWeight: '600', color: 'text.primary', opacity: 1 }}>
          Filter by Status
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusFilter(null)}
          selected={!activeFilters.status}
          sx={{ fontWeight: '500' }}
        >
          All Statuses
        </MenuItem>
        {statusOptions.map((status) => (
          <MenuItem 
            key={status}
            onClick={() => handleStatusFilter(status)}
            selected={activeFilters.status === status}
            sx={{ fontWeight: '500' }}
          >
            {status}
          </MenuItem>
        ))}
        
        <MenuItem disabled sx={{ fontWeight: '600', color: 'text.primary', opacity: 1, mt: 1 }}>
          Filter by Source
        </MenuItem>
        <MenuItem 
          onClick={() => handleSourceFilter(null)}
          selected={!activeFilters.source}
          sx={{ fontWeight: '500' }}
        >
          All Sources
        </MenuItem>
        {sourceOptions.map((source) => (
          <MenuItem 
            key={source}
            onClick={() => handleSourceFilter(source)}
            selected={activeFilters.source === source}
            sx={{ fontWeight: '500' }}
          >
            {source}
          </MenuItem>
        ))}
        
        {activeFilterCount > 0 && (
          <>
            <MenuItem disabled sx={{ mt: 1 }}></MenuItem>
            <MenuItem 
              onClick={clearAllFilters}
              sx={{ 
                fontWeight: '600', 
                color: 'error.main',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.04)',
                }
              }}
            >
              Clear All Filters
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            fontWeight: '500',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Lead Form Modal */}
      <CreateEditLeadForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingLead(null);
        }}
        leadToEdit={editingLead || undefined}
        onSaveSuccess={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          setEditingLead(null);
          setSnackbar({ open: true, message: 'Lead saved successfully', severity: 'success' });
        }}
      />
    </Box>
  );
}