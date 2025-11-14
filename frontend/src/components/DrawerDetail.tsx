import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';

export default function DrawerDetail({ open, onClose, children } : {
  open: boolean,
  onClose: () => void,
  children?: React.ReactNode
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 480, p: 2 }}>
        {children}
      </Box>
    </Drawer>
  );
}
