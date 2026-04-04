// ═══════════════════════════════════════════════════════════════
// SCSTix EPOS — MAIN APPLICATION (Router + State + Code Splitting)
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { NotificationCenter } from '@/components/shared/NotificationCenter'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { MainLayout } from '@/components/layout/MainLayout'
import { GuestLayout } from '@/components/layout/GuestLayout'
import { useAppStore } from '@/stores/appStore'
import { isSupabaseConfigured } from '@/lib/supabase'
import { fetchSettings } from '@/services/settings'
import { productsService } from '@/services'
import { useRealtimeOrders, useRealtimeInventory, useRealtimeReturns, useRealtimeCashSessions } from '@/hooks/useRealtime'
import { useCashStore } from '@/stores/cashStore'

import { LoginPage } from '@/pages/auth/LoginPage'
import { VenueSiteConfirmation } from '@/pages/auth/VenueSiteConfirmation'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { GuestHomePage } from '@/pages/guest/GuestHomePage'
import { GuestShopPage } from '@/pages/guest/GuestShopPage'
import { GuestProductDetail } from '@/pages/guest/GuestProductDetail'
import { ProfilePage } from '@/pages/shared/ProfilePage'

const AdminDashboard = lazyRetry(() => import('@/pages/admin/AdminDashboard'), 'AdminDashboard')
const AdminSalesPage = lazyRetry(() => import('@/pages/admin/AdminSalesPage'), 'AdminSalesPage')
const AdminInventoryPage = lazyRetry(() => import('@/pages/admin/AdminInventoryPage'), 'AdminInventoryPage')
const AdminReportsPage = lazyRetry(() => import('@/pages/admin/AdminReportsPage'), 'AdminReportsPage')
const AdminCustomers = lazyRetry(() => import('@/pages/admin/AdminCustomers'), 'AdminCustomers')
const UserManagement = lazyRetry(() => import('@/pages/admin/UserManagement'), 'UserManagement')
const AuditLogs = lazyRetry(() => import('@/pages/admin/AuditLogs'), 'AuditLogs')
const BannerManagement = lazyRetry(() => import('@/pages/admin/BannerManagement'), 'BannerManagement')
const CouponManagement = lazyRetry(() => import('@/pages/admin/CouponManagement'), 'CouponManagement')
const ZReport = lazyRetry(() => import('@/pages/admin/ZReport'), 'ZReport')
const SettingsPage = lazyRetry(() => import('@/pages/admin/SettingsPage'), 'SettingsPage')
const VenueSiteManagement = lazyRetry(() => import('@/pages/admin/VenueSiteManagement'), 'VenueSiteManagement')

const ManagerDashboard = lazyRetry(() => import('@/pages/manager/ManagerDashboard'), 'ManagerDashboard')
const ProductManagement = lazyRetry(() => import('@/pages/manager/ProductManagement'), 'ProductManagement')
const InventoryManagement = lazyRetry(() => import('@/pages/manager/InventoryManagement'), 'InventoryManagement')
const TeamManagement = lazyRetry(() => import('@/pages/manager/TeamManagement'))
const CounterManagement = lazyRetry(() => import('@/pages/manager/CounterManagement'), 'CounterManagement')
const ReturnManagement = lazyRetry(() => import('@/pages/manager/ReturnManagement'), 'ReturnManagement')
const ReportsPage = lazyRetry(() => import('@/pages/manager/ReportsPage'), 'ReportsPage')
const CategoryManagement = lazyRetry(() => import('@/pages/manager/CategoryManagement'))
const DamageManagement = lazyRetry(() => import('@/pages/manager/DamageManagement'))
const StockTransferManagement = lazyRetry(() => import('@/pages/manager/StockTransferManagement'))
const StocktakeManagement = lazyRetry(() => import('@/pages/manager/StocktakeManagement'))
const OrderHistory = lazyRetry(() => import('@/pages/manager/OrderHistory'), 'OrderHistory')
const PurchaseOrders = lazyRetry(() => import('@/pages/manager/PurchaseOrders'))
const CreatePurchaseOrder = lazyRetry(() => import('@/pages/manager/CreatePurchaseOrder'))

