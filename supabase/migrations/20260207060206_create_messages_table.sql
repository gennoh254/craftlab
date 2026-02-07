/*
  # Create Messages Table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `sender_id` (uuid, foreign key) - References the user who sent the message
      - `recipient_id` (uuid, foreign key) - References the user who receives the message
      - `content` (text) - Message content
      - `read` (boolean) - Whether the message has been read
      - `created_at` (timestamptz) - When the message was sent
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on messages table
    - Allow users to view messages they sent or received
    - Allow authenticated users to send messages
    - Allow users to mark their received messages as read
    - Allow users to delete their own messages (soft delete via read status preferred)

  3. Notes
    - Messages are indexed by both sender and recipient for efficient queries
    - Read status tracks message delivery/reading state
    - Supports one-to-one messaging between users
    - Indexed for fast conversation retrieval
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages (sent or received)"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark received messages as read"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_unread_idx ON messages(recipient_id, read) WHERE NOT read;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
