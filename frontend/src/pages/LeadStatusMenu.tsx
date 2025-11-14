import React from 'react';
import { 
  MenuItem, 
  Select, 
  Chip,
  Box,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadAPI } from '../api/apiClient';

type Props = { 
  id: string; 
  status: string;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
};

const statusConfig = {
  'NEW': { label: 'New', color: '#667eea', bgColor: 'rgba(102, 126, 234, 0.1)' },
  'CONTACTED': { label: 'Contacted', color: '#ff9800', bgColor: 'rgba(255, 152, 0, 0.1)' },
  'QUALIFIED': { label: 'Qualified', color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.1)' },
  'OPPORTUNITY': { label: 'Opportunity', color: '#9c27b0', bgColor: 'rgba(156, 39, 176, 0.1)' },
  'CONTRACT': { label: 'Contract', color: '#2196f3', bgColor: 'rgba(33, 150, 243, 0.1)' },
  'CLOSED_WON': { label: 'Closed Won', color: '#4caf50', bgColor: 'rgba(76, 175, 80, 0.1)' },
  'CLOSED_LOST': { label: 'Closed Lost', color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.1)' },
};

const statuses = Object.keys(statusConfig) as Array<keyof typeof statusConfig>;

export default function LeadStatusMenu({ id, status, size = 'small', variant = 'outlined' }: Props) {
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const mutation = useMutation({
    mutationFn: async (newStatus: string) => {
      console.log('🔄 Updating lead status:', { leadId: id, newStatus });
      
      try {
        // Try the dedicated status endpoint first
        const response = await leadAPI.updateStatus(id, newStatus);
        console.log('✅ Status update successful:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Status endpoint failed, trying general update:', error);
        
        // Fallback to general update endpoint if status endpoint fails
        try {
          const fallbackResponse = await leadAPI.update(id, { status: newStatus });
          console.log('✅ Fallback update successful:', fallbackResponse.data);
          return fallbackResponse.data;
        } catch (fallbackError: any) {
          console.error('❌ Both update methods failed:', fallbackError);
          throw fallbackError;
        }
      }
    },
    onSuccess: (data, newStatus) => {
      console.log('🎉 Mutation success - updating cache for status:', newStatus);
      
      // Optimistically update the cache
      queryClient.setQueryData(['leads'], (oldLeads: any[] | undefined) => {
        if (!oldLeads) return oldLeads;
        
        const updatedLeads = oldLeads.map(lead => 
          lead.id === id ? { ...lead, status: newStatus } : lead
        );
        
        console.log('🔄 Cache updated:', { oldStatus: status, newStatus, leadId: id });
        return updatedLeads;
      });
      
      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      
      const statusLabel = statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus;
      setSnackbar({
        open: true,
        message: `Status updated to ${statusLabel}`,
        severity: 'success'
      });
    },
    onError: (error: any, newStatus) => {
      console.error('💥 Mutation failed:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        leadId: id,
        newStatus
      });
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      
      let errorMessage = 'Failed to update status';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  });

  const handleChange = (event: any) => {
    const newStatus = event.target.value;
    console.log('🎯 Status change triggered:', { from: status, to: newStatus, leadId: id });
    
    if (newStatus !== status) {
      mutation.mutate(newStatus);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (statusKey: string) => {
    return statusConfig[statusKey as keyof typeof statusConfig] || { 
      label: statusKey, 
      color: '#9e9e9e', 
      bgColor: 'rgba(158, 158, 158, 0.1)' 
    };
  };

  const currentStatus = getStatusColor(status);

  return (
    <>
      <Tooltip 
        title={mutation.isPending ? "Updating status..." : "Click to change status"} 
        placement="top"
      >
        <Box sx={{ position: 'relative' }}>
          <Select
            size={size}
            value={status}
            onChange={handleChange}
            disabled={mutation.isPending}
            variant={variant}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mutation.isPending && (
                  <CircularProgress 
                    size={14} 
                    sx={{ 
                      position: 'absolute', 
                      left: 8,
                      color: currentStatus.color 
                    }} 
                  />
                )}
                <Chip
                  label={currentStatus.label}
                  size="small"
                  sx={{
                    backgroundColor: currentStatus.bgColor,
                    color: currentStatus.color,
                    fontWeight: '600',
                    fontSize: size === 'small' ? '0.75rem' : '0.875rem',
                    height: size === 'small' ? 24 : 28,
                    border: `1px solid ${currentStatus.color}30`,
                    opacity: mutation.isPending ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    '& .MuiChip-label': {
                      px: 1.5,
                      pl: mutation.isPending ? 2.5 : 1.5,
                    },
                  }}
                />
              </Box>
            )}
            sx={{
              minWidth: 140,
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiSelect-select': {
                py: size === 'small' ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                minHeight: 'auto !important',
              },
              '&.Mui-disabled': {
                opacity: 0.7,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  mt: 1,
                  minWidth: 160,
                }
              },
              // Prevent menu from closing when clicking outside during mutation
              disableAutoFocus: mutation.isPending,
              disableEnforceFocus: mutation.isPending,
            }}
          >
            {statuses.map((statusKey) => {
              const statusInfo = getStatusColor(statusKey);
              const isSelected = status === statusKey;
              const isUpdating = mutation.isPending && mutation.variables === statusKey;
              
              return (
                <MenuItem 
                  key={statusKey} 
                  value={statusKey}
                  disabled={mutation.isPending}
                  selected={isSelected}
                  sx={{
                    color: statusInfo.color,
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: '0.875rem',
                    py: 1,
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: `${statusInfo.color}15`,
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${statusInfo.color}20`,
                      '&:hover': {
                        backgroundColor: `${statusInfo.color}25`,
                      },
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    {isUpdating && (
                      <CircularProgress size={12} sx={{ color: statusInfo.color }} />
                    )}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: statusInfo.color,
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      {statusInfo.label}
                    </Box>
                    {isSelected && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: statusInfo.color,
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </Box>
      </Tooltip>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            fontWeight: '500',
            alignItems: 'center',
            '& .MuiAlert-message': {
              py: 0.5,
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}