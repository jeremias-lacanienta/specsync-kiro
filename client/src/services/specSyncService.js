import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

class SpecSyncService {
  constructor() {
    this.eventListeners = new Map()
  }

  // Initialize database tables
  async initializeTables() {
    try {
      console.log('🔍 Checking Supabase tables...')
      
      // Test meetings table
      const { data: meetingsTest, error: meetingsError } = await supabase
        .from('meetings')
        .select('id')
        .limit(1)

      if (meetingsError) {
        console.error('❌ Meetings table error:', meetingsError)
        if (meetingsError.code === 'PGRST116') {
          console.log('📝 Tables need to be created in Supabase dashboard')
          console.log('🔗 Go to: https://bglwfktrttfiicxgigfl.supabase.co')
          console.log('📋 Run the SQL from supabase-schema.sql file')
        }
        return false
      }

      // Test participants table
      const { error: participantsError } = await supabase
        .from('participants')
        .select('id')
        .limit(1)

      if (participantsError) {
        console.error('❌ Participants table error:', participantsError)
        return false
      }

      // Test annotations table
      const { error: annotationsError } = await supabase
        .from('annotations')
        .select('id')
        .limit(1)

      if (annotationsError) {
        console.error('❌ Annotations table error:', annotationsError)
        return false
      }

      console.log('✅ All Supabase tables are ready!')
      return true
    } catch (error) {
      console.error('❌ Error checking tables:', error)
      return false
    }
  }

  async createTables() {
    // Note: In production, these tables should be created via Supabase dashboard
    // This is a fallback for demo purposes
    console.log('📝 Tables should be created via Supabase dashboard')
  }

  // Analyze specification content
  analyzeSpec(specContent) {
    const lines = specContent.split('\n')
    const issues = []
    const suggestions = []
    
    lines.forEach((line, index) => {
      if (line.includes('should') && !line.includes('must')) {
        issues.push({
          line: index + 1,
          type: 'ambiguity',
          message: 'Consider using "must" instead of "should" for clearer requirements'
        })
      }
      
      if (line.toLowerCase().includes('user') && !line.includes('role')) {
        suggestions.push({
          line: index + 1,
          type: 'clarification',
          message: 'Which type of user? Consider specifying user roles'
        })
      }
    })
    
    return {
      issues,
      suggestions,
      discussionPoints: [
        'What are the acceptance criteria for this feature?',
        'Have we considered edge cases and error scenarios?',
        'Are there any dependencies or constraints we should discuss?'
      ]
    }
  }

  // Create a new meeting
  async createMeeting(title, specContent) {
    try {
      const meetingId = uuidv4()
      const analysis = this.analyzeSpec(specContent)
      
      const { data, error } = await supabase
        .from('meetings')
        .insert([
          {
            id: meetingId,
            title,
            spec_content: specContent,
            analysis: JSON.stringify(analysis),
            status: 'active'
          }
        ])
        .select()

      if (error) {
        console.error('Error creating meeting:', error)
        throw error
      }

      return { meetingId, analysis }
    } catch (error) {
      console.error('Error in createMeeting:', error)
      throw error
    }
  }

  // Get meeting by ID
  async getMeeting(meetingId) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single()

      if (error) {
        console.error('Error getting meeting:', error)
        throw error
      }

