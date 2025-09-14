import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  Card, 
  CardContent,
  TextField,
  Divider
} from '@mui/material';
import { supabase } from '../services/supabaseClient';
import specSyncService from '../services/specSyncService';

const SupabaseDebugger = () => {
  const [results, setResults] = useState([]);
  const [testMeetingId, setTestMeetingId] = useState('');
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setResults(prev => [...prev, { test, success, data, error, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testConnection = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('meetings').select('count').limit(1);
      if (error) {
        addResult('Connection Test', false, null, error.message);
      } else {
        addResult('Connection Test', true, 'Connected successfully');
      }

      // Test 2: Check meetings table
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .limit(5);
      
      if (meetingsError) {
        addResult('Meetings Table', false, null, meetingsError.message);
      } else {
        addResult('Meetings Table', true, `Found ${meetings.length} meetings`, meetings);
      }

      // Test 3: Check participants table
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .limit(5);
      
      if (participantsError) {
        addResult('Participants Table', false, null, participantsError.message);
      } else {
        addResult('Participants Table', true, `Found ${participants.length} participants`, participants);
      }

      // Test 4: Check annotations table
      const { data: annotations, error: annotationsError } = await supabase
        .from('annotations')
        .select('*')
        .limit(5);
      
      if (annotationsError) {
        addResult('Annotations Table', false, null, annotationsError.message);
      } else {
        addResult('Annotations Table', true, `Found ${annotations.length} annotations`, annotations);
      }

    } catch (error) {
      addResult('General Error', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCreateMeeting = async () => {
    setLoading(true);
    try {
      const result = await specSyncService.createMeeting(
        'Debug Test Meeting',
        '# Test Spec\n\nThis is a test specification for debugging.'
      );
      addResult('Create Meeting', true, 'Meeting created successfully', result);
      setTestMeetingId(result.meetingId);
    } catch (error) {
      addResult('Create Meeting', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testJoinMeeting = async () => {
    if (!testMeetingId) {
      addResult('Join Meeting', false, null, 'No meeting ID to test with');
      return;
    }

    setLoading(true);
    try {
      const result = await specSyncService.joinMeeting(testMeetingId, 'Debug User', 'Tester');
      addResult('Join Meeting', true, 'Joined meeting successfully', result);
    } catch (error) {
      addResult('Join Meeting', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetMeeting = async () => {
    if (!testMeetingId) {
      addResult('Get Meeting', false, null, 'No meeting ID to test with');
      return;
    }

    setLoading(true);
    try {
      const result = await specSyncService.getMeeting(testMeetingId);
      addResult('Get Meeting', true, 'Retrieved meeting successfully', result);
    } catch (error) {
      addResult('Get Meeting', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔧 Supabase Debugger
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={testConnection}
            disabled={loading}
          >
            Test Connection
          </Button>
          <Button 
            variant="outlined" 
            onClick={testCreateMeeting}
            disabled={loading}
          >
            Test Create Meeting
          </Button>
          <Button 
            variant="outlined" 
            onClick={testGetMeeting}
            disabled={loading}
            title={testMeetingId ? `Test with ID: ${testMeetingId}` : 'Create a meeting first'}
          >
            Test Get Meeting
          </Button>
          <Button 
            variant="outlined" 
            onClick={testJoinMeeting}
            disabled={loading}
            title={testMeetingId ? `Test with ID: ${testMeetingId}` : 'Create a meeting first'}
          >
            Test Join Meeting
          </Button>
        </Box>

        {testMeetingId && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Test Meeting ID"
              value={testMeetingId}
              onChange={(e) => setTestMeetingId(e.target.value)}
              size="small"
              fullWidth
              helperText="You can paste any meeting ID here to test with"
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Test Results:
        </Typography>

        {results.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Click a test button to see results
          </Typography>
        )}

        {results.map((result, index) => (
          <Alert 
            key={index} 
            severity={result.success ? 'success' : 'error'} 
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">
              {result.test} ({result.timestamp})
            </Typography>
            {result.success ? (
              <Typography variant="body2">
                ✅ {result.data}
              </Typography>
            ) : (
              <Typography variant="body2">
                ❌ {result.error}
              </Typography>
            )}
            {result.data && typeof result.data === 'object' && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem' }}>
                  {JSON.stringify(result.data, null, 2)}
                </Typography>
              </Box>
            )}
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default SupabaseDebugger;