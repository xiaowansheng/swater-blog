import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import BasicLayout from '@/layout/BasicLayout'

const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ArticleList = lazy(() => import('@/pages/Article/List'))
const ArticleEdit = lazy(() => import('@/pages/Article/Edit'))
const Category = lazy(() => import('@/pages/Category'))
const Tag = lazy(() => import('@/pages/Tag'))
const Comment = lazy(() => import('@/pages/Comment'))
const Talk = lazy(() => import('@/pages/Talk'))
const User = lazy(() => import('@/pages/User'))
const Role = lazy(() => import('@/pages/Role'))
const Menu = lazy(() => import('@/pages/Menu'))
const Config = lazy(() => import('@/pages/Config'))
const File = lazy(() => import('@/pages/File'))
const Visitor = lazy(() => import('@/pages/Visitor'))
const LogOperation = lazy(() => import('@/pages/Log/Operation'))
const LogError = lazy(() => import('@/pages/Log/Error'))
const FriendLink = lazy(() => import('@/pages/FriendLink'))
const Notification = lazy(() => import('@/pages/Notification'))
const NotFound = lazy(() => import('@/pages/404'))

const routeConfig = [
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  { path: '/article', component: ArticleList, title: '文章管理', keepAlive: true },
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: false },
  { path: '/article/create', component: ArticleEdit, title: '创建文章', keepAlive: false },
  { path: '/category', component: Category, title: '分类管理', keepAlive: true },
  { path: '/tag', component: Tag, title: '标签管理', keepAlive: true },
  { path: '/comment', component: Comment, title: '评论管理', keepAlive: true },
  { path: '/talk', component: Talk, title: '说说管理', keepAlive: true },
  { path: '/user', component: User, title: '用户管理', keepAlive: true },
  { path: '/role', component: Role, title: '角色管理', keepAlive: true },
  { path: '/menu', component: Menu, title: '菜单管理', keepAlive: true },
  { path: '/config', component: Config, title: '系统配置', keepAlive: true },
  { path: '/file', component: File, title: '文件管理', keepAlive: true },
  { path: '/visitor', component: Visitor, title: '访客管理', keepAlive: true },
  { path: '/log/operation', component: LogOperation, title: '操作日志', keepAlive: true },
  { path: '/log/error', component: LogError, title: '异常日志', keepAlive: true },
  { path: '/friend-link', component: FriendLink, title: '友链管理', keepAlive: true },
  { path: '/notification', component: Notification, title: '通知管理', keepAlive: true },
]

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

    const route = routeConfig.find((r) => {
      if (r.path.includes(':')) {
        const pattern = r.path.replace(/:[^/]+/g, '[^/]+')
        return new RegExp(`^${pattern}$`).test(location.pathname)
      }
      return r.path === location.pathname
    })

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
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const Router: React.FC = () => {
  return (
    <RouteGuard>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="article"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ArticleList />
              </Suspense>
            }
          />
          <Route
            path="article/edit/:id"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ArticleEdit />
              </Suspense>
            }
          />
          <Route
            path="article/create"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <ArticleEdit />
              </Suspense>
            }
          />
          <Route
            path="category"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Category />
              </Suspense>
            }
          />
          <Route
            path="tag"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Tag />
              </Suspense>
            }
          />
          <Route
            path="comment"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Comment />
              </Suspense>
            }
          />
          <Route
            path="talk"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Talk />
              </Suspense>
            }
          />
          <Route
            path="user"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <User />
              </Suspense>
            }
          />
          <Route
            path="role"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Role />
              </Suspense>
            }
          />
          <Route
            path="menu"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Menu />
              </Suspense>
            }
          />
          <Route
            path="config"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Config />
              </Suspense>
            }
          />
          <Route
            path="file"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <File />
              </Suspense>
            }
          />
          <Route
            path="visitor"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Visitor />
              </Suspense>
            }
          />
          <Route
            path="log/operation"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <LogOperation />
              </Suspense>
            }
          />
          <Route
            path="log/error"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <LogError />
              </Suspense>
            }
          />
          <Route
            path="friend-link"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <FriendLink />
              </Suspense>
            }
          />
          <Route
            path="notification"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <Notification />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <NotFound />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </RouteGuard>
  )
}

export default Router

