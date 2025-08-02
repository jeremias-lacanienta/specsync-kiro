# Pre-Meeting Analysis Hook

## Trigger
When a new meeting is created with spec content

## Purpose
Automatically analyze specification content to identify issues, gaps, and discussion points before the meeting begins.

## Implementation
```javascript
// Triggered on: Meeting creation
// Input: spec content, meeting metadata
// Output: analysis object with issues, suggestions, discussion points

function analyzeSpecification(specContent) {
  const analysis = {
    issues: [],
    suggestions: [],
    discussionPoints: []
  };
  
  const lines = specContent.split('\n');
  
  lines.forEach((line, index) => {
    // Check for ambiguous language
    if (line.includes('should') && !line.includes('must')) {
      analysis.issues.push({
        line: index + 1,
        type: 'ambiguity',
        message: 'Consider using "must" instead of "should" for clearer requirements'
      });
    }
    
    // Check for missing user context
    if (line.toLowerCase().includes('user') && !line.includes('role')) {
      analysis.suggestions.push({
        line: index + 1,
        type: 'clarification',
        message: 'Which type of user? Consider specifying user roles'
      });
    }
    
    // Check for missing acceptance criteria
    if (line.toLowerCase().includes('feature') && !specContent.includes('acceptance criteria')) {
      analysis.discussionPoints.push('What are the acceptance criteria for this feature?');
    }
  });
  
  // Add standard discussion points
  analysis.discussionPoints.push(
    'Have we considered edge cases and error scenarios?',
    'Are there any dependencies or constraints we should discuss?',
    'How will we measure success for this implementation?'
  );
  
  return analysis;
}
```

## Expected Outcomes
- Meetings start with clear understanding of spec quality
- Discussion is focused on identified issues
- Teams address gaps before implementation begins
- Reduced back-and-forth during development phase