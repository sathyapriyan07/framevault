-- Add Admin User Query
-- Run this in Supabase SQL Editor after signing up a user

-- Step 1: First, sign up a user through your app or Supabase Auth UI
-- Step 2: Find the user's UUID from the auth.users table:
SELECT id, email FROM auth.users;

-- Step 3: Insert the user into the users table with admin role
-- Replace 'YOUR_USER_UUID' with the actual UUID from Step 2
-- Replace 'your-email@example.com' with your actual email

INSERT INTO users (id, email, role)
VALUES ('YOUR_USER_UUID', 'your-email@example.com', 'admin');

-- OR if you want to update an existing user to admin:
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify admin status:
SELECT * FROM users WHERE role = 'admin';
