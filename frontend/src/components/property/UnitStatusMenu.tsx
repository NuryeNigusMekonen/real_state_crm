import React from 'react';
import { MenuItem, Select, Chip } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAPI } from '../../api/apiClient';

interface UnitStatusMenuProps {
  unitId: string;
  status: 'AVAILABLE' | 'RESERVED' | 'LEASED' | 'SOLD';
}

const statusColors = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  LEASED: 'info',
  SOLD: 'secondary'
} as const;

const statusLabels = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  LEASED: 'Leased',
  SOLD: 'Sold'
};

export default function UnitStatusMenu({ unitId, status }: UnitStatusMenuProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return propertyAPI.units.updateStatus(unitId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
    onError: (error: any) => {
      console.error('Failed to update unit status:', error);
      alert('Failed to update status. Please try again.');
    }
  });

  const handleChange = (event: any) => {
    const newStatus = event.target.value;
    mutation.mutate(newStatus);
  };

  return (
    <Select
      size="small"
      value={status}
      onChange={handleChange}
      disabled={mutation.isPending}
      sx={{ minWidth: 120 }}
      renderValue={(value) => (
        <Chip 
          label={statusLabels[value as keyof typeof statusLabels]} 
          color={statusColors[value as keyof typeof statusColors] as any}
          size="small"
        />
      )}
    >
      <MenuItem value="AVAILABLE">
        <Chip label="Available" color="success" size="small" />
      </MenuItem>
      <MenuItem value="RESERVED">
        <Chip label="Reserved" color="warning" size="small" />
      </MenuItem>
      <MenuItem value="LEASED">
        <Chip label="Leased" color="info" size="small" />
      </MenuItem>
      <MenuItem value="SOLD">
        <Chip label="Sold" color="secondary" size="small" />
      </MenuItem>
    </Select>
  );
}