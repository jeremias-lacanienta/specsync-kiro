import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bglwfktrttfiicxgigfl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbHdma3RydHRmaWljeGdpZ2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzI4ODcsImV4cCI6MjA3MzQwODg4N30.EHt8QoLJ8BQwuhB61x4e5E8AU3MzmvSh_C9bSLDwUqE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database table creation (run once to set up tables)
export const initializeTables = async () => {
  try {
    // Create meetings table
    const { error: meetingsError } = await supabase.rpc('create_meetings_table', {})
    if (meetingsError && !meetingsError.message.includes('already exists')) {
      console.error('Error creating meetings table:', meetingsError)
    }

    // Create participants table
    const { error: participantsError } = await supabase.rpc('create_participants_table', {})
    if (participantsError && !participantsError.message.includes('already exists')) {
      console.error('Error creating participants table:', participantsError)
    }

    // Create annotations table
    const { error: annotationsError } = await supabase.rpc('create_annotations_table', {})
    if (annotationsError && !annotationsError.message.includes('already exists')) {
      console.error('Error creating annotations table:', annotationsError)
    }

    console.log('✅ Supabase tables initialized')
  } catch (error) {
    console.error('Error initializing tables:', error)
  }
}

export default supabase