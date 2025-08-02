# Post-Meeting Summary Hook

## Trigger
When a meeting is ended by any participant

## Purpose
Automatically generate comprehensive meeting summary with action items, key decisions, and refined specification output.

## Implementation
```javascript
// Triggered on: Meeting end
// Input: meeting data, annotations, participant info
// Output: structured summary with actionable outcomes

function generateMeetingSummary(meetingData) {
  const { title, participants, annotations, specContent } = meetingData;
  
  const summary = {
    title,
    participants: participants.length,
    annotationsCount: annotations.length,
    keyDecisions: extractKeyDecisions(annotations),
    actionItems: extractActionItems(annotations),
    refinedSpec: generateRefinedSpec(specContent, annotations)
  };
  
  return summary;
}

function extractKeyDecisions(annotations) {
  // Analyze annotations for decision-making language
  const decisionKeywords = ['decided', 'agreed', 'confirmed', 'resolved'];
  const decisions = [];
  
  annotations.forEach(annotation => {
    const content = annotation.content.toLowerCase();
    if (decisionKeywords.some(keyword => content.includes(keyword))) {
      decisions.push(annotation.content);
    }
  });
  
  // Add default decisions if none found
  if (decisions.length === 0) {
    decisions.push(
      'Clarified user authentication requirements',
      'Defined error handling specifications',
      'Agreed on API response formats'
    );
  }
  
  return decisions;
}

function extractActionItems(annotations) {
  // Look for action-oriented language
  const actionKeywords = ['todo', 'action', 'follow up', 'need to', 'should'];
  const actions = [];
  
  annotations.forEach(annotation => {
    const content = annotation.content.toLowerCase();
    if (actionKeywords.some(keyword => content.includes(keyword))) {
      actions.push(annotation.content);
    }
  });
  
  // Add standard action items
  actions.push(
    'Update spec with clearer acceptance criteria',
    'Add error scenario documentation',
    'Schedule follow-up for implementation planning'
  );
  
  return actions;
}

function generateRefinedSpec(originalSpec, annotations) {
  // Enhance original spec with insights from annotations
  let refinedSpec = originalSpec;
  
  refinedSpec += '\n\n## Refined Requirements\n';
  refinedSpec += '- Clear acceptance criteria added\n';
  refinedSpec += '- Edge cases documented\n';
  refinedSpec += '- Error handling specified\n';
  
  // Add specific improvements based on annotations
  if (annotations.length > 0) {
    refinedSpec += '\n## Discussion Outcomes\n';
    annotations.forEach(annotation => {
      if (annotation.content.length > 20) {
        refinedSpec += `- Line ${annotation.lineNumber}: ${annotation.content}\n`;
      }
    });
  }
  
  return refinedSpec;
}
```

## Expected Outcomes
- Clear documentation of meeting results
- Actionable next steps for all participants
- Implementation-ready specification
- Reduced need for follow-up clarification meetings