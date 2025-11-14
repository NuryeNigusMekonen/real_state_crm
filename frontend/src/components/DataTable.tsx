import React from 'react';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function DataTable({ columns, rows, loading = false } : {
  columns: string[],
  rows: string[][],
  loading?: boolean
}) {
  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((c) => <TableCell key={c}>{c}</TableCell>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r, idx) => (
          <TableRow key={idx}>
            {r.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
