import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadAPI } from '../api/apiClient';
import {
  Person,
  Email,
  Phone,
  Business,
  Assignment,
  TrendingUp,
  Source,
} from '@mui/icons-material';

interface CreateEditLeadFormProps {
  open: boolean;
  onClose: () => void;
  leadToEdit?: any;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export default function CreateEditLeadForm({ open, onClose, leadToEdit, onSaveSuccess, onSaveError }: CreateEditLeadFormProps) {
  const isEdit = Boolean(leadToEdit);
  const queryClient = useQueryClient();

  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    status: 'NEW',
    source: 'WEBSITE',
    notes: '',
  };

  const [form, setForm] = useState<any>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (leadToEdit) {
      setForm({
        id: leadToEdit.id,
        firstName: leadToEdit.firstName ?? '',
        lastName: leadToEdit.lastName ?? '',
        email: leadToEdit.email ?? '',
        phone: leadToEdit.phone ?? '',
        company: leadToEdit.company ?? '',
        status: leadToEdit.status ?? 'NEW',
        source: leadToEdit.source ?? 'WEBSITE',
        notes: leadToEdit.notes ?? '',
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [leadToEdit, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit && leadToEdit?.id) {
        return leadAPI.update(leadToEdit.id, data);
      } else {
        return leadAPI.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onSaveSuccess && onSaveSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to save lead';
      setErrors({ submit: errorMessage });
      onSaveError && onSaveError(error);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
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

  const statusOptions = [
    { value: 'NEW', label: 'New', color: '#667eea' },
    { value: 'CONTACTED', label: 'Contacted', color: '#ff9800' },
    { value: 'QUALIFIED', label: 'Qualified', color: '#4caf50' },
    { value: 'PROPOSAL', label: 'Proposal', color: '#9c27b0' },
    { value: 'NEGOTIATION', label: 'Negotiation', color: '#ff5722' },
    { value: 'CLOSED_WON', label: 'Closed Won', color: '#4caf50' },
    { value: 'CLOSED_LOST', label: 'Closed Lost', color: '#f44336' },
  ];

  const sourceOptions = [
    { value: 'WEBSITE', label: 'Website' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
    { value: 'COLD_CALL', label: 'Cold Call' },
    { value: 'PARTNER', label: 'Partner' },
    { value: 'OTHER', label: 'Other' },
  ];

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
          <Assignment sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              {isEdit ? 'Edit Lead' : 'Create New Lead'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {isEdit ? 'Update lead information' : 'Add a new lead to the pipeline'}
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

        <Box component="form" id="lead-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Contact Information Section */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            Contact Information
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
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
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
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
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
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

          <TextField
            label="Company"
            name="company"
            value={form.company}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }}
          />

          {/* Lead Details Section */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Lead Details
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={form.status}
                label="Status"
                onChange={handleChange}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'white',
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: option.color,
                        }}
                      />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="source-label">Source</InputLabel>
              <Select
                labelId="source-label"
                name="source"
                value={form.source}
                label="Source"
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <Source sx={{ color: 'text.secondary', ml: 1 }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  }
                }}
              >
                {sourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            placeholder="Add any additional notes about this lead..."
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
          form="lead-form" 
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
            isEdit ? 'Update Lead' : 'Create Lead'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}