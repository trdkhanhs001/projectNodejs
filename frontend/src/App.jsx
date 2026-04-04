import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import RoleBasedRoute from './components/RoleBasedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import AdminLogin from './pages/AdminLogin'
import StaffLogin from './pages/StaffLogin'

// User Pages
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import UserProfile from './pages/UserProfile'

// Staff Pages
import StaffDashboard from './pages/Staff/StaffDashboard'
import StaffPOS from './pages/Staff/StaffPOS'

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminStaff from './pages/Admin/AdminStaff'
import AdminCategory from './pages/Admin/AdminCategory'
import AdminMenu from './pages/Admin/AdminMenu'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminProfile from './pages/Admin/AdminProfile'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ============ Public Routes ============ */}
            <Route path="/" element={<Home />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/staff/login" element={<StaffLogin />} />

            {/* ============ User Routes ============ */}
            <Route path="/cart" element={<RoleBasedRoute requiredRole="USER"><Cart /></RoleBasedRoute>} />
            <Route path="/checkout" element={<RoleBasedRoute requiredRole="USER"><Checkout /></RoleBasedRoute>} />
            <Route path="/orders" element={<RoleBasedRoute requiredRole="USER"><Orders /></RoleBasedRoute>} />
            <Route path="/profile" element={<RoleBasedRoute requiredRole="USER"><UserProfile /></RoleBasedRoute>} />

            {/* ============ Staff Routes ============ */}
            <Route path="/staff" element={<RoleBasedRoute requiredRole="STAFF"><StaffDashboard /></RoleBasedRoute>} />
            <Route path="/staff/pos" element={<RoleBasedRoute requiredRole="STAFF"><StaffPOS /></RoleBasedRoute>} />

            {/* ============ Admin Routes ============ */}
            <Route path="/admin" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminDashboard /></RoleBasedRoute></ErrorBoundary>} />
            <Route path="/admin/users" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminUsers /></RoleBasedRoute></ErrorBoundary>} />
            <Route path="/admin/staff" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminStaff /></RoleBasedRoute></ErrorBoundary>} />
            <Route path="/admin/category" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminCategory /></RoleBasedRoute></ErrorBoundary>} />
            <Route path="/admin/menu" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminMenu /></RoleBasedRoute></ErrorBoundary>} />
            <Route path="/admin/orders" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminOrders /></RoleBasedRoute></ErrorBoundary>} />
            <Route path="/admin/profile" element={<ErrorBoundary><RoleBasedRoute requiredRole="ADMIN"><AdminProfile /></RoleBasedRoute></ErrorBoundary>} />

            {/* ============ Not Found ============ */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
