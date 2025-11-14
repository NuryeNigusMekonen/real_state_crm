import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/apiClient';

type LeadFormProps = {
  open: boolean;
  onClose: () => void;
  initialData?: any;
};

export default function LeadFormDialog({ open, onClose, initialData }: LeadFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', source: ''
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (initialData?.id) {
        return api.put(`/leads/${initialData.id}`, form);
      }
      return api.post('/leads', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="First Name" value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <TextField label="Last Name" value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <TextField label="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Phone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField label="Source" value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
