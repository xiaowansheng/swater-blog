import { lazy } from 'react'

const Welcome = lazy(() => import('@/pages/Welcome'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const ArticleList = lazy(() => import('@/pages/Article/List'))
const ArticleEdit = lazy(() => import('@/pages/Article/Edit'))
const ArticleImport = lazy(() => import('@/pages/Article/Import'))
const ArticleExport = lazy(() => import('@/pages/Article/Export'))
const ArticleDirectoryTree = lazy(() => import('@/pages/Article/DirectoryTree'))
const ArticlePreview = lazy(() => import('@/pages/Article/Preview'))
const ArticleMindMap = lazy(() => import('@/pages/Article/MindMap'))
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

export interface RouteConfigItem {
  path: string
  component: React.LazyExoticComponent<React.ComponentType<object>>
  title: string
  keepAlive: boolean
}

export const routeConfig: RouteConfigItem[] = [
  { path: '/welcome', component: Welcome, title: '欢迎页', keepAlive: true },
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true },
  { path: '/article', component: ArticleList, title: '文章管理', keepAlive: true },
  { path: '/article/tree', component: ArticleDirectoryTree, title: '文章归类树', keepAlive: true },
  { path: '/article/import', component: ArticleImport, title: '导入文档', keepAlive: false },
  { path: '/article/export', component: ArticleExport, title: '导出文档', keepAlive: false },
  { path: '/article/preview/:id', component: ArticlePreview, title: '预览文章', keepAlive: true },
  { path: '/article/tree/mindmap', component: ArticleMindMap, title: '归类可视化', keepAlive: true },
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

export function matchRoute(pathname: string): RouteConfigItem | undefined {
  return routeConfig.find((r) => {
    if (r.path.includes(':')) {
      const pattern = r.path.replace(/:[^/]+/g, '[^/]+')
      return new RegExp(`^${pattern}$`).test(pathname)
    }
    return r.path === pathname
  })
}
