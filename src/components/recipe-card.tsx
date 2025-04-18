
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Clock, ChefHat, Tag } from 'lucide-react'

export function RecipeCard({ recipe }) {
  return (
    <Card className="overflow-hidden border-amber-200 dark:border-amber-900 transition-all duration-300 hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2126&auto=format&fit=crop'} 
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">{recipe.title}</h3>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{recipe.cooking_time || '30 mins'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mt-1">
          <ChefHat className="h-4 w-4" />
          <span className="text-sm">{recipe.difficulty || 'Medium'}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-400">Ingredients</h4>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-400">Instructions</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="pb-2">{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 pt-2 border-t border-amber-100 dark:border-amber-900">
        {recipe.tags && recipe.tags.length > 0 ? (
          <>
            <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-1" />
            {recipe.tags.map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              >
                {tag}
              </Badge>
            ))}
          </>
        ) : null}
      </CardFooter>
    </Card>
  )
}