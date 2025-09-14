-- SpecSync Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    spec_content TEXT,
    analysis TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create annotations table
CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    content TEXT NOT NULL,
    line_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, you'd want more restrictive policies

CREATE POLICY "Allow all operations on meetings" ON meetings
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on participants" ON participants
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on annotations" ON annotations
    FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_annotations_meeting_id ON annotations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_annotations_line_number ON annotations(meeting_id, line_number);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE annotations;