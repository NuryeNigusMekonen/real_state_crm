import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, Select
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/apiClient';

type Props = { leadId: string; open: boolean; onClose: () => void };

export default function AssignUserDialog({ leadId, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const mutation = useMutation({
    mutationFn: async () => api.put(`/leads/${leadId}/assign`, { assignedTo: selected }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    }
  });

  useEffect(() => { setSelected(''); }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Assign Lead</DialogTitle>
      <DialogContent>
        <Select fullWidth value={selected} onChange={(e) => setSelected(e.target.value)}>
          {users?.map((u: any) => (
            <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={!selected}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}
