
import { useState } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { ModeToggle } from './mode-toggle'
import { ChefHat, LogIn, LogOut, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { toast } from './ui/use-toast'

export function Header({ user, supabase }) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLoggingIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) throw error
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        })
      }
      
      setIsAuthDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    })
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-amber-500" />
          <h1 className="text-xl font-bold text-amber-700 dark:text-amber-400">AI Recipe Generator</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-amber-100 text-amber-800">
                      {user.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isLoggingIn ? 'Sign In' : 'Create Account'}</DialogTitle>
                  <DialogDescription>
                    {isLoggingIn 
                      ? 'Enter your credentials to access your account.' 
                      : 'Create a new account to save your favorite recipes.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAuth} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setIsLoggingIn(!isLoggingIn)}
                    >
                      {isLoggingIn ? 'Create account' : 'Sign in instead'}
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {loading ? 'Processing...' : isLoggingIn ? 'Sign In' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  )
}