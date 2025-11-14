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
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Edit, Delete, Email, Phone, Person } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { Owner, BuildingUnit } from '../../types/Property';
import ConfirmDialog from '../ConfirmDialog';
import OwnerFormDialog from './OwnerFormDialog';

export default function OwnerTable() {
  const [editOwner, setEditOwner] = useState<Owner | null>(null);
  const [deleteOwnerId, setDeleteOwnerId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all data
  const { 
    data: owners, 
    isLoading: ownersLoading, 
    error: ownersError 
  } = useQuery({
    queryKey: ['owners'],
    queryFn: () => propertyAPI.owners.getAll().then(res => res.data),
  });

  const { 
    data: units, 
    isLoading: unitsLoading 
  } = useQuery({
    queryKey: ['units'],
    queryFn: () => propertyAPI.units.getAll().then(res => res.data),
  });

  // Calculate owned units count for each owner
  const enhancedOwners = useMemo(() => {
    if (!owners || !units) return [];
    
    return owners.map(owner => {
      const ownedUnits = units.filter(unit => unit.ownerId === owner.id);
      return {
        ...owner,
        ownedUnitsCount: ownedUnits.length,
        ownedUnits: ownedUnits // Optional: include the actual units if needed
      };
    });
  }, [owners, units]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyAPI.owners.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
      queryClient.invalidateQueries({ queryKey: ['units'] }); // Also invalidate units
      setDeleteOwnerId(null);
    },
    onError: (error: Error) => {
      console.error('Delete owner error:', error);
    },
  });

  const handleDelete = () => {
    if (deleteOwnerId) {
      deleteMutation.mutate(deleteOwnerId);
    }
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['owners'] });
    queryClient.invalidateQueries({ queryKey: ['units'] });
  };

  const isLoading = ownersLoading || unitsLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (ownersError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading owners: {(ownersError as Error).message}
      </Alert>
    );
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: '600', fontSize: '1rem' }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: '600', fontSize: '1rem' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: '600', fontSize: '1rem' }}>Owned Units</TableCell>
              <TableCell sx={{ fontWeight: '600', fontSize: '1rem' }}>Tax Number</TableCell>
              <TableCell sx={{ fontWeight: '600', fontSize: '1rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enhancedOwners?.map((owner) => (
              <TableRow 
                key={owner.id}
                sx={{ 
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'grey.50',
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1rem',
                      }}
                    >
                      {owner.name?.charAt(0) || 'O'}
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {owner.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {owner.contactPerson}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{owner.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{owner.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${owner.ownedUnitsCount || 0} units`}
                    color={owner.ownedUnitsCount > 0 ? "success" : "default"}
                    variant={owner.ownedUnitsCount > 0 ? "filled" : "outlined"}
                    sx={{ 
                      fontWeight: '600',
                      borderRadius: 2,
                    }}
                  />
                  {owner.ownedUnitsCount > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Active ownership
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {owner.taxNumber || 'Not provided'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditOwner(owner)}
                      disabled={deleteMutation.isPending}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setDeleteOwnerId(owner.id)}
                      color="error"
                      disabled={deleteMutation.isPending || (owner.ownedUnitsCount > 0)}
                      sx={{ 
                        '&:hover': { backgroundColor: 'error.light', color: 'white' }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  {owner.ownedUnitsCount > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Cannot delete - has units
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!enhancedOwners || enhancedOwners.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No owners found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get started by adding your first property owner.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <OwnerFormDialog
        open={!!editOwner}
        onClose={() => setEditOwner(null)}
        owner={editOwner || undefined}
        onSaveSuccess={handleSaveSuccess}
      />

      <ConfirmDialog
        open={!!deleteOwnerId}
        onCancel={() => setDeleteOwnerId(null)}
        onConfirm={handleDelete}
        title="Delete Owner"
        message="Are you sure you want to delete this owner? This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </>
  );
}