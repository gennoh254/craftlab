/*
  # Add Notifications, CV Support, and Enhanced Features
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add CV fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cv_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cv_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cv_uploaded_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cv_uploaded_at timestamptz;
  END IF;
END $$;

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM admin_users));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- Function to create notification for all users matching criteria
CREATE OR REPLACE FUNCTION notify_matched_users(
  p_opportunity_id uuid,
  p_notification_type text,
  p_title text,
  p_message text
)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, opportunity_id)
  SELECT id, p_notification_type, p_title, p_message, p_opportunity_id
  FROM profiles
  WHERE user_type IN ('attachee', 'intern', 'apprentice', 'volunteer');
END;
$$ LANGUAGE plpgsql;

-- Function to notify specific user
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id uuid,
  p_notification_type text,
  p_title text,
  p_message text,
  p_opportunity_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, opportunity_id)
  VALUES (p_user_id, p_notification_type, p_title, p_message, p_opportunity_id);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify users when new opportunity is posted
CREATE OR REPLACE FUNCTION notify_on_new_opportunity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    PERFORM notify_matched_users(
      NEW.id,
      'opportunity_update',
      'New Opportunity Posted',
      'A new opportunity "' || NEW.title || '" at ' || NEW.company || ' has been posted. Check it out!'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS new_opportunity_notification ON opportunities;
CREATE TRIGGER new_opportunity_notification
  AFTER INSERT ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_opportunity();

-- Create trigger to notify users when opportunity status changes
CREATE OR REPLACE FUNCTION notify_on_opportunity_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_active = false AND NEW.is_active = true THEN
    PERFORM notify_matched_users(
      NEW.id,
      'opportunity_update',
      'Opportunity Reopened',
      'The opportunity "' || NEW.title || '" at ' || NEW.company || ' is now accepting applications again!'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS opportunity_update_notification ON opportunities;
CREATE TRIGGER opportunity_update_notification
  AFTER UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_opportunity_update();

-- Create trigger to notify users when their application status changes
CREATE OR REPLACE FUNCTION notify_on_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  opp_title text;
  opp_company text;
BEGIN
  IF OLD.status != NEW.status THEN
    SELECT title, company INTO opp_title, opp_company
    FROM opportunities WHERE id = NEW.opportunity_id;

    IF NEW.status = 'accepted' THEN
      PERFORM notify_user(
        NEW.user_id,
        'placement_success',
        'Congratulations! Application Accepted',
        'Your application for "' || opp_title || '" at ' || opp_company || ' has been accepted!',
        NEW.opportunity_id
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM notify_user(
        NEW.user_id,
        'application_status',
        'Application Status Update',
        'Your application for "' || opp_title || '" at ' || opp_company || ' status has been updated.',
        NEW.opportunity_id
      );
    ELSIF NEW.status = 'interview' THEN
      PERFORM notify_user(
        NEW.user_id,
        'application_status',
        'Interview Scheduled',
        'You have been shortlisted for an interview for "' || opp_title || '" at ' || opp_company || '!',
        NEW.opportunity_id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_status_notification ON applications;
CREATE TRIGGER application_status_notification
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_application_status_change();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_cv_url ON profiles(cv_url);
