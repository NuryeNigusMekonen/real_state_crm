import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { Building, CreateBuildingRequest, Site } from '../../types/Property';
import {
  Business,
  LocationOn,
  Apartment,
  SquareFoot,
} from '@mui/icons-material';

interface BuildingFormDialogProps {
  open: boolean;
  onClose: () => void;
  building?: Building;
  onSaveSuccess?: () => void;
}

export default function BuildingFormDialog({ 
  open, 
  onClose, 
  building, 
  onSaveSuccess 
}: BuildingFormDialogProps) {
  const queryClient = useQueryClient();
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<CreateBuildingRequest>({
    defaultValues: {
      name: '',
      floorCount: 1,
      totalAreaSqm: 0,
      siteId: '',
    }
  });

  const siteIdValue = watch('siteId');

  // Reset form when dialog opens/closes or building changes
  useEffect(() => {
    if (building) {
      reset({
        name: building.name,
        floorCount: building.floorCount,
        totalAreaSqm: building.totalAreaSqm,
        siteId: building.siteId,
      });
    } else {
      reset({
        name: '',
        floorCount: 1,
        totalAreaSqm: 0,
        siteId: '',
      });
    }
  }, [building, open, reset]);

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => propertyAPI.sites.getAll().then(res => res.data),
    enabled: open,
  });

  // Auto-select first site when sites load and no site is selected (for new buildings only)
  useEffect(() => {
    if (sites && sites.length > 0 && !building && !siteIdValue) {
      setValue('siteId', sites[0].id);
    }
  }, [sites, siteIdValue, building, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: CreateBuildingRequest) => propertyAPI.buildings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSaveSuccess?.();
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateBuildingRequest) => 
      propertyAPI.buildings.update(building!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onSaveSuccess?.();
      handleClose();
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateBuildingRequest) => {
    if (!data.siteId || data.siteId === '') {
      alert('Please select a site');
      return;
    }

    if (building) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

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
          <Apartment sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              {building ? 'Edit Building' : 'Create New Building'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {building ? 'Update building information' : 'Add a new building to your property'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 4 }}>
          {mutationError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {mutationError instanceof Error ? mutationError.message : 'An error occurred'}
            </Alert>
          )}
          
          {/* Building Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business />
            Building Information
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Building Name"
              fullWidth
              {...register('name', { 
                required: 'Building name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: 'text.secondary' }} />
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
              label="Floor Count"
              type="number"
              fullWidth
              {...register('floorCount', { 
                required: 'Floor count is required',
                min: { value: 1, message: 'Must be at least 1 floor' },
                valueAsNumber: true
              })}
              error={!!errors.floorCount}
              helperText={errors.floorCount?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Apartment sx={{ color: 'text.secondary' }} />
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

          {/* Area Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SquareFoot />
            Area Information
          </Typography>

          <TextField
            label="Total Area (sqm)"
            type="number"
            fullWidth
            {...register('totalAreaSqm', { 
              required: 'Total area is required',
              min: { value: 1, message: 'Must be at least 1 sqm' },
              valueAsNumber: true
            })}
            error={!!errors.totalAreaSqm}
            helperText={errors.totalAreaSqm?.message}
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SquareFoot sx={{ color: 'text.secondary' }} />
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

          {/* Location Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn />
            Location Information
          </Typography>

          <TextField
            select
            label="Site Location"
            fullWidth
            value={siteIdValue || ''}
            {...register('siteId', { 
              required: 'Site is required',
              validate: value => value !== '' || 'Please select a site'
            })}
            error={!!errors.siteId}
            helperText={errors.siteId?.message || 'Select the site where this building is located'}
            disabled={isLoading || sitesLoading}
            onChange={(e) => setValue('siteId', e.target.value, { shouldValidate: true })}
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
          >
            <MenuItem value="">
              <em>Select a Site</em>
            </MenuItem>
            {sites?.map((site: Site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name} - {site.addressLine1}, {site.city}
              </MenuItem>
            ))}
          </TextField>
          
          {sitesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                Loading sites...
              </Typography>
            </Box>
          )}
          
          {sites && sites.length === 0 && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No sites available. Please create a site first.
            </Alert>
          )}
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
            disabled={isLoading || !siteIdValue || sites?.length === 0}
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
                {building ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              building ? 'Update Building' : 'Create Building'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}