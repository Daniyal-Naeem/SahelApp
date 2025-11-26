import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './utils/auth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import VendorsPage from './pages/VendorsPage'
import ProductsPage from './pages/ProductsPage'
import CreateUserPage from './pages/CreateUserPage'
import CreateVendorPage from './pages/CreateVendorPage'
import CreateProductPage from './pages/CreateProductPage'
import CreateCategoryPage from './pages/CreateCategoryPage'
import CreditBalancesPage from './pages/CreditBalancesPage'
import CreditTransactionsPage from './pages/CreditTransactionsPage'
import CreditAdjustPage from './pages/CreditAdjustPage'
import BannersPage from './pages/BannersPage'
import CreateBannerPage from './pages/CreateBannerPage'
import DealsPage from './pages/DealsPage'
import GiftCardsPage from './pages/GiftCardsPage'
import CouponsPage from './pages/CouponsPage'
import ReviewsPage from './pages/ReviewsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <Layout>
                <VendorsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateVendorPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateProductPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateUserPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateCategoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/credits/balances"
          element={
            <ProtectedRoute>
              <Layout>
                <CreditBalancesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/credits/transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <CreditTransactionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/credits/adjust"
          element={
            <ProtectedRoute>
              <Layout>
                <CreditAdjustPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/banners"
          element={
            <ProtectedRoute>
              <Layout>
                <BannersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/banners/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateBannerPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/deals"
          element={
            <ProtectedRoute>
              <Layout>
                <DealsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/gift-cards"
          element={
            <ProtectedRoute>
              <Layout>
                <GiftCardsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <Layout>
                <CouponsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Layout>
                <ReviewsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App

