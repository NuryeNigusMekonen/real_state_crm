import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Typography,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { Owner, CreateOwnerRequest } from '../../types/Property';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Badge,
  Description,
} from '@mui/icons-material';

interface OwnerFormDialogProps {
  open: boolean;
  onClose: () => void;
  owner?: Owner;
  onSaveSuccess?: () => void;
}

export default function OwnerFormDialog({ open, onClose, owner, onSaveSuccess }: OwnerFormDialogProps) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateOwnerRequest>({
    defaultValues: owner ? {
      name: owner.name,
      contactPerson: owner.contactPerson,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      taxNumber: owner.taxNumber,
      notes: owner.notes,
    } : {}
  });

  // Reset form when dialog opens/closes or owner changes
  useEffect(() => {
    if (owner) {
      reset({
        name: owner.name,
        contactPerson: owner.contactPerson,
        email: owner.email,
        phone: owner.phone,
        address: owner.address,
        taxNumber: owner.taxNumber,
        notes: owner.notes,
      });
    } else {
      reset({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxNumber: '',
        notes: '',
      });
    }
  }, [owner, open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateOwnerRequest) => propertyAPI.owners.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      onSaveSuccess?.();
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateOwnerRequest) => 
      propertyAPI.owners.update(owner!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      onSaveSuccess?.();
      handleClose();
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateOwnerRequest) => {
    if (owner) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Person sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              {owner ? 'Edit Owner' : 'Create New Owner'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {owner ? 'Update owner information' : 'Add a new property owner'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error instanceof Error ? error.message : 'An error occurred. Please try again.'}
              </Alert>
            )}

            {/* Basic Information */}
            <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge />
              Basic Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Owner Name *"
                fullWidth
                {...register('name', { 
                  required: 'Owner name is required',
                  minLength: {
                    value: 2,
                    message: 'Owner name must be at least 2 characters'
                  }
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
              />
              <TextField
                label="Contact Person *"
                fullWidth
                {...register('contactPerson', { 
                  required: 'Contact person is required',
                  minLength: {
                    value: 2,
                    message: 'Contact person must be at least 2 characters'
                  }
                })}
                error={!!errors.contactPerson}
                helperText={errors.contactPerson?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
              />
            </Box>

            {/* Contact Information */}
            <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email />
              Contact Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Email *"
                type="email"
                fullWidth
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
              />
              <TextField
                label="Phone *"
                fullWidth
                {...register('phone', { 
                  required: 'Phone is required',
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
              />
            </Box>

            {/* Address Information */}
            <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn />
              Address Information
            </Typography>

            <TextField
              label="Address"
              fullWidth
              multiline
              rows={2}
              {...register('address')}
              placeholder="Enter full address..."
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            />

            {/* Additional Information */}
            <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description />
              Additional Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Tax Number"
                fullWidth
                {...register('taxNumber')}
                placeholder="Tax identification number"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
              />
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                {...register('notes')}
                placeholder="Additional notes or comments..."
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }
                }}
              />
            </Box>

            {/* Required Fields Note */}
            <Box sx={{ 
              backgroundColor: 'grey.50', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <strong>Note:</strong> Fields marked with * are required
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={isLoading}
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
            type="submit" 
            variant="contained"
            disabled={isLoading}
            sx={{ 
              borderRadius: 2, 
              px: 4, 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                {owner ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              owner ? 'Update Owner' : 'Create Owner'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}