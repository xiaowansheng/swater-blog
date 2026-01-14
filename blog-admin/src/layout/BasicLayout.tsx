import { Layout } from 'antd'
import { useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'
import LoginModal from '@/components/common/LoginModal'
import Lockscreen from '@/components/common/Lockscreen'
import { KeepAlive } from '@/components/common/KeepAlive'
import { useAuthStore } from '@/store/auth'
import { useTabsStore } from '@/store/tabs'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAutoLock } from '@/hooks/useAutoLock'

const { Content } = Layout

// 懒加载页面组件
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ArticleList = lazy(() => import('@/pages/Article/List'))
const ArticleEdit = lazy(() => import('@/pages/Article/Edit'))
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
const TestCache = lazy(() => import('@/pages/TestCache'))

// 路由配置 - 按路径具体程度排序，更具体的路径在前面
const routeConfig = [
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  
  // 文章相关路由
  { path: '/article/create', component: ArticleEdit, title: '创建文章', keepAlive: true },
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: true },
  { path: '/article', component: ArticleList, title: '文章管理', keepAlive: true },
  
  // 说说相关路由
  { path: '/talk/create', component: TalkEdit, title: '发布说说', keepAlive: true },
  { path: '/talk/edit/:id', component: TalkEdit, title: '编辑说说', keepAlive: true },
  { path: '/talk/detail/:id', component: TalkDetail, title: '说说详情', keepAlive: true },
  { path: '/talk', component: Talk, title: '说说管理', keepAlive: true },
  
  // 日志相关路由
  { path: '/log/operation', component: LogOperation, title: '操作日志', keepAlive: true },
  { path: '/log/error', component: LogError, title: '异常日志', keepAlive: true },
  
  // 其他路由
  { path: '/category', component: Category, title: '分类管理', keepAlive: true },
  { path: '/tag', component: Tag, title: '标签管理', keepAlive: true },
  { path: '/archive', component: Archive, title: '归档管理', keepAlive: true },
  { path: '/comment', component: Comment, title: '评论管理', keepAlive: true },
  { path: '/user', component: User, title: '用户管理', keepAlive: true },
  { path: '/role', component: Role, title: '角色管理', keepAlive: true },
  { path: '/menu', component: Menu, title: '菜单管理', keepAlive: true },
  { path: '/resource', component: Resource, title: '接口管理', keepAlive: true },
  { path: '/config', component: Config, title: '系统配置', keepAlive: true },
  { path: '/file', component: File, title: '文件管理', keepAlive: true },
  { path: '/visitor', component: Visitor, title: '访客统计', keepAlive: true },
  { path: '/friend-link', component: FriendLink, title: '友链管理', keepAlive: true },
  { path: '/notification', component: Notification, title: '通知管理', keepAlive: true },
  { path: '/album', component: Album, title: '相册管理', keepAlive: true },
  { path: '/guestbook', component: Guestbook, title: '留言管理', keepAlive: true },
  { path: '/about', component: About, title: '关于页面', keepAlive: true },
  { path: '/profile', component: Profile, title: '个人中心', keepAlive: true },
  { path: '/test-cache', component: TestCache, title: '缓存测试', keepAlive: true },
]

// 加载中组件
const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <Spin size="large" />
  </div>
)

const BasicLayout: React.FC = () => {
  const { getCurrentUser, isAuthenticated } = useAuthStore()
  const { tabs } = useTabsStore()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated()) {
      getCurrentUser()
    }
  }, [isAuthenticated, getCurrentUser])

  useWebSocket()
  useAutoLock() // 启用自动锁屏功能，默认 30 分钟不操作自动锁屏

  // 当前页面是否需要缓存
  const currentTab = tabs.find(tab => tab.key === location.pathname)
  const shouldCache = currentTab?.keepAlive ?? true // 默认启用缓存

  // 根据当前路径找到对应的组件
  const getCurrentComponent = () => {
    console.log('🔍 路由匹配调试:', {
      currentPath: location.pathname,
      allRoutes: routeConfig.map(r => r.path)
    })

    // 首先尝试精确匹配
    const exactMatch = routeConfig.find(r => r.path === location.pathname)
    if (exactMatch) {
      console.log('✅ 精确匹配:', exactMatch.path, exactMatch.title)
      const Component = exactMatch.component
      return <Component />
    }

    // 然后尝试参数匹配，按路径长度排序，优先匹配更具体的路径
    const paramRoutes = routeConfig
      .filter(r => r.path.includes(':'))
      .sort((a, b) => b.path.length - a.path.length) // 按路径长度降序排序

    for (const route of paramRoutes) {
      // 将路径模式转换为正则表达式
      const pattern = route.path.replace(/:[^/]+/g, '([^/]+)')
      const regex = new RegExp(`^${pattern}$`)
      
      console.log('🔍 测试路由匹配:', {
        routePath: route.path,
        pattern: `^${pattern}$`,
        currentPath: location.pathname,
        matches: regex.test(location.pathname)
      })

      if (regex.test(location.pathname)) {
        console.log('✅ 参数匹配:', route.path, route.title)
        const Component = route.component
        return <Component />
      }
    }

    console.log('❌ 未找到匹配路由，使用 404 页面')
    return <NotFound />
  }

  console.log('🔍 BasicLayout Debug:', {
    pathname: location.pathname,
    currentTab: currentTab ? { key: currentTab.key, keepAlive: currentTab.keepAlive } : null,
    shouldCache,
    allTabs: tabs.map(t => ({ key: t.key, keepAlive: t.keepAlive }))
  })

  return (
    <Layout className="h-screen">
      <Sidebar />
      <Layout className="flex flex-col">
        <Header />
        <Tabs />
        <Content className="overflow-auto flex-1 bg-gray-50">
          <KeepAlive cacheKey={location.pathname} shouldCache={shouldCache}>
            <Suspense fallback={<PageLoading />}>
              {getCurrentComponent()}
            </Suspense>
          </KeepAlive>
        </Content>
      </Layout>
      <LoginModal />
      <Lockscreen />
    </Layout>
  )
}

export default BasicLayout
