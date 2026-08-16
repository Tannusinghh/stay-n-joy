import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ListingsList from './pages/ListingsList'
import ListingDetail from './pages/ListingDetail'
import ListingForm from './pages/ListingForm'
import PlanTrip from './pages/PlanTrip'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route path="/listings" element={<ListingsList />} />
        <Route path="/listings/new" element={<ProtectedRoute><ListingForm /></ProtectedRoute>} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/listings/:id/edit" element={<ProtectedRoute><ListingForm edit /></ProtectedRoute>} />
        <Route path="/plan-trip" element={<ProtectedRoute><PlanTrip /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Layout>
    </QueryClientProvider>
  )
}

export default App
