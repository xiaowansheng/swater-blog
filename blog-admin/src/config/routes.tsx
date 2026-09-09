import { lazy } from 'react'
import {
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  CommentOutlined,
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SettingOutlined,
  FileOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LinkOutlined,
  BellOutlined,
  PictureOutlined,
  BookOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  SmileOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import type { User } from '@/types'

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

/** 系统管理类页面仅管理员（roleKey=admin）可见 */
const ADMIN_ONLY = ['admin']

export type MenuGroupKey = 'home' | 'content' | 'interaction' | 'media' | 'system' | 'monitor'

export interface MenuGroup {
  key: MenuGroupKey
  label: string
  icon: React.ReactNode
}

/**
 * 侧边栏分组定义，数组顺序即菜单顺序。
 * 菜单项本身由 routeConfig 派生（icon + group），不再单独维护一份菜单数组。
 */
export const menuGroups: MenuGroup[] = [
  { key: 'home', label: '首页', icon: <HomeOutlined /> },
  { key: 'content', label: '内容管理', icon: <FileTextOutlined /> },
  { key: 'interaction', label: '互动管理', icon: <CommentOutlined /> },
  { key: 'media', label: '媒体管理', icon: <PictureOutlined /> },
  { key: 'system', label: '系统管理', icon: <SettingOutlined /> },
  { key: 'monitor', label: '监控管理', icon: <EyeOutlined /> },
]

export interface RouteConfigItem {
  path: string
  component: React.LazyExoticComponent<React.ComponentType<object>>
  title: string
  keepAlive: boolean
  /** 侧边栏菜单图标；有 icon 的路由才会出现在侧边栏，子页面/动作页不设置 */
  icon?: React.ReactNode
  /** 所属侧边栏分组；不设置且有 icon 时作为顶级独立菜单项（如通知管理） */
  group?: MenuGroupKey
  /** 访问所需的 roleKey 列表；缺省表示任何已登录用户可访问 */
  roles?: string[]
}

export const routeConfig: RouteConfigItem[] = [
  { path: '/welcome', component: Welcome, title: '欢迎页', keepAlive: true, icon: <SmileOutlined />, group: 'home' },
  { path: '/dashboard', component: Dashboard, title: '仪表盘', keepAlive: true, icon: <DashboardOutlined />, group: 'home' },
  { path: '/article', component: ArticleList, title: '文章管理', keepAlive: true, icon: <FileTextOutlined />, group: 'content' },
  { path: '/article/tree', component: ArticleDirectoryTree, title: '文章归类树', keepAlive: true, icon: <ApartmentOutlined />, group: 'content' },
  { path: '/article/import', component: ArticleImport, title: '导入文档', keepAlive: false },
  { path: '/article/export', component: ArticleExport, title: '导出文档', keepAlive: false },
  { path: '/article/preview/:id', component: ArticlePreview, title: '预览文章', keepAlive: true },
  { path: '/article/tree/mindmap', component: ArticleMindMap, title: '归类可视化', keepAlive: true },
  { path: '/article/edit/:id', component: ArticleEdit, title: '编辑文章', keepAlive: true },
  { path: '/article/create', component: ArticleEdit, title: '创建文章', keepAlive: true },
  { path: '/category', component: Category, title: '分类管理', keepAlive: true, icon: <FolderOutlined />, group: 'content' },
  { path: '/tag', component: Tag, title: '标签管理', keepAlive: true, icon: <TagsOutlined />, group: 'content' },
  { path: '/archive', component: Archive, title: '归档管理', keepAlive: true },
  { path: '/comment', component: Comment, title: '评论管理', keepAlive: true, icon: <CommentOutlined />, group: 'interaction' },
  { path: '/talk', component: Talk, title: '说说管理', keepAlive: true, icon: <MessageOutlined />, group: 'content' },
  { path: '/talk/edit/:id', component: TalkEdit, title: '编辑说说', keepAlive: true },
  { path: '/talk/create', component: TalkEdit, title: '发布说说', keepAlive: true },
  { path: '/talk/detail/:id', component: TalkDetail, title: '说说详情', keepAlive: true },
  { path: '/user', component: User, title: '用户管理', keepAlive: true, icon: <UserOutlined />, group: 'system', roles: ADMIN_ONLY },
  { path: '/role', component: Role, title: '角色管理', keepAlive: true, icon: <TeamOutlined />, group: 'system', roles: ADMIN_ONLY },
  { path: '/menu', component: Menu, title: '菜单管理', keepAlive: true, icon: <MenuOutlined />, group: 'system', roles: ADMIN_ONLY },
  { path: '/resource', component: Resource, title: '接口管理', keepAlive: true, icon: <SettingOutlined />, group: 'system', roles: ADMIN_ONLY },
  { path: '/config', component: Config, title: '系统配置', keepAlive: true, icon: <SettingOutlined />, group: 'system', roles: ADMIN_ONLY },
  { path: '/file', component: File, title: '文件管理', keepAlive: true, icon: <FileOutlined />, group: 'media' },
  { path: '/visitor', component: Visitor, title: '访客统计', keepAlive: true, icon: <EyeOutlined />, group: 'monitor', roles: ADMIN_ONLY },
  { path: '/log/operation', component: LogOperation, title: '操作日志', keepAlive: true, icon: <FileSearchOutlined />, group: 'monitor', roles: ADMIN_ONLY },
  { path: '/log/error', component: LogError, title: '异常日志', keepAlive: true, icon: <FileSearchOutlined />, group: 'monitor', roles: ADMIN_ONLY },
  { path: '/friend-link', component: FriendLink, title: '友链管理', keepAlive: true, icon: <LinkOutlined />, group: 'interaction' },
  { path: '/notification', component: Notification, title: '通知管理', keepAlive: true, icon: <BellOutlined /> },
  { path: '/album', component: Album, title: '相册管理', keepAlive: true, icon: <PictureOutlined />, group: 'media' },
  { path: '/guestbook', component: Guestbook, title: '留言管理', keepAlive: true, icon: <BookOutlined />, group: 'interaction' },
  { path: '/about', component: About, title: '关于页面', keepAlive: true, icon: <InfoCircleOutlined />, group: 'system', roles: ADMIN_ONLY },
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

/**
 * 判断用户是否可访问某路由。
 * 用户信息尚未加载（user 为空）时不拦截，避免刷新时误跳转；
 * 路由角色加载后由守卫重新校验，越权访问会被重定向。
 */
export function hasRouteAccess(route: RouteConfigItem, user: User | null): boolean {
  if (!route.roles || route.roles.length === 0) return true
  if (!user) return true
  return user.roles.some((role) => route.roles!.includes(role.roleKey))
}

/**
 * 将当前路径解析为应高亮的侧边栏菜单项 key。
 * 子页面（如 /article/edit/3）逐级向上回退，命中最近的带菜单图标的一级路由。
 */
export function resolveMenuKey(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean)
  while (segments.length > 0) {
    const candidate = `/${segments.join('/')}`
    const route = routeConfig.find((r) => r.path === candidate && r.icon)
    if (route) return candidate
    segments.pop()
  }
  return undefined
}

/** 当前路径所属的菜单分组 key（用于展开分组） */
export function resolveGroupKeys(pathname: string): MenuGroupKey[] {
  const menuKey = resolveMenuKey(pathname)
  if (!menuKey) return []
  const route = routeConfig.find((r) => r.path === menuKey)
  return route?.group ? [route.group] : []
}
