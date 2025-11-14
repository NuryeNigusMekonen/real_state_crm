import React, { useState } from 'react';
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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { Building } from '../../types/Property';
import ConfirmDialog from '../ConfirmDialog';
import BuildingFormDialog from './BuildingFormDialog';

export default function BuildingTable() {
  const [editBuilding, setEditBuilding] = useState<Building | null>(null);
  const [deleteBuildingId, setDeleteBuildingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { 
    data: buildings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => propertyAPI.buildings.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyAPI.buildings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setDeleteBuildingId(null);
    },
    onError: (error: Error) => {
      console.error('Delete building error:', error);
    },
  });

  const handleDelete = () => {
    if (deleteBuildingId) {
      deleteMutation.mutate(deleteBuildingId);
    }
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['buildings'] });
  };

  // Debug log to check if delete state is working
  console.log('Delete Building ID:', deleteBuildingId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading buildings: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Floors</TableCell>
              <TableCell>Total Area (sqm)</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buildings?.map((building: Building) => (
              <TableRow key={building.id}>
                <TableCell>{building.name}</TableCell>
                <TableCell>{building.floorCount}</TableCell>
                <TableCell>{building.totalAreaSqm.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={building.site?.name || building.siteName || 'Unknown Site'} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditBuilding(building)}
                      disabled={deleteMutation.isPending}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setDeleteBuildingId(building.id)}
                      color="error"
                      disabled={deleteMutation.isPending}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!buildings || buildings.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No buildings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <BuildingFormDialog
        open={!!editBuilding}
        onClose={() => setEditBuilding(null)}
        building={editBuilding || undefined}
        onSaveSuccess={handleSaveSuccess}
      />

      <ConfirmDialog
        open={!!deleteBuildingId}
        onCancel={() => setDeleteBuildingId(null)}
        onConfirm={handleDelete}
        title="Delete Building"
        message="Are you sure you want to delete this building? This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </>
  );
}