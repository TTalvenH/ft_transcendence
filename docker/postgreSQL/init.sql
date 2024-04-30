

CREATE TABLE user_data (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    data TEXT
);


-- Enable RLS for the table
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that restricts data access based on the user_id
CREATE POLICY user_access_policy ON user_data
    USING (user_id = current_user);
