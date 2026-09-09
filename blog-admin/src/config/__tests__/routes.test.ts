import { describe, it, expect } from 'vitest'
import {
  routeConfig,
  matchRoute,
  hasRouteAccess,
  resolveMenuKey,
  resolveGroupKeys,
} from '@/config/routes'
import type { User } from '@/types'

const makeUser = (roleKeys: string[]): User =>
  ({
    roles: roleKeys.map((roleKey, i) => ({ id: i + 1, name: roleKey, roleKey })),
  }) as unknown as User

describe('matchRoute', () => {
  it('精确匹配静态路由', () => {
    const route = matchRoute('/article')
    expect(route?.path).toBe('/article')
    expect(route?.title).toBe('文章管理')
  })

  it('匹配动态参数路由', () => {
    expect(matchRoute('/article/edit/123')?.path).toBe('/article/edit/:id')
    expect(matchRoute('/talk/detail/abc')?.path).toBe('/talk/detail/:id')
  })

  it('动态段不允许跨斜杠匹配', () => {
    expect(matchRoute('/article/edit/123/extra')).toBeUndefined()
  })

  it('未注册路由返回 undefined', () => {
    expect(matchRoute('/not-exist')).toBeUndefined()
  })

  it('routeConfig 路径唯一', () => {
    const paths = routeConfig.map((r) => r.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('hasRouteAccess', () => {
  const adminRoute = routeConfig.find((r) => r.path === '/user')!
  const publicRoute = routeConfig.find((r) => r.path === '/article')!

  it('无角色要求的路由任何用户可访问', () => {
    expect(hasRouteAccess(publicRoute, null)).toBe(true)
    expect(hasRouteAccess(publicRoute, makeUser([]))).toBe(true)
  })

  it('用户信息未加载时不拦截', () => {
    expect(hasRouteAccess(adminRoute, null)).toBe(true)
  })

  it('admin 角色可访问受限路由', () => {
    expect(hasRouteAccess(adminRoute, makeUser(['admin']))).toBe(true)
  })

  it('非 admin 角色不可访问受限路由', () => {
    expect(hasRouteAccess(adminRoute, makeUser(['test']))).toBe(false)
    expect(hasRouteAccess(adminRoute, makeUser([]))).toBe(false)
  })
})

describe('resolveMenuKey', () => {
  it('菜单路由直接命中', () => {
    expect(resolveMenuKey('/article')).toBe('/article')
  })

  it('子页面回退到最近的菜单祖先', () => {
    expect(resolveMenuKey('/article/edit/3')).toBe('/article')
    expect(resolveMenuKey('/article/create')).toBe('/article')
  })

  it('中间层菜单路由优先', () => {
    // /article/tree/mindmap 自身不在菜单，回退到 /article/tree
    expect(resolveMenuKey('/article/tree/mindmap')).toBe('/article/tree')
  })

  it('未知路径返回 undefined', () => {
    expect(resolveMenuKey('/nowhere/deep')).toBeUndefined()
  })
})

describe('resolveGroupKeys', () => {
  it('返回菜单路由所属分组', () => {
    expect(resolveGroupKeys('/article/edit/3')).toEqual(['content'])
    expect(resolveGroupKeys('/user')).toEqual(['system'])
  })

  it('顶级独立菜单项无分组', () => {
    expect(resolveGroupKeys('/notification')).toEqual([])
  })

  it('未知路径返回空数组', () => {
    expect(resolveGroupKeys('/nowhere')).toEqual([])
  })
})
