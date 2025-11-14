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
import { userAPI } from '../api/apiClient';
import {
  Person,
  Email,
  Security,
  Work,
  AttachMoney,
  Lock,
} from '@mui/icons-material';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  userToEdit?: any;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export default function UserForm({ open, onClose, userToEdit, onSaveSuccess, onSaveError }: UserFormProps) {
  const isEdit = Boolean(userToEdit);
  const queryClient = useQueryClient();

  const initialFormState = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'SALES',
    passwordHash: '',
    compensationType: 'SALARY',
    baseSalary: '',
  };

  const [form, setForm] = useState<any>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userToEdit) {
      setForm({
        id: userToEdit.id,
        username: userToEdit.username ?? '',
        email: userToEdit.email ?? '',
        firstName: userToEdit.firstName ?? userToEdit.first_name ?? '',
        lastName: userToEdit.lastName ?? userToEdit.last_name ?? '',
        role: userToEdit.role ?? 'SALES',
        passwordHash: '',
        compensationType: userToEdit.compensationType ?? 'SALARY',
        baseSalary: userToEdit.baseSalary ?? '',
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [userToEdit, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEdit && !form.passwordHash.trim()) {
      newErrors.passwordHash = 'Password is required for new users';
    }

    if (form.passwordHash && form.passwordHash.length < 6) {
      newErrors.passwordHash = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      if (!payload.passwordHash || payload.passwordHash.trim() === '') {
        delete payload.passwordHash;
      }
      
      // Convert baseSalary to number if it exists
      if (payload.baseSalary) {
        payload.baseSalary = Number(payload.baseSalary);
      }

      if (isEdit && userToEdit?.id) {
        return userAPI.update(userToEdit.id, payload);
      } else {
        return userAPI.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSaveSuccess && onSaveSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to save user';
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

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
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
              {isEdit ? 'Edit User' : 'Create New User'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {isEdit ? 'Update user information' : 'Add a new user to the system'}
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

        <Box component="form" id="user-form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {/* Personal Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            Personal Information
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName}
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

          {/* Account Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email />
            Account Information
          </Typography>

          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: 'text.secondary' }} />
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
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
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
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }}
          />

          <TextField
            label="Password"
            name="passwordHash"
            type="password"
            value={form.passwordHash}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required={!isEdit}
            error={!!errors.passwordHash}
            helperText={errors.passwordHash || (isEdit ? 'Leave blank to keep current password' : 'Minimum 6 characters')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: 'text.secondary' }} />
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

          {/* Role & Compensation Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Work />
            Role & Compensation
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="role-label">User Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={form.role}
                label="User Role"
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <Security sx={{ color: 'text.secondary', ml: 1 }} />
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
                <MenuItem value="ADMIN">Administrator</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="SALES">Sales Agent</MenuItem>
                <MenuItem value="USER">User</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="comp-label">Compensation Type</InputLabel>
              <Select
                labelId="comp-label"
                name="compensationType"
                value={form.compensationType}
                label="Compensation Type"
                onChange={handleChange}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'white',
                }}
              >
                <MenuItem value="SALARY">Salary</MenuItem>
                <MenuItem value="COMMISSION">Commission</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Base Salary"
            name="baseSalary"
            type="number"
            value={form.baseSalary}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney sx={{ color: 'text.secondary' }} />
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
          form="user-form" 
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
            isEdit ? 'Update User' : 'Create User'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}