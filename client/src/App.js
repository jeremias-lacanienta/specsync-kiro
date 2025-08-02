import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import CreateMeeting from './components/CreateMeeting';
import MeetingRoom from './components/MeetingRoom';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for focus commands from Kiro plugin
    const handleMessage = (event) => {
      if (event.data.type === 'focusCreateMeeting') {
        // Scroll to create meeting form or focus on title field
        const titleField = document.querySelector('input[placeholder*="Meeting Title"]');
        if (titleField) {
          titleField.focus();
          titleField.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMeetingCreated = (meetingData) => {
    setCurrentMeeting(meetingData);
  };

  const handleJoinMeeting = (userData) => {
    setUser(userData);
  };

  const handleLeaveMeeting = () => {
    setCurrentMeeting(null);
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SpecSync - AI-Powered Spec Review
          </Typography>
          {currentMeeting && (
            <Typography variant="body2">
              Meeting: {currentMeeting.title}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {!currentMeeting ? (
          <CreateMeeting 
            onMeetingCreated={handleMeetingCreated}
            onJoinMeeting={handleJoinMeeting}
          />
        ) : (
          <MeetingRoom 
            meeting={currentMeeting}
            user={user}
            onLeaveMeeting={handleLeaveMeeting}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;