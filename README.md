# SpecSync - AI-Powered Spec Review Meeting Room

Transform vague requirements into crystal-clear specs through AI-facilitated team collaboration and structured review sessions.

## 🚀 Features

- **Pre-meeting Analysis**: Kiro analyzes specs for gaps, ambiguities, and missing requirements
- **Real-time Collaboration**: Multiple participants can annotate and discuss specifications simultaneously
- **AI Facilitation**: Intelligent suggestions and discussion guidance during meetings
- **Automated Summaries**: Generate refined specifications and action items after meetings
- **Seamless Integration**: Built with Kiro's spec-driven development workflow

## 🛠 Tech Stack

- **Frontend**: React, Material-UI, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: SQLite
- **AI Integration**: Kiro IDE with specs, hooks, and conversational AI

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Kiro IDE

## 🏃‍♂️ Quick Start

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

### Creating a Meeting
1. Enter a meeting title and paste your specification content
2. Kiro will automatically analyze the spec for issues and suggestions
3. Add your name and role, then click "Create Meeting & Start Review"

### During the Meeting
1. Share the meeting ID with team members
2. Click on any line in the specification to add annotations
3. Kiro will provide real-time facilitation suggestions
4. Collaborate with your team through threaded discussions

### Ending the Meeting
1. Click "End Meeting & Generate Summary"
2. Review the automated summary with key decisions and action items
3. Export the refined specification for implementation

## 🤖 Kiro Integration

### Spec-Driven Development
- Comprehensive specifications define the meeting flow and AI facilitation logic
- Modular specs for user authentication, WebSocket connections, and analysis engine
- Clear acceptance criteria guide implementation and testing

### Agent Hooks
- **Pre-meeting Analysis**: Automatically triggered when specs are uploaded
- **Real-time Facilitation**: Monitors discussions and provides contextual guidance
- **Post-meeting Summary**: Generates refined specs and action items when meetings end

### Conversational AI
- Natural language discussions with Kiro during development
- AI-generated WebSocket handling with complex state synchronization
- Intelligent conflict resolution and error handling logic

## 📁 Project Structure

```
specsync/
├── .kiro/                    # Kiro configuration
│   ├── specs/               # Specification files
│   ├── hooks/               # Agent hook definitions
│   └── steering/            # Development guidelines
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.js          # Main application
│   └── package.json
├── server/                  # Node.js backend
│   └── index.js            # Express server with Socket.io
└── package.json            # Root package configuration
```

## 🎥 Demo Video

[Link to 3-minute demonstration video showcasing:]
- Chaotic spec review problem
- SpecSync solution in action
- Kiro integration highlights
- Refined specification output

## 🔧 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Database Schema
The application uses SQLite with the following tables:
- `meetings`: Store meeting metadata and analysis results
- `participants`: Track meeting attendees and roles
- `annotations`: Store line-level comments and discussions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Use Kiro's spec-driven development approach
4. Submit a pull request with clear documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Hackathon Submission

Built for the Code with Kiro Hackathon - demonstrating how AI-assisted development can transform the entire software development workflow from specification to implementation.

**Category**: Productivity & Workflow Tools

**Key Innovation**: Solving upstream problems (spec clarity) rather than downstream fixes (code reviews), using AI as an intelligent facilitator rather than just a code generator.