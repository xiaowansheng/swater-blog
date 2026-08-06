import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import BasicLayout from '@/layout/BasicLayout'
import { routeConfig, matchRoute } from '@/config/routes'

const Login = lazy(() => import('@/pages/Login'))
const NotFound = lazy(() => import('@/pages/404'))

// 加载中组件
const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <Spin size="large" />
  </div>
)

// 路由守卫
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const { addTab } = useTabsStore()

  useEffect(() => {
    if (location.pathname === '/login') {
      return
    }

    if (!isAuthenticated()) {
      return
    }

    const route = matchRoute(location.pathname)

    if (route) {
      const key = location.pathname
      addTab({
        key,
        label: route.title,
        path: location.pathname,
        closable: true,
        keepAlive: route.keepAlive,
      })
    }
  }, [location.pathname, isAuthenticated, addTab])

  if (!isAuthenticated() && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (isAuthenticated() && location.pathname === '/login') {
    return <Navigate to="/welcome" replace />
  }

  return <>{children}</>
}

// 路由组件
const Router: React.FC = () => {
  return (
    <RouteGuard>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<PageLoading />}><Login /></Suspense>} />
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<Navigate to="/welcome" replace />} />
          {routeConfig.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path.replace(/^\//, '')}
              element={
                <Suspense fallback={<PageLoading />}>
                  <Component />
                </Suspense>
              }
            />
          ))}
          <Route path="*" element={<Suspense fallback={<PageLoading />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </RouteGuard>
  )
}

export default Router
