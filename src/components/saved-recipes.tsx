
import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Loader2, BookOpen, Search, Trash2 } from 'lucide-react'
import { Input } from './ui/input'
import { RecipeCard } from './recipe-card'
import { toast } from './ui/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

export function SavedRecipes({ supabase, user }) {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchRecipes()
    } else {
      setRecipes([])
      setLoading(false)
    }
  }, [user])

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
      toast({
        variant: "destructive",
        title: "Failed to load recipes",
        description: "There was an error loading your saved recipes.",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteRecipe = async () => {
    if (!selectedRecipe) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', selectedRecipe.id)

      if (error) throw error
      
      setRecipes(recipes.filter(recipe => recipe.id !== selectedRecipe.id))
      setIsDeleteDialogOpen(false)
      setSelectedRecipe(null)
      
      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed from your collection.",
      })
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast({
        variant: "destructive",
        title: "Failed to delete recipe",
        description: "There was an error deleting the recipe. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!user) {
    return (
      <Card className="border-amber-200 dark:border-amber-900">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <BookOpen className="h-16 w-16 text-amber-400 mb-4" />
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
            Sign in to save recipes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Create an account or sign in to save your favorite recipes and access them anytime.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search your recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-amber-200 dark:border-amber-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : recipes.length === 0 ? (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <BookOpen className="h-16 w-16 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
              No saved recipes yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Generate and save recipes to build your collection. They'll appear here for easy access.
            </p>
          </CardContent>
        </Card>
      ) : filteredRecipes.length === 0 ? (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="h-16 w-16 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-2">
              No matching recipes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              No recipes match your search. Try different keywords or clear the search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="relative group">
              <RecipeCard recipe={recipe} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setSelectedRecipe(recipe)
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRecipe?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteRecipe}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}