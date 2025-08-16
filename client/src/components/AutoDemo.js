import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';

const AutoDemo = ({ isActive, onComplete }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h3>🚀 Welcome to SpecSync!</h3>
          <p>AI-powered specification review meetings built with Kiro</p>
          <p>This demo will show you all the key features automatically</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="meeting-title"]',
      content: (
        <div>
          <h4>📝 Meeting Title</h4>
          <p>Start by giving your specification review meeting a descriptive title</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="spec-content"]',
      content: (
        <div>
          <h4>📄 Specification Content</h4>
          <p>Paste your specification here. Kiro will analyze it for issues and improvements</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="sample-spec"]',
      content: (
        <div>
          <h4>🎯 Load Sample Spec</h4>
          <p>Let's load a sample specification to see how SpecSync works</p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="user-info"]',
      content: (
        <div>
          <h4>👤 User Information</h4>
          <p>Enter your name and role for the meeting. This helps with collaboration tracking</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="create-meeting"]',
      content: (
        <div>
          <h4>🎬 Create Meeting</h4>
          <p>This button creates the meeting and starts Kiro's AI analysis of your specification</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="join-meeting"]',
      content: (
        <div>
          <h4>🤝 Join Existing Meeting</h4>
          <p>Team members can join existing meetings using a meeting ID for real-time collaboration</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="features"]',
      content: (
        <div>
          <h4>✨ Key Features</h4>
          <p>SpecSync provides AI analysis, real-time collaboration, and automated meeting summaries</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3>🎉 Demo Complete!</h3>
          <p>SpecSync transforms vague requirements into crystal-clear specifications through:</p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>🤖 AI-powered pre-meeting analysis</li>
            <li>👥 Real-time collaborative review</li>
            <li>🎯 Intelligent meeting facilitation</li>
            <li>📋 Automated summaries and action items</li>
          </ul>
          <p><strong>Built with Kiro using conversational coding, agent hooks, and spec-driven development!</strong></p>
        </div>
      ),
      placement: 'center',
    },
  ];

  useEffect(() => {
    if (isActive) {
      setRun(true);
      setStepIndex(0);
    }
  }, [isActive]);

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Auto-fill demo data when reaching certain steps
      if (index === 3 && action === ACTIONS.NEXT) {
        // Auto-click "Load Sample Spec" button
        setTimeout(() => {
          const sampleButton = document.querySelector('[data-tour="sample-spec"]');
          if (sampleButton) {
            sampleButton.click();
          }
        }, 500);
      }
      
      if (index === 4 && action === ACTIONS.NEXT) {
        // Auto-fill user information
        setTimeout(() => {
          const nameField = document.querySelector('input[placeholder*="John Doe"]');
          const roleField = document.querySelector('input[placeholder*="Product Manager"]');
          
          if (nameField) {
            nameField.focus();
            nameField.value = 'Demo User';
            nameField.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          if (roleField) {
            roleField.focus();
            roleField.value = 'Product Manager';
            roleField.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 500);
      }

      // Update state to advance the tour
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRun(false);
      setStepIndex(0);
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={run}
      stepIndex={stepIndex}
      steps={steps}
      showProgress={true}
      showSkipButton={true}
      styles={{
        options: {
          primaryColor: '#1976d2',
          textColor: '#333',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#fff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        tooltipContainer: {
          textAlign: 'center',
        },
        buttonNext: {
          backgroundColor: '#1976d2',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
        },
        buttonBack: {
          color: '#1976d2',
          fontSize: '14px',
          padding: '8px 16px',
        },
        buttonSkip: {
          color: '#666',
          fontSize: '12px',
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish Demo',
        next: 'Next',
        skip: 'Skip Demo',
      }}
    />
  );
};

export default AutoDemo;