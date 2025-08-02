const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Database setup
const db = new sqlite3.Database('./specsync.db');

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    spec_content TEXT,
    analysis TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    name TEXT NOT NULL,
    role TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    meeting_id TEXT,
    participant_id TEXT,
    content TEXT NOT NULL,
    line_number INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
  )`);
});

// Store active meetings and participants
const activeMeetings = new Map();
const participants = new Map();

// API Routes
app.post('/api/meetings', (req, res) => {
  const { title, specContent } = req.body;
  const meetingId = uuidv4();
  
  // Simulate Kiro's spec analysis
  const analysis = analyzeSpec(specContent);
  
  db.run(
    'INSERT INTO meetings (id, title, spec_content, analysis) VALUES (?, ?, ?, ?)',
    [meetingId, title, specContent, JSON.stringify(analysis)],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      activeMeetings.set(meetingId, {
        id: meetingId,
        title,
        specContent,
        analysis,
        participants: [],
        annotations: []
      });
      
      res.json({ meetingId, analysis });
    }
  );
});

app.get('/api/meetings/:id', (req, res) => {
  const meetingId = req.params.id;
  
  db.get('SELECT * FROM meetings WHERE id = ?', [meetingId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }
    
    const meeting = {
      ...row,
      analysis: JSON.parse(row.analysis || '{}')
    };
    
    res.json(meeting);
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-meeting', ({ meetingId, userName, role }) => {
    const participantId = uuidv4();
    
    socket.join(meetingId);
    socket.meetingId = meetingId;
    socket.participantId = participantId;
    
    const participant = {
      id: participantId,
      socketId: socket.id,
      name: userName,
      role: role || 'participant'
    };
    
    participants.set(socket.id, participant);
    
    // Add to active meeting
    if (activeMeetings.has(meetingId)) {
      activeMeetings.get(meetingId).participants.push(participant);
    }
    
    // Save to database
    db.run(
      'INSERT INTO participants (id, meeting_id, name, role) VALUES (?, ?, ?, ?)',
      [participantId, meetingId, userName, role]
    );
    
    // Notify other participants
    socket.to(meetingId).emit('participant-joined', participant);
    
    // Send current meeting state
    if (activeMeetings.has(meetingId)) {
      socket.emit('meeting-state', activeMeetings.get(meetingId));
    }
  });

  socket.on('add-annotation', ({ meetingId, content, lineNumber }) => {
    const participant = participants.get(socket.id);
    if (!participant) return;
    
    const annotation = {
      id: uuidv4(),
      participantId: participant.id,
      participantName: participant.name,
      content,
      lineNumber,
      timestamp: new Date().toISOString()
    };
    
    // Save to database
    db.run(
      'INSERT INTO annotations (id, meeting_id, participant_id, content, line_number) VALUES (?, ?, ?, ?, ?)',
      [annotation.id, meetingId, participant.id, content, lineNumber]
    );
    
    // Add to active meeting
    if (activeMeetings.has(meetingId)) {
      activeMeetings.get(meetingId).annotations.push(annotation);
    }
    
    // Broadcast to all participants
    io.to(meetingId).emit('new-annotation', annotation);
    
    // Trigger Kiro facilitation
    setTimeout(() => {
      const facilitation = generateFacilitation(content, lineNumber);
      io.to(meetingId).emit('kiro-suggestion', facilitation);
    }, 2000);
  });

  socket.on('end-meeting', ({ meetingId }) => {
    if (activeMeetings.has(meetingId)) {
      const meeting = activeMeetings.get(meetingId);
      const summary = generateMeetingSummary(meeting);
      
      // Update meeting status
      db.run(
        'UPDATE meetings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['completed', meetingId]
      );
      
      io.to(meetingId).emit('meeting-ended', { summary });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const participant = participants.get(socket.id);
    if (participant && socket.meetingId) {
      socket.to(socket.meetingId).emit('participant-left', participant);
      
      // Remove from active meeting
      if (activeMeetings.has(socket.meetingId)) {
        const meeting = activeMeetings.get(socket.meetingId);
        meeting.participants = meeting.participants.filter(p => p.socketId !== socket.id);
      }
    }
    
    participants.delete(socket.id);
  });
});

// Kiro AI simulation functions
function analyzeSpec(specContent) {
  // Simulate Kiro's spec analysis
  const lines = specContent.split('\n');
  const issues = [];
  const suggestions = [];
  
  lines.forEach((line, index) => {
    if (line.includes('should') && !line.includes('must')) {
      issues.push({
        line: index + 1,
        type: 'ambiguity',
        message: 'Consider using "must" instead of "should" for clearer requirements'
      });
    }
    
    if (line.toLowerCase().includes('user') && !line.includes('role')) {
      suggestions.push({
        line: index + 1,
        type: 'clarification',
        message: 'Which type of user? Consider specifying user roles'
      });
    }
  });
  
  return {
    issues,
    suggestions,
    discussionPoints: [
      'What are the acceptance criteria for this feature?',
      'Have we considered edge cases and error scenarios?',
      'Are there any dependencies or constraints we should discuss?'
    ]
  };
}

function generateFacilitation(content, lineNumber) {
  const facilitationOptions = [
    'That\'s an interesting point. How does this relate to our user personas?',
    'Let\'s dig deeper into this requirement. What would success look like?',
    'Good observation. Are there any edge cases we should consider here?',
    'This seems important. Should we add this to our acceptance criteria?',
    'Interesting discussion. Let\'s make sure we capture this in the final spec.'
  ];
  
  return {
    type: 'facilitation',
    message: facilitationOptions[Math.floor(Math.random() * facilitationOptions.length)],
    context: `Regarding line ${lineNumber}: "${content}"`
  };
}

function generateMeetingSummary(meeting) {
  return {
    title: meeting.title,
    participants: meeting.participants.length,
    annotationsCount: meeting.annotations.length,
    keyDecisions: [
      'Clarified user authentication requirements',
      'Defined error handling specifications',
      'Agreed on API response formats'
    ],
    actionItems: [
      'Update spec with clearer acceptance criteria',
      'Add error scenario documentation',
      'Schedule follow-up for implementation planning'
    ],
    refinedSpec: meeting.specContent + '\n\n## Refined Requirements\n- Clear acceptance criteria added\n- Edge cases documented\n- Error handling specified'
  };
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SpecSync server running on port ${PORT}`);
});