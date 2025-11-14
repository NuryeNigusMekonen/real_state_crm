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
  Snackbar,
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
  Person,
  Refresh,
  Visibility,
  Email,
  Security,
  Warning,
  Block,
  AdminPanelSettings,
  ManageAccounts,
  Group,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/apiClient';
import UserForm from './UserForm';
import { User } from '../types/User';
import { useAuth } from '../hooks/useAuth';

export default function UserTable() {
  const queryClient = useQueryClient();
  const { user: currentUser, role: currentUserRole } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  // Get current user role with fallback
  const userRole = currentUserRole || currentUser?.role || 'USER';
  
  // Check permissions based on current user role
  const canCreate = userRole === 'ADMIN';
  const canEdit = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canDelete = userRole === 'ADMIN';
  const canView = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'SALES';

  // Helper function to check if current user can modify a specific user
  const canModifyUser = (targetUser: User) => {
    if (userRole === 'ADMIN') {
      return true; // Admin can modify anyone
    }
    if (userRole === 'MANAGER') {
      // Manager can only modify SALES and USER roles, not other managers or admins
      return targetUser.role === 'SALES' || targetUser.role === 'USER';
    }
    return false; // SALES and USER cannot modify anyone
  };

  // If user has no access to this page at all
  if (!canView) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Card 
          sx={{ 
            maxWidth: 500,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            p: 4,
          }}
        >
          <Block sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="700" gutterBottom color="error.main">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to view the user management section. 
            Please contact your administrator if you need access.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              px: 4,
              fontWeight: '600',
            }}
          >
            Go Back
          </Button>
        </Card>
      </Box>
    );
  }

  // Fetch users with error handling
  const { 
    data: users, 
    isLoading, 
    error,
    refetch 
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await userAPI.getAll();
        console.log('Users API Response:', res.data);
        return res.data as User[];
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    retry: 3,
    enabled: canView, // Only fetch if user can view
  });

  // Delete user mutation with better error handling
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting user with ID:', id);
      try {
        const response = await userAPI.delete(id);
        console.log('Delete response:', response);
        return response;
      } catch (error) {
        console.error('Delete API error:', error);
        throw error;
      }
    },
    onSuccess: (response, deletedId) => {
      console.log('Delete successful for ID:', deletedId);
      
      // Optimistically update the cache
      queryClient.setQueryData(['users'], (oldUsers: User[] | undefined) => {
        if (!oldUsers) return oldUsers;
        return oldUsers.filter(user => user.id !== deletedId);
      });
      
      setSnackbar({ 
        open: true, 
        message: 'User deleted successfully', 
        severity: 'success' 
      });
    },
    onError: (error: any, deletedId) => {
      console.error('Delete mutation failed:', error);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      let errorMessage = 'Failed to delete user. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'User not found. It may have been already deleted.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete users.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in again to perform this action.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    },
  });

  const openCreateForm = () => {
    if (!canCreate) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to create users', 
        severity: 'error' 
      });
      return;
    }
    console.log('Opening create form');
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEditForm = (user: User) => {
    if (!canEdit || !canModifyUser(user)) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to edit this user', 
        severity: 'error' 
      });
      return;
    }
    console.log('Opening edit form for user:', user);
    setEditingUser(user);
    setFormOpen(true);
  };

  const openViewDialog = (user: User) => {
    if (!canView) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to view user details', 
        severity: 'error' 
      });
      return;
    }
    console.log('Opening view dialog for user:', user);
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (!canDelete || !canModifyUser(user)) {
      setSnackbar({ 
        open: true, 
        message: 'You do not have permission to delete this user', 
        severity: 'error' 
      });
      return;
    }
    console.log('Delete clicked for user:', user);
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      console.log('Confirming delete for user:', selectedUser);
      console.log('User ID to delete:', selectedUser.id);
      deleteMutation.mutate(selectedUser.id);
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const cancelDelete = () => {
    console.log('Delete cancelled');
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingUser(null);
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setSnackbar({ 
      open: true, 
      message: editingUser ? 'User updated successfully' : 'User created successfully', 
      severity: 'success' 
    });
  };

  const handleFormError = (error: any) => {
    console.error('Form error:', error);
    const errorMessage = error?.response?.data?.message 
      || error?.message 
      || (editingUser ? 'Failed to update user' : 'Failed to create user');
    
    setSnackbar({ 
      open: true, 
      message: errorMessage, 
      severity: 'error' 
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { 
          bg: 'rgba(102, 126, 234, 0.1)', 
          color: '#667eea', 
          border: 'rgba(102, 126, 234, 0.3)',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
      case 'MANAGER':
        return { 
          bg: 'rgba(255, 152, 0, 0.1)', 
          color: '#ff9800', 
          border: 'rgba(255, 152, 0, 0.3)',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        };
      case 'SALES':
        return { 
          bg: 'rgba(76, 175, 80, 0.1)', 
          color: '#4caf50', 
          border: 'rgba(76, 175, 80, 0.3)',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        };
      case 'USER':
        return { 
          bg: 'rgba(158, 158, 158, 0.1)', 
          color: '#9e9e9e', 
          border: 'rgba(158, 158, 158, 0.3)',
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };
      default:
        return { 
          bg: 'rgba(158, 158, 158, 0.1)', 
          color: '#9e9e9e', 
          border: 'rgba(158, 158, 158, 0.3)',
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };
    }
  };

  // Enhanced columns with permission-based actions
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
            backgroundColor: getRoleColor(params.row.role).color,
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {params.row.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      ),
    },
    { 
      field: 'username', 
      headerName: 'Username', 
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="600">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    { 
      field: 'firstName', 
      headerName: 'First Name', 
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    { 
      field: 'lastName', 
      headerName: 'Last Name', 
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2">
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const roleColors = getRoleColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: roleColors.bg,
              color: roleColors.color,
              fontWeight: '600',
              borderRadius: 2,
              border: '1px solid',
              borderColor: roleColors.border,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isDeleting = deleteMutation.isPending && selectedUser?.id === params.row.id;
        const userCanEdit = canEdit && canModifyUser(params.row);
        const userCanDelete = canDelete && canModifyUser(params.row);
        const userCanView = canView;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Edit Button - Only for users with edit permission */}
            {userCanEdit && (
              <Tooltip title="Edit User">
                <IconButton
                  size="small"
                  onClick={() => openEditForm(params.row)}
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
            )}

            {/* View Button - For all roles that can view */}
            {userCanView && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => openViewDialog(params.row)}
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
            )}

            {/* Delete Button - Only for users with delete permission */}
            {userCanDelete && (
              <Tooltip title={isDeleting ? "Deleting..." : "Delete User"}>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(params.row)}
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
            )}

            {/* No actions message for users with no permissions */}
            {!userCanEdit && !userCanDelete && !userCanView && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                No actions
              </Typography>
            )}
          </Box>
        );
      },
    },
  ];

  // Map backend fields to grid rows
  const rows = users?.map((user: User) => {
    return {
      id: user.id,
      username: user.username || 'N/A',
      firstName: user.first_name || user.firstName || 'N/A',
      lastName: user.last_name || user.lastName || 'N/A',
      email: user.email || 'N/A',
      role: user.role || 'USER',
      // Pass the entire user object so it's available in actions
      ...user
    };
  }) || [];

  // Calculate statistics
  const totalUsers = users?.length || 0;
  const adminUsers = users?.filter(user => user.role === 'ADMIN').length || 0;
  const managerUsers = users?.filter(user => user.role === 'MANAGER').length || 0;
  const salesUsers = users?.filter(user => user.role === 'SALES').length || 0;

  // StatCard Component for consistent styling
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
                User Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Manage system users, roles, and permissions
                <Chip 
                  label={`Current Role: ${userRole}`} 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    fontWeight: '600',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
              
              {/* Add User Button - Only for ADMIN */}
              {canCreate && (
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
                  Add New User
                </Button>
              )}
            </Box>
          </Box>

          {/* Permission Guide */}
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security sx={{ fontSize: 20 }} />
              Permission Guide
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings sx={{ fontSize: 16, color: '#667eea' }} />
                <span><strong>ADMIN:</strong> Full access (Create, Edit, Delete, View)</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ManageAccounts sx={{ fontSize: 16, color: '#ff9800' }} />
                <span><strong>MANAGER:</strong> Edit & View only (SALES/USER roles)</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group sx={{ fontSize: 16, color: '#4caf50' }} />
                <span><strong>SALES:</strong> View only</span>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Debug information - Remove in production */}
      {(!currentUser && !userRole) && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          <Warning sx={{ mr: 1 }} />
          No user data found. Please make sure you are logged in and the authentication system is working properly.
        </Alert>
      )}

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
                title="Total Users"
                value={totalUsers}
                icon={<Person sx={{ fontSize: 32 }} />}
                color="primary"
                subtitle="All system users"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Administrators"
                value={adminUsers}
                icon={<AdminPanelSettings sx={{ fontSize: 32 }} />}
                color="secondary"
                subtitle="System administrators"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Managers"
                value={managerUsers}
                icon={<ManageAccounts sx={{ fontSize: 32 }} />}
                color="warning"
                subtitle="Team managers"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Sales Team"
                value={salesUsers}
                icon={<Group sx={{ fontSize: 32 }} />}
                color="success"
                subtitle="Sales representatives"
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
              Failed to load users. Please try again.
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
            minWidth: '400px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: '600', color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user <strong>"{selectedUser?.username}"</strong>? 
            <br /><br />
            This action cannot be undone and all associated data will be permanently removed.
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
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
            }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: '600' }}>
          User Details
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    backgroundColor: getRoleColor(selectedUser.role).color,
                    fontWeight: '600',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {selectedUser.username?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {selectedUser.first_name || selectedUser.firstName || 'N/A'} {selectedUser.last_name || selectedUser.lastName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedUser.username}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser.email || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Role
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    size="small"
                    sx={{
                      backgroundColor: getRoleColor(selectedUser.role).bg,
                      color: getRoleColor(selectedUser.role).color,
                      fontWeight: '600',
                      borderRadius: 2,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

      {/* User Form Modal */}
      <UserForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        userToEdit={editingUser || undefined}
        onSaveSuccess={handleFormSuccess}
        onSaveError={handleFormError}
      />
    </Box>
  );
}