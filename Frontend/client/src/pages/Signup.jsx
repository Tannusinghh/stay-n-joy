import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/register', { username, email, password })
      login(data.user, data.token)
      navigate('/listings', { replace: true })
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-lg">
        <CardHeader className="space-y-2 text-center pb-4">
          <CardTitle className="text-3xl font-bold">Sign up</CardTitle>
          <CardDescription className="text-base">
            Create an account to list your place or leave reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="text-base">
                <AlertCircle className="size-5" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-3">
              <Label htmlFor="username" className="text-base font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoComplete="username"
                className="h-12 rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="h-12 rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="h-12 rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-xl text-lg font-medium shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign up'}
            </Button>
          </form>
          <p className="text-center text-base text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
