import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  ExitToApp,
  Send,
  Psychology,
  Group,
  Assignment,
  CheckCircle,
  ContentCopy,
  Share
} from '@mui/icons-material';
import specSyncService from '../services/specSyncService';

const MeetingRoom = ({ meeting, user, onLeaveMeeting }) => {
  const [participants, setParticipants] = useState(meeting.participants || []);
  const [annotations, setAnnotations] = useState(meeting.annotations || []);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedLine, setSelectedLine] = useState(null);
  const [kiroSuggestions, setKiroSuggestions] = useState([]);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const specRef = useRef(null);
  const specLines = meeting.specContent.split('\n');

  // Copy meeting ID to clipboard
  const copyMeetingId = async () => {
    try {
      await navigator.clipboard.writeText(meeting.id);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy meeting ID:', err);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = specSyncService.subscribeToMeeting(meeting.id, {
      onParticipantJoined: (participant) => {
        setParticipants(prev => [...prev, participant]);
      },
      onNewAnnotation: (annotation) => {
        setAnnotations(prev => [...prev, annotation]);
      }
    });

    return unsubscribe;
  }, [meeting.id]);

  // Listen for Kiro suggestions
  useEffect(() => {
    const handleKiroSuggestion = (event) => {
      if (event.detail.meetingId === meeting.id) {
        setKiroSuggestions(prev => [...prev, event.detail.facilitation]);
      }
    };

    window.addEventListener('kiro-suggestion', handleKiroSuggestion);
    return () => window.removeEventListener('kiro-suggestion', handleKiroSuggestion);
  }, [meeting.id, user.name, user.role]);

  const handleLineClick = (lineIndex) => {
    setSelectedLine(lineIndex);
  };

  const handleAddAnnotation = async () => {
    if (!newAnnotation.trim() || selectedLine === null) return;

    try {
      const annotation = await specSyncService.addAnnotation(
        meeting.id,
        newAnnotation.trim(),
        selectedLine + 1,
        user.name
      );

      setAnnotations(prev => [...prev, annotation]);
      setNewAnnotation('');
      setSelectedLine(null);
    } catch (err) {
      console.error('Failed to add annotation:', err);
    }
  };

  const handleEndMeeting = async () => {
    try {
      const summary = await specSyncService.endMeeting(meeting.id);
      setMeetingEnded(true);
      setMeetingSummary(summary);
      setShowSummary(true);
    } catch (err) {
      console.error('Failed to end meeting:', err);
    }
  };

  const getLineAnnotations = (lineIndex) => {
    return annotations.filter(ann => ann.lineNumber === lineIndex + 1);
  };

  const hasAnnotations = (lineIndex) => {
    return getLineAnnotations(lineIndex).length > 0;
  };

  const dismissSuggestion = (suggestionId) => {
    setKiroSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Main Spec Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">{meeting.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Meeting ID:
                  </Typography>
                  <Chip 
                    label={meeting.id}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={copyMeetingId}
                    title="Copy Meeting ID"
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  icon={<Group />} 
                  label={`${participants.length} participants`} 
                  size="small" 
                />
                <Chip 
                  icon={<Assignment />} 
                  label={`${annotations.length} annotations`} 
                  size="small" 
                />
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <div ref={specRef} className="spec-editor">
                {specLines.map((line, index) => (
                  <div key={index}>
                    <div
                      className={`spec-line ${hasAnnotations(index) ? 'has-annotation' : ''} ${selectedLine === index ? 'selected' : ''}`}
                      onClick={() => handleLineClick(index)}
                      style={{
                        backgroundColor: selectedLine === index ? '#e3f2fd' : 'transparent',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        margin: '2px 0'
                      }}
                    >
                      <span style={{ color: '#666', marginRight: '12px', fontSize: '12px' }}>
                        {index + 1}
                      </span>
                      {line}
                    </div>
                    
                    {/* Show annotations for this line */}
                    {getLineAnnotations(index).map(annotation => (
                      <div key={annotation.id} className="annotation" style={{ marginLeft: '40px', marginBottom: '8px' }}>
                        <div className="annotation-author">
                          {annotation.participantName}
                        </div>
                        <div className="annotation-content">
                          {annotation.content}
                        </div>
                        <div className="annotation-timestamp">
                          {new Date(annotation.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Box>

            {/* Add Annotation */}
            {selectedLine !== null && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add annotation to line {selectedLine + 1}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    placeholder="Add your comment or question..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAnnotation()}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddAnnotation}
                    startIcon={<Send />}
                    disabled={!newAnnotation.trim()}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            {/* Participants */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Participants
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {participants.map(participant => (
                    <Chip
                      key={participant.id}
                      label={`${participant.name} (${participant.role})`}
                      size="small"
                      color={participant.name === user.name ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Kiro Analysis */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Kiro Analysis
                </Typography>
                
                {meeting.analysis.issues.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="error">Issues Found:</Typography>
                    <List dense>
                      {meeting.analysis.issues.map((issue, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Line ${issue.line}: ${issue.message}`}
                            secondary={issue.type}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {meeting.analysis.suggestions.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="warning.main">Suggestions:</Typography>
                    <List dense>
                      {meeting.analysis.suggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Line ${suggestion.line}: ${suggestion.message}`}
                            secondary={suggestion.type}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Typography variant="subtitle2" color="primary">Discussion Points:</Typography>
                <List dense>
                  {meeting.analysis.discussionPoints.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Kiro Suggestions */}
            {kiroSuggestions.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Kiro Suggestions
                  </Typography>
                  {kiroSuggestions.map(suggestion => (
                    <Alert
                      key={suggestion.id}
                      severity="info"
                      onClose={() => dismissSuggestion(suggestion.id)}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {suggestion.message}
                      </Typography>
                      {suggestion.context && (
                        <Typography variant="caption" display="block">
                          {suggestion.context}
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card sx={{ mt: 'auto' }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleEndMeeting}
                    startIcon={<CheckCircle />}
                    disabled={meetingEnded}
                  >
                    End Meeting & Generate Summary
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onLeaveMeeting}
                    startIcon={<ExitToApp />}
                  >
                    Leave Meeting
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Meeting Summary Dialog */}
      <Dialog
        open={showSummary}
        onClose={() => setShowSummary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Meeting Summary</DialogTitle>
        <DialogContent>
          {meetingSummary && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {meetingSummary.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {meetingSummary.participants} participants • {meetingSummary.annotationsCount} annotations
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Key Decisions:</Typography>
              <List>
                {meetingSummary.keyDecisions.map((decision, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={decision} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" gutterBottom>Action Items:</Typography>
              <List>
                {meetingSummary.actionItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" gutterBottom>Refined Specification:</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
                  {meetingSummary.refinedSpec}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSummary(false)}>Close</Button>
          <Button variant="contained" onClick={onLeaveMeeting}>
            Leave Meeting
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Meeting ID copied to clipboard!"
      />
    </Box>
  );
};

export default MeetingRoom;