import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

// Public pages
import Landing from './pages/Landing'
import Flights from './pages/Flights'
import Hotels from './pages/Hotels'
import FlightDetail from './pages/FlightDetail'
import HotelDetail from './pages/HotelDetail'
import MapView from './pages/MapView'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Protected pages
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Booking from './pages/booking/Booking'
import Checkout from './pages/booking/Checkout'
import Confirmation from './pages/booking/Confirmation'

// Admin pages
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBookings from './pages/admin/AdminBookings'
import AdminPromoCodes from './pages/admin/AdminPromoCodes'
import AdminReviews from './pages/admin/AdminReviews'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/flights" element={<Flights />} />
              <Route path="/flights/:id" element={<FlightDetail />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:id" element={<HotelDetail />} />
              <Route path="/map" element={<MapView />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/booking/confirmation" element={<Confirmation />} />
              </Route>
            </Route>
            
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/promo-codes" element={<AdminPromoCodes />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
