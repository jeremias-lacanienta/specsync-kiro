// Mock backend service for Amplify deployment
// Simulates SpecSync functionality without requiring Node.js server

class MockSpecSyncService {
  constructor() {
    this.meetings = new Map();
    this.participants = new Map();
    this.annotations = new Map();
  }

  // Simulate pre-meeting analysis
  analyzeSpec(specContent) {
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

  // Create meeting (simulated)
  async createMeeting(title, specContent) {
    const meetingId = 'demo-' + Date.now();
    const analysis = this.analyzeSpec(specContent);
    
    const meeting = {
      id: meetingId,
      title,
      specContent,
      analysis,
      participants: [],
      annotations: [],
      status: 'active'
    };
    
    this.meetings.set(meetingId, meeting);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { meetingId, analysis };
  }

  // Join meeting (simulated)
  async joinMeeting(meetingId, userName, role) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const participant = {
      id: 'participant-' + Date.now(),
      name: userName,
      role: role || 'participant',
      joinedAt: new Date().toISOString()
    };

    meeting.participants.push(participant);
    
    // Simulate real-time update
    setTimeout(() => {
      this.notifyParticipantJoined(meetingId, participant);
    }, 500);

    return meeting;
  }

  // Add annotation (simulated)
  async addAnnotation(meetingId, content, lineNumber, participantName) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    const annotation = {
      id: 'annotation-' + Date.now(),
      participantName,
      content,
      lineNumber,
      timestamp: new Date().toISOString()
    };

    meeting.annotations.push(annotation);

    // Simulate Kiro facilitation
    setTimeout(() => {
      const facilitation = this.generateFacilitation(content, lineNumber);
      this.notifyFacilitation(meetingId, facilitation);
    }, 2000);

    return annotation;
  }

  // Generate meeting summary (simulated)
  async endMeeting(meetingId) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    meeting.status = 'completed';

    const summary = {
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

    return summary;
  }

  // Simulate Kiro facilitation
  generateFacilitation(content, lineNumber) {
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

  // Event simulation methods
  notifyParticipantJoined(meetingId, participant) {
    window.dispatchEvent(new CustomEvent('participant-joined', {
      detail: { meetingId, participant }
    }));
  }

  notifyFacilitation(meetingId, facilitation) {
    window.dispatchEvent(new CustomEvent('kiro-suggestion', {
      detail: { meetingId, facilitation }
    }));
  }

  notifyNewAnnotation(meetingId, annotation) {
    window.dispatchEvent(new CustomEvent('new-annotation', {
      detail: { meetingId, annotation }
    }));
  }
}

// Export singleton instance
export const mockSpecSyncService = new MockSpecSyncService();
export default mockSpecSyncService;