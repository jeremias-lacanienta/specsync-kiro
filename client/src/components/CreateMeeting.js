import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { Add, VideoCall, Person, Description, Folder } from '@mui/icons-material';
import specSyncService from '../services/specSyncService';
import { useKiroIntegration } from '../hooks/useKiroIntegration';

const CreateMeeting = ({ onMeetingCreated, onJoinMeeting }) => {
  const [title, setTitle] = useState('');
  const [specContent, setSpecContent] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    isKiroEnvironment, 
    workspaceFiles, 
    readWorkspaceFile, 
    writeWorkspaceFile, 
    showKiroMessage 
  } = useKiroIntegration();

  const sampleSpec = `# User Authentication Feature

## Overview
Implement secure user authentication system for the web application.

## Requirements
- Users should be able to register with email and password
- Users should be able to login with existing credentials
- Password reset functionality should be available
- Session management should be implemented

## Acceptance Criteria
- Registration form validates email format
- Password must meet security requirements
- Login redirects to dashboard on success
- Logout clears session data

## Technical Notes
- Use JWT tokens for session management
- Implement rate limiting for login attempts
- Store passwords using bcrypt hashing`;

  const handleCreateMeeting = async () => {
    if (!title.trim() || !specContent.trim() || !userName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await specSyncService.createMeeting(
        title.trim(),
        specContent.trim()
      );

      const meetingData = {
        id: response.meetingId,
        title: title.trim(),
        specContent: specContent.trim(),
        analysis: response.analysis
      };

      const userData = {
        name: userName.trim(),
        role: userRole.trim() || 'participant'
      };

      onMeetingCreated(meetingData);
      onJoinMeeting(userData);
    } catch (err) {
      setError('Failed to create meeting. Please try again.');
      console.error('Error creating meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinExisting = () => {
    if (!meetingId.trim() || !userName.trim()) {
      setError('Please enter meeting ID and your name');
      return;
    }

    // For demo purposes, we'll simulate joining an existing meeting
    const meetingData = {
      id: meetingId.trim(),
      title: 'Existing Meeting',
      specContent: sampleSpec,
      analysis: {
        issues: [],
        suggestions: [],
        discussionPoints: ['Review existing requirements']
      }
    };

    const userData = {
      name: userName.trim(),
      role: userRole.trim() || 'participant'
    };

    onMeetingCreated(meetingData);
    onJoinMeeting(userData);
  };

  const loadSampleSpec = () => {
    setSpecContent(sampleSpec);
    setTitle('User Authentication Feature Review');
  };

  const loadWorkspaceFile = async (filePath) => {
    try {
      const content = await readWorkspaceFile(filePath);
      setSpecContent(content);
      setTitle(`Review: ${filePath}`);
      showKiroMessage(`Loaded ${filePath} from workspace`);
    } catch (err) {
      setError(`Failed to load file: ${err.message}`);
    }
  };

  const saveSpecToWorkspace = async () => {
    if (!specContent.trim() || !title.trim()) {
      setError('Please provide both title and content');
      return;
    }

    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    try {
      await writeWorkspaceFile(`specs/${fileName}`, specContent);
      showKiroMessage(`Saved specification to specs/${fileName}`);
    } catch (err) {
      setError(`Failed to save file: ${err.message}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Welcome to SpecSync
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered specification review meetings that transform vague requirements into crystal-clear specs
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Create New Meeting */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Add sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Create New Meeting</Typography>
              </Box>

              <TextField
                fullWidth
                label="Meeting Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 3 }}
                placeholder="e.g., User Authentication Feature Review"
                data-tour="meeting-title"
              />

              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">Specification Content</Typography>
                <Button size="small" onClick={loadSampleSpec} data-tour="sample-spec">
                  Load Sample Spec
                </Button>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={12}
                value={specContent}
                onChange={(e) => setSpecContent(e.target.value)}
                placeholder="Paste your specification content here..."
                sx={{ 
                  mb: 3,
                  '& .MuiInputBase-input': {
                    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
                    fontSize: '14px'
                  }
                }}
                data-tour="spec-content"
              />

              <Grid container spacing={2} sx={{ mb: 3 }} data-tour="user-info">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Role (optional)"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="e.g., Product Manager, Developer"
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                size="large"
                onClick={handleCreateMeeting}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <VideoCall />}
                fullWidth
                data-tour="create-meeting"
              >
                {loading ? 'Creating Meeting...' : 'Create Meeting & Start Review'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Join Existing Meeting */}
        <Grid item xs={12} md={4}>
          <Card data-tour="join-meeting">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Join Existing Meeting</Typography>
              </Box>

              <TextField
                fullWidth
                label="Meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter meeting ID"
              />

              <TextField
                fullWidth
                label="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="e.g., John Doe"
              />

              <TextField
                fullWidth
                label="Your Role (optional)"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                sx={{ mb: 3 }}
                placeholder="e.g., Developer, Tester"
              />

              <Button
                variant="outlined"
                fullWidth
                onClick={handleJoinExisting}
                startIcon={<VideoCall />}
              >
                Join Meeting
              </Button>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Kiro Workspace Integration */}
          {isKiroEnvironment && (
            <>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Folder sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Workspace Files</Typography>
                    <Chip 
                      label="Kiro" 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1 }} 
                    />
                  </Box>
                  
                  {workspaceFiles.length > 0 ? (
                    <List dense>
                      {workspaceFiles.map((file) => (
                        <ListItem key={file.path} disablePadding>
                          <ListItemButton onClick={() => loadWorkspaceFile(file.path)}>
                            <Description sx={{ mr: 1, fontSize: 16 }} />
                            <ListItemText 
                              primary={file.name}
                              secondary={file.path}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No .md files found in workspace
                    </Typography>
                  )}
                  
                  {specContent && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={saveSpecToWorkspace}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Save to Workspace
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Features Overview */}
          <Card data-tour="features">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What SpecSync Does
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Pre-meeting Analysis:</strong> Kiro analyzes your spec for gaps and ambiguities
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>AI Facilitation:</strong> Real-time suggestions and discussion guidance
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Collaborative Review:</strong> Team annotations and threaded discussions
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Refined Output:</strong> Generate implementation-ready specifications
                  </Typography>
                </li>
                {isKiroEnvironment && (
                  <li>
                    <Typography variant="body2">
                      <strong>Kiro Integration:</strong> Load specs from workspace and save refined versions
                    </Typography>
                  </li>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateMeeting;