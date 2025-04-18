
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Plus, X, Save, ChefHat } from 'lucide-react'
import { toast } from './ui/use-toast'
import { RecipeCard } from './recipe-card'

export function RecipeGenerator({ supabase, user }) {
  const [ingredients, setIngredients] = useState([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient('')
    }
  }

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIngredient()
    }
  }

  const generateRecipe = async () => {
    if (ingredients.length < 2) {
      toast({
        variant: "destructive",
        title: "Not enough ingredients",
        description: "Please add at least 2 ingredients to generate a recipe.",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedRecipe(null)

    try {
      // Call Supabase Edge Function to generate recipe
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { ingredients }
      })

      if (error) throw error

      setGeneratedRecipe(data)
    } catch (error) {
      console.error('Error generating recipe:', error)
      toast({
        variant: "destructive",
        title: "Failed to generate recipe",
        description: "There was an error generating your recipe. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveRecipe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save recipes.",
      })
      return
    }

    if (!generatedRecipe) return

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: generatedRecipe.title,
          ingredients: generatedRecipe.ingredients,
          instructions: generatedRecipe.instructions,
          image_url: generatedRecipe.image_url,
          cooking_time: generatedRecipe.cooking_time,
          difficulty: generatedRecipe.difficulty,
          tags: generatedRecipe.tags || []
        })

      if (error) throw error

      toast({
        title: "Recipe saved!",
        description: "Your recipe has been saved to your collection.",
      })
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast({
        variant: "destructive",
        title: "Failed to save recipe",
        description: "There was an error saving your recipe. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-amber-200 dark:border-amber-900">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-amber-800 dark:text-amber-300">What's in your fridge?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Add the ingredients you have available and we'll generate a delicious recipe for you!
          </p>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add an ingredient (e.g., chicken, tomatoes, rice)"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-amber-200 dark:border-amber-800"
            />
            <Button 
              onClick={addIngredient}
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No ingredients added yet. Add some to get started!
              </p>
            ) : (
              ingredients.map((ingredient, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-800/70 px-3 py-1 text-sm flex items-center gap-1"
                >
                  {ingredient}
                  <button 
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          
          <Button 
            onClick={generateRecipe}
            disabled={ingredients.length < 2 || isGenerating}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-4 w-4" />
                Generate Recipe
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12 animate-pulse">
          <ChefHat className="h-16 w-16 text-amber-500 mb-4" />
          <p className="text-lg font-medium text-amber-700 dark:text-amber-400">
            Our AI chef is cooking up something delicious...
          </p>
        </div>
      )}

      {generatedRecipe && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300">
              Your Generated Recipe
            </h2>
            <Button 
              onClick={saveRecipe}
              disabled={isSaving || !user}
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Recipe
            </Button>
          </div>
          
          <RecipeCard recipe={generatedRecipe} />
        </div>
      )}
    </div>
  )
}