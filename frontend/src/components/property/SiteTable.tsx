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
  Chip,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';
import { Site } from '../../types/Property';
import ConfirmDialog from '../ConfirmDialog';
import SiteFormDialog from './SiteFormDialog';

export default function SiteTable() {
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [deleteSiteId, setDeleteSiteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { 
    data: sites, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['sites'],
    queryFn: () => propertyAPI.sites.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyAPI.sites.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setDeleteSiteId(null);
    },
    onError: (error: Error) => {
      console.error('Delete site error:', error);
    },
  });

  const handleDelete = () => {
    if (deleteSiteId) {
      deleteMutation.mutate(deleteSiteId);
    }
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['sites'] });
  };

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
        Error loading sites: {(error as Error).message}
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
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Parking</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sites?.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.addressLine1}</TableCell>
                <TableCell>{site.city}</TableCell>
                <TableCell>{site.country}</TableCell>
                <TableCell>
                  <Chip
                    label={site.parkingAvailable ? 'Available' : 'Not Available'}
                    color={site.parkingAvailable ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditSite(site)}
                      disabled={deleteMutation.isPending}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setDeleteSiteId(site.id)}
                      color="error"
                      disabled={deleteMutation.isPending}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {(!sites || sites.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No sites found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog - FIXED: Changed site prop to siteToEdit */}
      <SiteFormDialog
        open={!!editSite}
        onClose={() => setEditSite(null)}
        siteToEdit={editSite || undefined}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteSiteId}
        onCancel={() => setDeleteSiteId(null)}
        onConfirm={handleDelete}
        title="Delete Site"
        message="Are you sure you want to delete this site? This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </>
  );
}