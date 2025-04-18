
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import { Header } from './components/header'
import { RecipeGenerator } from './components/recipe-generator'
import { SavedRecipes } from './components/saved-recipes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setLoading(false)
      
      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null)
        }
      )
      
      return () => {
        authListener.subscription.unsubscribe()
      }
    }
    
    checkSession()
  }, [])

  return (
    <ThemeProvider defaultTheme="light" storageKey="recipe-generator-theme">
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
        <Header user={user} supabase={supabase} />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="generate" className="text-lg">Generate Recipe</TabsTrigger>
              <TabsTrigger value="saved" className="text-lg">Saved Recipes</TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="animate-fade-in">
              <RecipeGenerator supabase={supabase} user={user} />
            </TabsContent>
            <TabsContent value="saved" className="animate-fade-in">
              <SavedRecipes supabase={supabase} user={user} />
            </TabsContent>
          </Tabs>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App