      return {
        ...data,
        specContent: data.spec_content, // Map database field to expected property
        analysis: JSON.parse(data.analysis || '{}')
      }
    } catch (error) {
      console.error('Error in getMeeting:', error)
      throw error
    }
  }

  // Join a meeting
  async joinMeeting(meetingId, userName, role) {
    try {
      console.log('Attempting to join meeting:', meetingId)
      
      // First, check if the meeting exists
      const meeting = await this.getMeeting(meetingId)
      console.log('Meeting found:', meeting)
      
      if (!meeting) {
        throw new Error('Meeting not found')
      }

      // Add participant to the meeting
      const participantId = uuidv4()
      
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .insert([
          {
            id: participantId,
            meeting_id: meetingId,
            name: userName,
            role: role || 'participant'
          }
        ])
        .select()

      if (participantError) {
        console.error('Error adding participant:', participantError)
        // Continue even if participant insertion fails - might be a duplicate
      }
      
      // Get all participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meetingId)

      if (participantsError) {
        console.error('Error getting participants:', participantsError)
      }

      // Get all annotations
      const { data: annotations, error: annotationsError } = await supabase
        .from('annotations')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true })

      if (annotationsError) {
        console.error('Error getting annotations:', annotationsError)
      }

      const result = {
        ...meeting,
        participants: participants || [],
        annotations: annotations || []
      }
      
      console.log('Join meeting result:', result)
      return result
    } catch (error) {
      console.error('Error in joinMeeting:', error)
      throw error
    }
  }

  // Add annotation to meeting
  async addAnnotation(meetingId, content, lineNumber, participantName) {
    try {
      const annotationId = uuidv4()
      
      const { data, error } = await supabase
        .from('annotations')
        .insert([
          {
            id: annotationId,
            meeting_id: meetingId,
            participant_name: participantName,
            content,
            line_number: lineNumber
          }
        ])
        .select()

      if (error) {
        console.error('Error adding annotation:', error)
        throw error
      }

      const annotation = data[0]

      // Simulate Kiro facilitation
      setTimeout(() => {
        const facilitation = this.generateFacilitation(content, lineNumber)
        this.notifyFacilitation(meetingId, facilitation)
      }, 2000)

      return annotation
    } catch (error) {
      console.error('Error in addAnnotation:', error)
      throw error
    }
  }

  // End meeting and generate summary
  async endMeeting(meetingId) {
    try {
      // Update meeting status
      const { error: updateError } = await supabase
        .from('meetings')
        .update({ status: 'completed' })
        .eq('id', meetingId)

      if (updateError) {
        console.error('Error updating meeting status:', updateError)
      }

      // Get meeting data for summary
      const meeting = await this.getMeeting(meetingId)
      
      const { data: participants } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', meetingId)

      const { data: annotations } = await supabase
        .from('annotations')
        .select('*')
        .eq('meeting_id', meetingId)

      const summary = {
        title: meeting.title,
        participants: participants?.length || 0,
        annotationsCount: annotations?.length || 0,
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
        refinedSpec: meeting.spec_content + '\n\n## Refined Requirements\n- Clear acceptance criteria added\n- Edge cases documented\n- Error handling specified'
      }

      return summary
    } catch (error) {
      console.error('Error in endMeeting:', error)
      throw error
    }
  }

  // Generate Kiro facilitation
  generateFacilitation(content, lineNumber) {
    const facilitationOptions = [
      'That\'s an interesting point. How does this relate to our user personas?',
      'Let\'s dig deeper into this requirement. What would success look like?',
      'Good observation. Are there any edge cases we should consider here?',
      'This seems important. Should we add this to our acceptance criteria?',
      'Interesting discussion. Let\'s make sure we capture this in the final spec.'
    ]
    
    return {
      type: 'facilitation',
      message: facilitationOptions[Math.floor(Math.random() * facilitationOptions.length)],
      context: `Regarding line ${lineNumber}: "${content}"`
    }
  }

  // Event notification methods
  notifyFacilitation(meetingId, facilitation) {
    window.dispatchEvent(new CustomEvent('kiro-suggestion', {
      detail: { meetingId, facilitation }
    }))
  }

  // Subscribe to real-time updates
  subscribeToMeeting(meetingId, callbacks) {
    // Subscribe to participants changes
    const participantsSubscription = supabase
      .channel(`participants-${meetingId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'participants', filter: `meeting_id=eq.${meetingId}` },
        (payload) => {
          if (callbacks.onParticipantJoined) {
            callbacks.onParticipantJoined(payload.new)
          }
        }
      )
      .subscribe()

    // Subscribe to annotations changes
    const annotationsSubscription = supabase
      .channel(`annotations-${meetingId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'annotations', filter: `meeting_id=eq.${meetingId}` },
        (payload) => {
          if (callbacks.onNewAnnotation) {
            callbacks.onNewAnnotation(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      participantsSubscription.unsubscribe()
      annotationsSubscription.unsubscribe()
    }
  }
}

export const specSyncService = new SpecSyncService()
export default specSyncService