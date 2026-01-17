import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import BasicLayout from '@/layout/BasicLayout'

// 懒加载页面组件
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ArticleList = lazy(() => import('@/pages/Article/List'))
const ArticleEdit = lazy(() => import('@/pages/Article/Edit'))
const ArticleImport = lazy(() => import('@/pages/Article/Import'))
const ArticlePreview = lazy(() => import('@/pages/Article/Preview'))
const Category = lazy(() => import('@/pages/Category'))
const Tag = lazy(() => import('@/pages/Tag'))
const Comment = lazy(() => import('@/pages/Comment'))
const Talk = lazy(() => import('@/pages/Talk'))
const TalkEdit = lazy(() => import('@/pages/Talk/Edit'))
const TalkDetail = lazy(() => import('@/pages/Talk/Detail'))
const Archive = lazy(() => import('@/pages/Archive'))
const User = lazy(() => import('@/pages/User'))
const Role = lazy(() => import('@/pages/Role'))
const Menu = lazy(() => import('@/pages/Menu'))
const Resource = lazy(() => import('@/pages/Resource'))
const Config = lazy(() => import('@/pages/Config'))
const File = lazy(() => import('@/pages/File'))
const Visitor = lazy(() => import('@/pages/Visitor'))
const LogOperation = lazy(() => import('@/pages/Log/Operation'))
const LogError = lazy(() => import('@/pages/Log/Error'))
const FriendLink = lazy(() => import('@/pages/FriendLink'))
const Notification = lazy(() => import('@/pages/Notification'))
const Album = lazy(() => import('@/pages/Album'))
const Guestbook = lazy(() => import('@/pages/Guestbook'))
const About = lazy(() => import('@/pages/About'))
const Profile = lazy(() => import('@/pages/Profile'))
const NotFound = lazy(() => import('@/pages/404'))

// 路由配置
const routeConfig = [
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  { path: '/article', component: ArticleList, title: '文章管理', keepAlive: true },
  { path: '/article/import', component: ArticleImport, title: '导入文档', keepAlive: false },
  { path: '/article/preview/:id', component: ArticlePreview, title: '预览文章', keepAlive: true },
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: true },
  { path: '/article/create', component: ArticleEdit, title: '创建文章', keepAlive: true },
  { path: '/category', component: Category, title: '分类管理', keepAlive: true },
  { path: '/tag', component: Tag, title: '标签管理', keepAlive: true },
  { path: '/archive', component: Archive, title: '归档管理', keepAlive: true },
  { path: '/comment', component: Comment, title: '评论管理', keepAlive: true },
  { path: '/talk', component: Talk, title: '说说管理', keepAlive: true },
  { path: '/talk/edit/:id', component: TalkEdit, title: '编辑说说', keepAlive: true },
  { path: '/talk/create', component: TalkEdit, title: '发布说说', keepAlive: true },
  { path: '/talk/detail/:id', component: TalkDetail, title: '说说详情', keepAlive: true },
  { path: '/user', component: User, title: '用户管理', keepAlive: true },
  { path: '/role', component: Role, title: '角色管理', keepAlive: true },
  { path: '/menu', component: Menu, title: '菜单管理', keepAlive: true },
  { path: '/resource', component: Resource, title: '接口管理', keepAlive: true },
  { path: '/config', component: Config, title: '系统配置', keepAlive: true },
  { path: '/file', component: File, title: '文件管理', keepAlive: true },
  { path: '/visitor', component: Visitor, title: '访客统计', keepAlive: true },
  { path: '/log/operation', component: LogOperation, title: '操作日志', keepAlive: true },
  { path: '/log/error', component: LogError, title: '异常日志', keepAlive: true },
  { path: '/friend-link', component: FriendLink, title: '友链管理', keepAlive: true },
  { path: '/notification', component: Notification, title: '通知管理', keepAlive: true },
  { path: '/album', component: Album, title: '相册管理', keepAlive: true },
  { path: '/guestbook', component: Guestbook, title: '留言管理', keepAlive: true },
  { path: '/about', component: About, title: '关于页面', keepAlive: true },
  { path: '/profile', component: Profile, title: '个人中心', keepAlive: true },
]

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

// 路由组件
const Router: React.FC = () => {
  return (
    <RouteGuard>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<PageLoading />}><Login /></Suspense>} />
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<PageLoading />}><Dashboard /></Suspense>} />
          <Route path="article" element={<Suspense fallback={<PageLoading />}><ArticleList /></Suspense>} />
          <Route path="article/import" element={<Suspense fallback={<PageLoading />}><ArticleImport /></Suspense>} />
          <Route path="article/preview/:id" element={<Suspense fallback={<PageLoading />}><ArticlePreview /></Suspense>} />
          <Route path="article/edit/:id" element={<Suspense fallback={<PageLoading />}><ArticleEdit /></Suspense>} />
          <Route path="article/create" element={<Suspense fallback={<PageLoading />}><ArticleEdit /></Suspense>} />
          <Route path="category" element={<Suspense fallback={<PageLoading />}><Category /></Suspense>} />
          <Route path="tag" element={<Suspense fallback={<PageLoading />}><Tag /></Suspense>} />
          <Route path="archive" element={<Suspense fallback={<PageLoading />}><Archive /></Suspense>} />
          <Route path="comment" element={<Suspense fallback={<PageLoading />}><Comment /></Suspense>} />
          <Route path="talk" element={<Suspense fallback={<PageLoading />}><Talk /></Suspense>} />
          <Route path="talk/edit/:id" element={<Suspense fallback={<PageLoading />}><TalkEdit /></Suspense>} />
          <Route path="talk/create" element={<Suspense fallback={<PageLoading />}><TalkEdit /></Suspense>} />
          <Route path="talk/detail/:id" element={<Suspense fallback={<PageLoading />}><TalkDetail /></Suspense>} />
          <Route path="user" element={<Suspense fallback={<PageLoading />}><User /></Suspense>} />
          <Route path="role" element={<Suspense fallback={<PageLoading />}><Role /></Suspense>} />
          <Route path="menu" element={<Suspense fallback={<PageLoading />}><Menu /></Suspense>} />
          <Route path="resource" element={<Suspense fallback={<PageLoading />}><Resource /></Suspense>} />
          <Route path="config" element={<Suspense fallback={<PageLoading />}><Config /></Suspense>} />
          <Route path="file" element={<Suspense fallback={<PageLoading />}><File /></Suspense>} />
          <Route path="visitor" element={<Suspense fallback={<PageLoading />}><Visitor /></Suspense>} />
          <Route path="log/operation" element={<Suspense fallback={<PageLoading />}><LogOperation /></Suspense>} />
          <Route path="log/error" element={<Suspense fallback={<PageLoading />}><LogError /></Suspense>} />
          <Route path="friend-link" element={<Suspense fallback={<PageLoading />}><FriendLink /></Suspense>} />
          <Route path="notification" element={<Suspense fallback={<PageLoading />}><Notification /></Suspense>} />
          <Route path="album" element={<Suspense fallback={<PageLoading />}><Album /></Suspense>} />
          <Route path="guestbook" element={<Suspense fallback={<PageLoading />}><Guestbook /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<PageLoading />}><About /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<PageLoading />}><Profile /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<PageLoading />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </RouteGuard>
  )
}

export default Router
