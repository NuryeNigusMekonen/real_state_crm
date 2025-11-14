import React from 'react';
import { TextField, Button, Box } from '@mui/material';
import { userAPI } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

export default function AuthForm({ onSubmit, loading=false } : {
  onSubmit?: (username: string, password: string) => void,
  loading?: boolean
}) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) return onSubmit(username, password);

    try {
      const res = await userAPI.login({ username, password });
      const data = res.data;
      auth.login(data.accessToken, data.role);
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 360, mx: 'auto', mt: 4 }}>
      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth margin="normal" />
      <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" fullWidth margin="normal" />
      <Button type="submit" variant="contained" disabled={loading}>Sign in</Button>
    </Box>
  );
}
