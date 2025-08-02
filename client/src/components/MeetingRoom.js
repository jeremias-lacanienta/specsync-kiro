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
  DialogActions
} from '@mui/material';
import {
  ExitToApp,
  Send,
  Psychology,
  Group,
  Assignment,
  CheckCircle
} from '@mui/icons-material';
import io from 'socket.io-client';

const MeetingRoom = ({ meeting, user, onLeaveMeeting }) => {
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedLine, setSelectedLine] = useState(null);
  const [kiroSuggestions, setKiroSuggestions] = useState([]);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [meetingSummary, setMeetingSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  
  const specRef = useRef(null);
  const specLines = meeting.specContent.split('\n');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join the meeting
    newSocket.emit('join-meeting', {
      meetingId: meeting.id,
      userName: user.name,
      role: user.role
    });

    // Socket event listeners
    newSocket.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    newSocket.on('participant-left', (participant) => {
      setParticipants(prev => prev.filter(p => p.id !== participant.id));
    });

    newSocket.on('meeting-state', (state) => {
      setParticipants(state.participants || []);
      setAnnotations(state.annotations || []);
    });

    newSocket.on('new-annotation', (annotation) => {
      setAnnotations(prev => [...prev, annotation]);
    });

    newSocket.on('kiro-suggestion', (suggestion) => {
      setKiroSuggestions(prev => [...prev, { ...suggestion, id: Date.now() }]);
    });

    newSocket.on('meeting-ended', ({ summary }) => {
      setMeetingEnded(true);
      setMeetingSummary(summary);
      setShowSummary(true);
    });

    return () => {
      newSocket.close();
    };
  }, [meeting.id, user.name, user.role]);

  const handleLineClick = (lineIndex) => {
    setSelectedLine(lineIndex);
  };

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim() || selectedLine === null || !socket) return;

    socket.emit('add-annotation', {
      meetingId: meeting.id,
      content: newAnnotation.trim(),
      lineNumber: selectedLine + 1
    });

    setNewAnnotation('');
    setSelectedLine(null);
  };

  const handleEndMeeting = () => {
    if (socket) {
      socket.emit('end-meeting', { meetingId: meeting.id });
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
              <Typography variant="h6">{meeting.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
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
    </Box>
  );
};

export default MeetingRoom;