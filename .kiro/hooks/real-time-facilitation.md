# Real-time Facilitation Hook

## Trigger
During active meeting sessions when annotations are added

## Purpose
Provide intelligent, context-aware facilitation to keep discussions productive and focused.

## Implementation
```javascript
// Triggered on: New annotation added
// Input: annotation content, meeting context, discussion history
// Output: facilitation suggestion or guidance

function provideFacilitation(annotation, meetingContext) {
  const { content, lineNumber } = annotation;
  const facilitation = {
    type: 'facilitation',
    message: '',
    context: `Regarding line ${lineNumber}: "${content}"`
  };
  
  // Analyze annotation for facilitation opportunities
  if (isQuestionAsking(content)) {
    facilitation.message = generateClarifyingResponse(content);
  } else if (isOffTopic(content, meetingContext)) {
    facilitation.message = "That's an interesting point. How does this relate to our current specification?";
  } else if (isVagueStatement(content)) {
    facilitation.message = "Let's dig deeper into this requirement. What would success look like?";
  } else if (isGoodObservation(content)) {
    facilitation.message = "Good observation. Should we add this to our acceptance criteria?";
  } else {
    facilitation.message = getRandomFacilitation();
  }
  
  return facilitation;
}

function isQuestionAsking(content) {
  return content.includes('?') || content.toLowerCase().startsWith('what') || 
         content.toLowerCase().startsWith('how') || content.toLowerCase().startsWith('why');
}

function generateClarifyingResponse(content) {
  const responses = [
    "That's a great question. Let's explore this together.",
    "Good point to clarify. What are everyone's thoughts on this?",
    "This seems important to resolve. Any insights from the team?",
    "Let's make sure we address this before moving forward."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function isOffTopic(content, meetingContext) {
  // Simple heuristic - check if content relates to spec keywords
  const specKeywords = meetingContext.specContent.toLowerCase().split(' ');
  const contentWords = content.toLowerCase().split(' ');
  const overlap = contentWords.filter(word => specKeywords.includes(word));
  return overlap.length < 2;
}

function isVagueStatement(content) {
  const vaguePhrases = ['somehow', 'maybe', 'probably', 'might', 'could be'];
  return vaguePhrases.some(phrase => content.toLowerCase().includes(phrase));
}

function isGoodObservation(content) {
  const positiveIndicators = ['important', 'critical', 'must', 'required', 'essential'];
  return positiveIndicators.some(indicator => content.toLowerCase().includes(indicator));
}

function getRandomFacilitation() {
  const facilitationOptions = [
    "That's an interesting point. How does this relate to our user personas?",
    "Let's dig deeper into this requirement. What would success look like?",
    "Good observation. Are there any edge cases we should consider here?",
    "This seems important. Should we add this to our acceptance criteria?",
    "Interesting discussion. Let's make sure we capture this in the final spec."
  ];
  
  return facilitationOptions[Math.floor(Math.random() * facilitationOptions.length)];
}
```

## Facilitation Strategies
- **Question Encouragement**: Acknowledge good questions and invite broader discussion
- **Focus Redirection**: Gently guide off-topic discussions back to the specification
- **Depth Seeking**: Push for specificity when statements are too vague
- **Decision Capture**: Suggest when insights should be formalized in the spec
- **Participation Balance**: Encourage quieter participants to contribute

## Expected Outcomes
- More focused and productive discussions
- Better participation from all team members
- Clearer decision-making processes
- Reduced meeting time while improving outcomes