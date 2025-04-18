
// Follow Deno's module system
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

// Sample recipe images for demonstration
const RECIPE_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2067&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2081&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=2065&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=2010&auto=format&fit=crop',
]

// Sample cooking times
const COOKING_TIMES = ['15 mins', '30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours']

// Sample difficulty levels
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard']

// Sample food tags
const FOOD_TAGS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 
  'Paleo', 'Mediterranean', 'Asian', 'Italian', 'Mexican', 'Quick & Easy',
  'Comfort Food', 'Healthy', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'
]

serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse request body
    const { ingredients } = await req.json()
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
      return new Response(
        JSON.stringify({ error: 'At least 2 ingredients are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Prepare the prompt for OpenAI
    const prompt = `
      Create a recipe using some or all of these ingredients: ${ingredients.join(', ')}.
      
      Format the response as a JSON object with the following structure:
      {
        "title": "Recipe Title",
        "ingredients": ["Ingredient 1 with quantity", "Ingredient 2 with quantity", ...],
        "instructions": ["Step 1", "Step 2", ...],
        "tags": ["tag1", "tag2", ...]
      }
      
      Make the recipe creative, delicious, and practical. Include quantities for ingredients.
      Limit to 5-10 ingredients and 3-7 steps. You can add basic ingredients like salt, pepper, oil, etc.
      Add 2-4 relevant tags for the recipe.
    `
    
    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      })
    })
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate recipe' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const openaiData = await openaiResponse.json()
    const recipeContent = openaiData.choices[0].message.content
    
    // Extract JSON from the response
    let recipeJson
    try {
      // Find JSON object in the response
      const jsonMatch = recipeContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        recipeJson = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (error) {
      console.error('Error parsing recipe JSON:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to parse recipe data' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Add additional recipe metadata
    const recipe = {
      ...recipeJson,
      image_url: RECIPE_IMAGES[Math.floor(Math.random() * RECIPE_IMAGES.length)],
      cooking_time: COOKING_TIMES[Math.floor(Math.random() * COOKING_TIMES.length)],
      difficulty: DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)],
    }
    
    // If no tags were generated, add some random ones based on ingredients
    if (!recipe.tags || recipe.tags.length === 0) {
      recipe.tags = [
        FOOD_TAGS[Math.floor(Math.random() * FOOD_TAGS.length)],
        FOOD_TAGS[Math.floor(Math.random() * FOOD_TAGS.length)]
      ]
      // Remove duplicates
      recipe.tags = [...new Set(recipe.tags)]
    }
    
    return new Response(
      JSON.stringify(recipe),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})