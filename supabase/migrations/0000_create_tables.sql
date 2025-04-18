
-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  image_url TEXT,
  cooking_time TEXT,
  difficulty TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own recipes
CREATE POLICY "Users can view their own recipes" 
  ON recipes FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own recipes
CREATE POLICY "Users can insert their own recipes" 
  ON recipes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own recipes
CREATE POLICY "Users can update their own recipes" 
  ON recipes FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own recipes
CREATE POLICY "Users can delete their own recipes" 
  ON recipes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on recipes
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();