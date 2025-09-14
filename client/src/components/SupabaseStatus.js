import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Typography, CircularProgress } from '@mui/material';
import specSyncService from '../services/specSyncService';

const SupabaseStatus = () => {
  const [tablesReady, setTablesReady] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    setChecking(true);
    try {
      const ready = await specSyncService.initializeTables();
      setTablesReady(ready);
    } catch (error) {
      console.error('Error checking tables:', error);
      setTablesReady(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={20} />
        <Typography>Checking Supabase tables...</Typography>
      </Box>
    );
  }

  if (tablesReady === false) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Supabase Tables Not Set Up
        </Typography>
        <Typography variant="body2" gutterBottom>
          The database tables need to be created in your Supabase dashboard.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" component="div">
            <strong>Steps to fix:</strong>
            <ol>
              <li>Go to: <a href="https://bglwfktrttfiicxgigfl.supabase.co" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></li>
              <li>Click "SQL Editor" in the left sidebar</li>
              <li>Copy and paste the SQL from <code>supabase-schema.sql</code> file</li>
              <li>Click "Run" to create the tables</li>
              <li>Refresh this page</li>
            </ol>
          </Typography>
        </Box>
        <Button variant="outlined" onClick={checkTables} sx={{ mt: 2 }}>
          Check Again
        </Button>
      </Alert>
    );
  }

  if (tablesReady === true) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          ✅ Supabase tables are ready! SpecSync should work properly.
        </Typography>
      </Alert>
    );
  }

  return null;
};

export default SupabaseStatus;