const POSTerminal = lazyRetry(() => import('@/pages/pos/POSTerminal'), 'POSTerminal')
const CashierDashboard = lazyRetry(() => import('@/pages/cashier/CashierDashboard'), 'CashierDashboard')
const CashierOrders = lazyRetry(() => import('@/pages/cashier/CashierOrders'), 'CashierOrders')
const CashierReturns = lazyRetry(() => import('@/pages/cashier/CashierReturns'), 'CashierReturns')
const HardwarePanel = lazyRetry(() => import('@/pages/cashier/HardwarePanel'), 'HardwarePanel')
const CashManagement = lazyRetry(() => import('@/pages/cashier/CashManagement'), 'CashManagement')

const CustomerShop = lazyRetry(() => import('@/pages/customer/CustomerShop'), 'CustomerShop')
const CustomerOrderHistory = lazyRetry(() => import('@/pages/customer/CustomerOrderHistory'), 'CustomerOrderHistory')
const CustomerTracking = lazyRetry(() => import('@/pages/customer/CustomerTracking'), 'CustomerTracking')
const CustomerReturns = lazyRetry(() => import('@/pages/customer/CustomerReturns'), 'CustomerReturns')

const StaffDashboard = lazyRetry(() => import('@/pages/staff/StaffDashboard'), 'StaffDashboard')
const PickupOrders = lazyRetry(() => import('@/pages/staff/PickupOrders'), 'PickupOrders')

import {
  INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS, INITIAL_RETURNS,
  INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_COUNTERS, INITIAL_SETTINGS, INITIAL_AUDIT_LOGS,
  INITIAL_VENUES
} from '@/core'
import { supabase } from '@/lib/supabase'
import { ts } from '@/lib/utils'

import '@/styles/global.css'

const DEFAULT_VENUE_ID = 'a0000000-0000-0000-0000-000000000001'
const DEFAULT_SITE_ID = 'b0000000-0000-0000-0000-000000000001'

function useSettingsSync(setSettings) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let cancelled = false
    fetchSettings(DEFAULT_VENUE_ID, DEFAULT_SITE_ID)
      .then((data) => {
        if (!cancelled && data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...INITIAL_SETTINGS, ...prev, ...data }))
        }
      })
      .catch((err) => {
        console.warn('Settings sync skipped:', err?.message || err)
      })
    return () => { cancelled = true }
  }, [setSettings])
}

function lazyRetry(importFn, namedExport) {
  return lazy(() =>
    new Promise((resolve, reject) => {
      const attempt = (retriesLeft) => {
        importFn()
          .then(mod => resolve(namedExport ? { default: mod[namedExport] } : mod))
          .catch(err => {
            if (retriesLeft <= 0) {
              reject(err)
              return
            }
            setTimeout(() => attempt(retriesLeft - 1), 1500)
          })
      }
      attempt(3)
    })
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(0,0,0,.1)', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Loading...</div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Access Denied</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>You don't have permission to access this page.</div>
      </div>
    )
  }
  return children
}

function RoleRedirect() {
  const { currentUser } = useAuth()
  const { session } = useCashStore()
  if (!currentUser) return <Navigate to="/login" replace />
  const map = {
    admin: '/app/dashboard',
    manager: '/app/dashboard',
    cashier: session ? '/app/home' : '/app/cash',
    staff: '/app/staff-dashboard',
    customer: '/app/shop',
  }
  return <Navigate to={map[currentUser.role] || '/app/dashboard'} replace />
}

function useSupabaseSync(setter, table, seedData, fetchFn) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return
    let cancelled = false

    const promise = fetchFn ? fetchFn() : supabase.from(table).select('*')

    Promise.resolve(promise).then((res) => {
      const data = res?.data || res
      const error = res?.error
      if (!cancelled && !error && data?.length > 0) {
        setter(data)
      }
    })
    return () => { cancelled = true }
  }, [])
}

function RealtimeWatcher() {
  useRealtimeOrders()
  useRealtimeInventory()
  useRealtimeReturns()
  useRealtimeCashSessions()
  return null
}

