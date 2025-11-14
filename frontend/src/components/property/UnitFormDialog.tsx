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
  InputAdornment,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { BuildingUnit, CreateUnitRequest, Building, Owner } from '../../types/Property';
import {
  Home,
  Business,
  Layers,
  SquareFoot,
  LocalParking,
  AttachMoney,
  Person,
} from '@mui/icons-material';

interface UnitFormDialogProps {
  open: boolean;
  onClose: () => void;
  unit?: BuildingUnit;
  onSaveSuccess?: () => void;
}

export default function UnitFormDialog({ open, onClose, unit, onSaveSuccess }: UnitFormDialogProps) {
  const queryClient = useQueryClient();
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<CreateUnitRequest>({
    defaultValues: {
      unitNumber: '',
      type: 'APARTMENT',
      floor: 1,
      areaSqm: 0,
      parkingSlots: 0,
      price: 0,
      status: 'AVAILABLE',
      buildingId: '',
      ownerId: '',
    }
  });

  const buildingIdValue = watch('buildingId');

  // Reset form when dialog opens/closes or unit changes
  useEffect(() => {
    if (unit) {
      reset({
        unitNumber: unit.unitNumber,
        type: unit.type,
        floor: unit.floor,
        areaSqm: unit.areaSqm,
        parkingSlots: unit.parkingSlots,
        price: unit.price,
        status: unit.status,
        buildingId: unit.buildingId,
        ownerId: unit.ownerId || '',
      });
    } else {
      reset({
        unitNumber: '',
        type: 'APARTMENT',
        floor: 1,
        areaSqm: 0,
        parkingSlots: 0,
        price: 0,
        status: 'AVAILABLE',
        buildingId: '',
        ownerId: '',
      });
    }
  }, [unit, open, reset]);

  // Fetch buildings and owners
  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => propertyAPI.buildings.getAll().then(res => res.data),
    enabled: open,
  });

  const { data: owners, isLoading: ownersLoading } = useQuery({
    queryKey: ['owners'],
    queryFn: () => propertyAPI.owners.getAll().then(res => res.data),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUnitRequest) => propertyAPI.units.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      onSaveSuccess?.();
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateUnitRequest) => 
      propertyAPI.units.update(unit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      onSaveSuccess?.();
      handleClose();
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateUnitRequest) => {
    if (!data.buildingId || data.buildingId === '') {
      alert('Please select a building');
      return;
    }

    const submitData = {
      ...data,
      floor: Number(data.floor),
      areaSqm: Number(data.areaSqm),
      parkingSlots: Number(data.parkingSlots),
      price: Number(data.price),
      ownerId: data.ownerId || undefined,
    };

    if (unit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
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
          <Home sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="700">
              {unit ? 'Edit Unit' : 'Create New Unit'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {unit ? 'Update unit information' : 'Add a new unit to your building'}
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
          
          {/* Unit Basic Information */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Home />
            Unit Information
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Unit Number *"
              fullWidth
              {...register('unitNumber', { 
                required: 'Unit number is required',
                minLength: { value: 2, message: 'Unit number must be at least 2 characters' }
              })}
              error={!!errors.unitNumber}
              helperText={errors.unitNumber?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home sx={{ color: 'text.secondary' }} />
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
              select
              label="Unit Type *"
              fullWidth
              {...register('type', { required: 'Unit type is required' })}
              error={!!errors.type}
              helperText={errors.type?.message}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            >
              <MenuItem value="APARTMENT">Apartment</MenuItem>
              <MenuItem value="OFFICE">Office</MenuItem>
              <MenuItem value="SHOP">Shop</MenuItem>
              <MenuItem value="MIXED">Mixed</MenuItem>
            </TextField>
          </Box>

          {/* Location & Status */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business />
            Location & Status
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              select
              label="Status *"
              fullWidth
              {...register('status', { required: 'Status is required' })}
              error={!!errors.status}
              helperText={errors.status?.message}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            >
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="RESERVED">Reserved</MenuItem>
              <MenuItem value="LEASED">Leased</MenuItem>
              <MenuItem value="SOLD">Sold</MenuItem>
            </TextField>

            <TextField
              select
              label="Building *"
              fullWidth
              value={buildingIdValue || ''}
              {...register('buildingId', { 
                required: 'Building is required',
                validate: value => value !== '' || 'Please select a building'
              })}
              error={!!errors.buildingId}
              helperText={errors.buildingId?.message}
              disabled={isLoading || buildingsLoading}
              onChange={(e) => setValue('buildingId', e.target.value, { shouldValidate: true })}
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
            >
              <MenuItem value="">
                <em>Select a Building</em>
              </MenuItem>
              {buildings?.map((building: Building) => (
                <MenuItem key={building.id} value={building.id}>
                  {building.name} - {building.site?.name || 'Unknown Site'}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Specifications */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Layers />
            Specifications
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Floor *"
              type="number"
              fullWidth
              {...register('floor', { 
                required: 'Floor is required',
                min: { value: 0, message: 'Floor cannot be negative' },
                valueAsNumber: true
              })}
              error={!!errors.floor}
              helperText={errors.floor?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Layers sx={{ color: 'text.secondary' }} />
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
              label="Area (sqm) *"
              type="number"
              fullWidth
              {...register('areaSqm', { 
                required: 'Area is required',
                min: { value: 1, message: 'Must be at least 1 sqm' },
                valueAsNumber: true
              })}
              error={!!errors.areaSqm}
              helperText={errors.areaSqm?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SquareFoot sx={{ color: 'text.secondary' }} />
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
              label="Parking Slots *"
              type="number"
              fullWidth
              {...register('parkingSlots', { 
                required: 'Parking slots is required',
                min: { value: 0, message: 'Cannot be negative' },
                valueAsNumber: true
              })}
              error={!!errors.parkingSlots}
              helperText={errors.parkingSlots?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalParking sx={{ color: 'text.secondary' }} />
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

          {/* Pricing & Ownership */}
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney />
            Pricing & Ownership
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Price *"
              type="number"
              fullWidth
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price cannot be negative' },
                valueAsNumber: true
              })}
              error={!!errors.price}
              helperText={errors.price?.message}
              disabled={isLoading}
              InputProps={{
                startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                }
              }}
            />

            <TextField
              select
              label="Owner (Optional)"
              fullWidth
              {...register('ownerId')}
              disabled={isLoading || ownersLoading}
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
            >
              <MenuItem value="">
                <em>No Owner</em>
              </MenuItem>
              {owners?.map((owner: Owner) => (
                <MenuItem key={owner.id} value={owner.id}>
                  {owner.name} - {owner.email}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Loading States */}
          {buildingsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                Loading buildings...
              </Typography>
            </Box>
          )}
          
          {buildings && buildings.length === 0 && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No buildings available. Please create a building first.
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
            disabled={isLoading || !buildingIdValue || buildings?.length === 0}
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
                {unit ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              unit ? 'Update Unit' : 'Create Unit'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}