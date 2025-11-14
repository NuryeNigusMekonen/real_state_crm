import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Chip,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { BuildingUnit, Building, Owner } from '../../types/Property';
import ConfirmDialog from '../ConfirmDialog';
import UnitFormDialog from './UnitFormDialog';
import UnitStatusMenu from './UnitStatusMenu';

export default function UnitTable() {
  const [editUnit, setEditUnit] = useState<BuildingUnit | null>(null);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all data
  const { 
    data: units, 
    isLoading: unitsLoading, 
    error: unitsError 
  } = useQuery({
    queryKey: ['units', statusFilter, typeFilter],
    queryFn: () => propertyAPI.units.getAll({ 
      status: statusFilter || undefined,
      type: typeFilter || undefined 
    }).then(res => res.data),
  });

  const { 
    data: buildings, 
    isLoading: buildingsLoading 
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => propertyAPI.buildings.getAll().then(res => res.data),
  });

  const { 
    data: owners, 
    isLoading: ownersLoading 
  } = useQuery({
    queryKey: ['owners'],
    queryFn: () => propertyAPI.owners.getAll().then(res => res.data),
  });

  // Create lookup objects for buildings and owners
  const buildingsLookup = useMemo(() => {
    if (!buildings) return {};
    return buildings.reduce((acc: { [key: string]: Building }, building) => {
      acc[building.id] = building;
      return acc;
    }, {});
  }, [buildings]);

  const ownersLookup = useMemo(() => {
    if (!owners) return {};
    return owners.reduce((acc: { [key: string]: Owner }, owner) => {
      acc[owner.id] = owner;
      return acc;
    }, {});
  }, [owners]);

  // Enhance units with building and owner data
  const enhancedUnits = useMemo(() => {
    if (!units) return [];
    
    return units.map(unit => ({
      ...unit,
      // Get building data from lookup
      building: unit.building || buildingsLookup[unit.buildingId],
      // Get owner data from lookup if ownerId exists
      owner: unit.owner || (unit.ownerId ? ownersLookup[unit.ownerId] : undefined)
    }));
  }, [units, buildingsLookup, ownersLookup]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyAPI.units.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setDeleteUnitId(null);
    },
    onError: (error: Error) => {
      console.error('Delete unit error:', error);
    },
  });

  const handleDelete = () => {
    if (deleteUnitId) {
      deleteMutation.mutate(deleteUnitId);
    }
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'APARTMENT': return 'primary';
      case 'OFFICE': return 'secondary';
      case 'SHOP': return 'success';
      case 'MIXED': return 'warning';
      default: return 'default';
    }
  };

  // Format price with ETB currency
  const formatPrice = (price: number) => {
    return `ETB ${price?.toLocaleString()}`;
  };

  const isLoading = unitsLoading || buildingsLoading || ownersLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (unitsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading units: {(unitsError as Error).message}
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="AVAILABLE">Available</MenuItem>
          <MenuItem value="RESERVED">Reserved</MenuItem>
          <MenuItem value="LEASED">Leased</MenuItem>
          <MenuItem value="SOLD">Sold</MenuItem>
        </TextField>
        <TextField
          select
          label="Filter by Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="APARTMENT">Apartment</MenuItem>
          <MenuItem value="OFFICE">Office</MenuItem>
          <MenuItem value="SHOP">Shop</MenuItem>
          <MenuItem value="MIXED">Mixed</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Unit Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Area (sqm)</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enhancedUnits?.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>{unit.unitNumber}</TableCell>
                <TableCell>
                  <Chip 
                    label={unit.type} 
                    color={getTypeColor(unit.type) as any}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{unit.floor}</TableCell>
                <TableCell>{unit.areaSqm}</TableCell>
                <TableCell>{formatPrice(unit.price)}</TableCell>
                <TableCell>
                  <UnitStatusMenu unitId={unit.id} status={unit.status} />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={unit.building?.name || 'Unknown'} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {unit.owner?.name || 'No Owner'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditUnit(unit)}
                      disabled={deleteMutation.isPending}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setDeleteUnitId(unit.id)}
                      color="error"
                      disabled={deleteMutation.isPending}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!enhancedUnits || enhancedUnits.length === 0) && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No units found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <UnitFormDialog
        open={!!editUnit}
        onClose={() => setEditUnit(null)}
        unit={editUnit || undefined}
        onSaveSuccess={handleSaveSuccess}
      />

      <ConfirmDialog
        open={!!deleteUnitId}
        onCancel={() => setDeleteUnitId(null)}
        onConfirm={handleDelete}
        title="Delete Unit"
        message="Are you sure you want to delete this unit? This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </>
  );
}