function AppContent() {
  const { t, darkMode, setDarkMode } = useTheme()
  const { currentUser, isDemoMode } = useAuth()

  const [products, setProducts] = useState(() => isSupabaseConfigured() ? [] : INITIAL_PRODUCTS)
  const [orders, setOrders] = useState(() => isSupabaseConfigured() ? [] : INITIAL_ORDERS)
  const [returns, setReturns] = useState(() => isSupabaseConfigured() ? [] : INITIAL_RETURNS)
  const [users, setUsers] = useState(INITIAL_USERS)
  const [counters, setCounters] = useState(() => isSupabaseConfigured() ? [] : INITIAL_COUNTERS)
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const [banners, setBanners] = useState(() => isSupabaseConfigured() ? [] : INITIAL_BANNERS)
  const [coupons, setCoupons] = useState(() => isSupabaseConfigured() ? [] : INITIAL_COUPONS)
  const [venues, setVenues] = useState(INITIAL_VENUES)
  const [auditLogs, setAuditLogs] = useState(() => isSupabaseConfigured() ? [] : INITIAL_AUDIT_LOGS)

  useSupabaseSync(setProducts, 'products', INITIAL_PRODUCTS, productsService.fetchProducts)
  useSupabaseSync(setOrders, 'orders', INITIAL_ORDERS, () => import('@/services').then(m => m.ordersService.fetchOrders()))
  useSupabaseSync(setReturns, 'returns', INITIAL_RETURNS, () => import('@/services').then(m => m.returnsService.fetchReturns()))
  useSupabaseSync(setCounters, 'counters', INITIAL_COUNTERS)
  useSupabaseSync(setBanners, 'banners', INITIAL_BANNERS)
  useSupabaseSync(setCoupons, 'coupons', INITIAL_COUPONS)
  useSupabaseSync(setVenues, 'venues', INITIAL_VENUES, () => import('@/services').then(m => m.venuesService.fetchVenuesWithSites()))
  useSupabaseSync(setUsers, 'profiles', INITIAL_USERS, () => import('@/services').then(m => m.usersService.fetchProfiles().then(res => {
    // Fallback to initial users if database is empty or maps incorrectly during development
    return res && res.length > 0 ? res.map(u => ({
      id: u.id,
      name: u.display_name || u.name,
      email: u.email || '',
      role: u.role || 'customer',
      avatar: (u.display_name || u.name || 'U').charAt(0).toUpperCase(),
      phone: u.phone,
      active: u.active ?? true,
      joinDate: u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : '2024-01-01',
      venue_id: u.venue_id,
      site_id: u.site_id,
      loyaltyPoints: u.loyalty_points || 0,
      totalSpent: u.total_spent || 0,
    })) : INITIAL_USERS
  })))
  useSupabaseSync(setAuditLogs, 'audit_logs', INITIAL_AUDIT_LOGS, () =>
    supabase.from('audit_logs').select('id,user_id,action,module,details,created_at').order('created_at', { ascending: false }).limit(200)
      .then(({ data, error }) => ({
        data: (data || []).map(l => ({
          id: l.id,
          user: l.user_id || 'System',
          role: l.role || 'system',
          action: l.action,
          module: l.module,
          details: l.details,
          timestamp: l.created_at,
        })),
        error
      }))
  )
  useSettingsSync(setSettings)

  const addAudit = useCallback((u, action, module, details = '') => {
    const entry = {
      id: `LOG-${Date.now()}`, user: u?.name || 'System', role: u?.role || 'system',
      action, module, details, timestamp: ts(),
    }
    setAuditLogs(l => [entry, ...l])

    // Trigger notification for till/cash events
    const appNotify = useAppStore.getState().addNotification
    if (action.includes('Till') || action.includes('Cash')) {
      const type = action.includes('Closed') || action.includes('Drop') ? 'warning' : 'success'
      const icon = action.includes('Opened') ? '🟢' : action.includes('Closed') ? '🔴' : action.includes('Drop') ? '📤' : '📥'
      appNotify(action, type, details, 'till', icon)
    }

    if (isSupabaseConfigured()) {
      const uid = u?.id
      const isValidUuid = typeof uid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)
      supabase.from('audit_logs').insert({
        user_id: isValidUuid ? uid : null,
        action, module, details,
      }).then(() => { }).catch(() => { })
    }
  }, [])

  // Low Stock Detection
  useEffect(() => {
    if (!products?.length) return
    const lowItems = products.filter(p => (p.stock ?? 0) < 10)
    if (lowItems.length > 0) {
      const appNotify = useAppStore.getState().addNotification
      // Check if low stock notification already exists to avoid spam
      const existing = useAppStore.getState().notifications.find(n => n.category === 'stock' && !n.read)
      if (!existing) {
        appNotify(
          'Low Stock Alert',
          'error',
          `${lowItems.length} items are running low on stock.`,
          'stock',
          '📦'
        )
      }
    }
  }, [products])

  const addGlobalNotif = useCallback(() => { }, [])

  const commonProps = {
    products, setProducts, orders, setOrders, returns, setReturns,
    users, setUsers, counters, setCounters, settings, setSettings,
    banners, setBanners, coupons, setCoupons, venues, setVenues,
    auditLogs, addAudit, addGlobalNotif,
    currentUser, t, darkMode, setDarkMode,
    siteId: currentUser?.site_id || DEFAULT_SITE_ID,
  }

  return (
    <>
      <OfflineBanner />
      <NotificationCenter t={t} />
      {isSupabaseConfigured() && currentUser && <RealtimeWatcher />}
      {isDemoMode && (
        <div style={{
          position: 'fixed', bottom: 12, right: 12, zIndex: 9999,
          background: '#fbbf24', color: '#78350f', padding: '6px 14px',
          borderRadius: 8, fontSize: 11, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,.15)',
        }}>
          DEMO MODE — In-memory data
        </div>
      )}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Guest Routes */}
          <Route element={<GuestLayout />}>
            <Route index element={<GuestHomePage products={products} banners={banners} settings={settings} />} />
            <Route path="shop" element={<GuestShopPage products={products} banners={banners} settings={settings} />} />
            <Route path="product/:productId" element={<GuestProductDetail products={products} settings={settings} />} />
          </Route>

          {/* Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Venue/Site confirmation (after login) */}
          <Route path="venue-confirm" element={
            <ProtectedRoute>
              <VenueSiteConfirmation />
            </ProtectedRoute>
          } />

          {/* App Routes (Protected) */}
          <Route path="app" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }>
            <Route index element={<RoleRedirect />} />

            {/* Dashboard - role-specific */}
            <Route path="dashboard" element={
              currentUser?.role === 'admin'
                ? <AdminDashboard {...commonProps} />
                : currentUser?.role === 'manager'
                  ? <ManagerDashboard orders={orders} products={products} users={users} counters={counters} settings={settings} currentUser={currentUser} t={t} />
                  : <Navigate to="/app" replace />
            } />

            {/* Cashier Home */}
            <Route path="home" element={
              <ProtectedRoute allowedRoles={['cashier', 'admin', 'manager']}>
                <CashierDashboard />
              </ProtectedRoute>
            } />

            {/* POS */}
            <Route path="pos" element={
              <ProtectedRoute allowedRoles={['cashier', 'admin', 'manager']}>
                <POSTerminal {...commonProps} />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="sales" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSalesPage {...commonProps} />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <AdminInventoryPage {...commonProps} />
              </ProtectedRoute>
            } />
            <Route path="customers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCustomers users={users} orders={orders} settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement {...commonProps} />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                {currentUser?.role === 'admin' 
                  ? <AdminReportsPage {...commonProps} /> 
                  : <ReportsPage orders={orders} users={users} products={products} settings={settings} t={t} />}
              </ProtectedRoute>
            } />
            <Route path="audit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs auditLogs={auditLogs} t={t} />
              </ProtectedRoute>
            } />
            <Route path="banners" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BannerManagement banners={banners} setBanners={setBanners} addAudit={addAudit} currentUser={currentUser} t={t} />
              </ProtectedRoute>
            } />
            <Route path="coupons" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CouponManagement coupons={coupons} setCoupons={setCoupons} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="z-report" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ZReport orders={orders} settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SettingsPage settings={settings} setSettings={setSettings} addAudit={addAudit} currentUser={currentUser} darkMode={darkMode} setDarkMode={setDarkMode} t={t} venues={venues} setVenues={setVenues} />
              </ProtectedRoute>
            } />
            <Route path="venues" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <VenueSiteManagement t={t} />
              </ProtectedRoute>
            } />

            {/* Manager Routes */}
            <Route path="categories" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <CategoryManagement t={t} addAudit={addAudit} currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="products" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <ProductManagement products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <InventoryManagement products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} siteId={currentUser?.site_id || DEFAULT_SITE_ID} />
              </ProtectedRoute>
            } />
            <Route path="team" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <TeamManagement users={users} setUsers={setUsers} counters={counters} orders={orders} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="counters" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <CounterManagement counters={counters} setCounters={setCounters} orders={orders} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="returns" element={
              currentUser?.role === 'manager' || currentUser?.role === 'admin'
                ? <ReturnManagement orders={orders} setOrders={setOrders} returns={returns} setReturns={setReturns} products={products} setProducts={setProducts} settings={settings} addAudit={addAudit} currentUser={currentUser} t={t} siteId={currentUser?.site_id || DEFAULT_SITE_ID} />
                : currentUser?.role === 'cashier'
                  ? <CashierReturns orders={orders} setOrders={setOrders} returns={returns} setReturns={setReturns} products={products} setProducts={setProducts} settings={settings} addAudit={addAudit} currentUser={currentUser} t={t} siteId={currentUser?.site_id || DEFAULT_SITE_ID} />
                  : <CustomerReturns orders={orders} returns={returns} setReturns={setReturns} products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
            } />

            <Route path="damage-lost" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <DamageManagement t={t} currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="stock-transfer" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <StockTransferManagement t={t} currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="stocktake" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <StocktakeManagement t={t} currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="order-history" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <OrderHistory settings={settings} t={t} />
              </ProtectedRoute>
            } />
            <Route path="purchase-orders" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <PurchaseOrders t={t} currentUser={currentUser} />
              </ProtectedRoute>
            } />
            <Route path="purchase-orders/new" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <CreatePurchaseOrder t={t} currentUser={currentUser} products={products} settings={settings} />
              </ProtectedRoute>
            } />

            {/* Cashier Routes */}
            <Route path="orders" element={<CashierOrders orders={orders} setOrders={setOrders} settings={settings} t={t} />} />
            <Route path="hardware" element={<HardwarePanel addAudit={addAudit} settings={settings} t={t} />} />
            <Route path="cash" element={
              <ProtectedRoute allowedRoles={['cashier', 'admin', 'manager']}>
                <CashManagement addAudit={addAudit} settings={settings} t={t} />
              </ProtectedRoute>
            } />

            {/* Customer Routes */}
            <Route path="shop" element={
              <CustomerShop products={products} orders={orders} setOrders={setOrders} users={users} setUsers={setUsers}
                currentUser={currentUser} banners={banners} coupons={coupons} settings={settings} t={t} addGlobalNotif={addGlobalNotif} />
            } />
            <Route path="my-orders" element={<CustomerOrderHistory orders={orders} settings={settings} t={t} />} />
            <Route path="tracking" element={<CustomerTracking orders={orders} settings={settings} t={t} />} />
            <Route path="my-returns" element={
              <CustomerReturns orders={orders} returns={returns} setReturns={setReturns} products={products} setProducts={setProducts} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
            } />

            {/* Staff Routes */}
            <Route path="staff-dashboard" element={
              <StaffDashboard orders={orders} setOrders={setOrders} products={products} users={users} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
            } />
            <Route path="pickup" element={
              <PickupOrders orders={orders} setOrders={setOrders} addAudit={addAudit} currentUser={currentUser} settings={settings} t={t} />
            } />

            {/* Shared */}
            <Route path="profile" element={<ProfilePage settings={settings} />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS)

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider allUsers={users} onUsersChange={setUsers}>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
