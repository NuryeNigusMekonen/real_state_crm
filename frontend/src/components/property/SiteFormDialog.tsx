// src/components/property/SiteFormDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import {
  Business,
  LocationOn,
  LocationCity,
  Flag,
  Description,
} from '@mui/icons-material';

interface SiteFormDialogProps {
  open: boolean;
  onClose: () => void;
  siteToEdit?: any;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export default function SiteFormDialog({ open, onClose, siteToEdit, onSaveSuccess, onSaveError }: SiteFormDialogProps) {
  const isEdit = Boolean(siteToEdit);
  const queryClient = useQueryClient();

  const initialFormState = {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    parkingAvailable: true,
    description: '',
  };

  const [form, setForm] = useState<any>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (siteToEdit) {
      setForm({
        id: siteToEdit.id,
        name: siteToEdit.name ?? '',
        addressLine1: siteToEdit.addressLine1 ?? '',
        addressLine2: siteToEdit.addressLine2 ?? '',
        city: siteToEdit.city ?? '',
        state: siteToEdit.state ?? '',
        country: siteToEdit.country ?? '',
        zipCode: siteToEdit.zipCode ?? '',
        parkingAvailable: siteToEdit.parkingAvailable ?? true,
        description: siteToEdit.description ?? '',
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [siteToEdit, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Site name is required';
    }
    if (!form.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    if (!form.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!form.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit && siteToEdit?.id) {
        return propertyAPI.sites.update(siteToEdit.id, data);
      } else {
        return propertyAPI.sites.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSaveSuccess && onSaveSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to save site';
      setErrors({ submit: errorMessage });
      onSaveError && onSaveError(error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev: any) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? target.checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    mutation.mutate(form);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="md"
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
          <Business sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              {isEdit ? 'Edit Site' : 'Create New Site'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {isEdit ? 'Update site information' : 'Add a new property site'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box component="form" id="site-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business />
            Basic Information
          </Typography>

          <TextField
            label="Site Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }}
          />

          {/* Address Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn />
            Address Information
          </Typography>

          <TextField
            label="Address Line 1"
            name="addressLine1"
            value={form.addressLine1}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.addressLine1}
            helperText={errors.addressLine1}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }}
          />

          <TextField
            label="Address Line 2"
            name="addressLine2"
            value={form.addressLine2}
            onChange={handleChange}
            fullWidth
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.city}
              helperText={errors.city}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationCity sx={{ color: 'text.secondary' }} />
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
              label="State/Province"
              name="state"
              value={form.state}
              onChange={handleChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Country"
              name="country"
              value={form.country}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.country}
              helperText={errors.country}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Flag sx={{ color: 'text.secondary' }} />
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
              label="ZIP/Postal Code"
              name="zipCode"
              value={form.zipCode}
              onChange={handleChange}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            />
          </Box>

          {/* Additional Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description />
            Additional Information
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                name="parkingAvailable"
                checked={form.parkingAvailable}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Parking Available"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the site features, location advantages, etc..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          disabled={mutation.isPending}
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
          form="site-form" 
          variant="contained"
          disabled={mutation.isPending}
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
          {mutation.isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </Box>
          ) : (
            isEdit ? 'Update Site' : 'Create Site'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}