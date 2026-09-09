import { Space, Tag } from 'antd'
import dayjs from 'dayjs'

export const getTrafficSourceColor = (source?: string) => {
  switch (source) {
    case 'DIRECT':
      return 'blue'
    case 'SEARCH':
      return 'green'
    case 'UTM':
      return 'gold'
    case 'REFERRAL':
      return 'purple'
    default:
      return 'default'
  }
}

export const getDisplayUrl = (value?: string, fallback?: string) => {
  if (!value) return fallback || '-'
  try {
    const parsed = new URL(value)
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || parsed.href
  } catch {
    return value
  }
}

export const getHost = (value?: string) => {
  if (!value) return ''
  try {
    return new URL(value).host
  } catch {
    return ''
  }
}

export const buildSessionKey = (visitorId: number, sessionId: string) => `${visitorId}:${sessionId}`

export const buildStatsRange = (statRange: [string | null, string | null]) => {
  const [startDate, endDate] = statRange
  return {
    start: startDate || '1970-01-01T00:00:00',
    end: endDate || dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  }
}

export const renderPageKey = (pageKey?: string) => {
  const [type, ...rest] = String(pageKey || '').split(':')
  const key = rest.join(':')
  const tagColor = type === 'ARTICLE' ? 'blue' : type === 'TALK' ? 'gold' : 'default'

  return (
    <Space>
      <Tag color={tagColor}>{type || 'PAGE'}</Tag>
      <span>{key || pageKey || '-'}</span>
    </Space>
  )
}

export const renderUrlBlock = (value?: string, fallback?: string) => {
  const displayValue = getDisplayUrl(value, fallback)
  const host = getHost(value)

  return (
    <Space size={4} direction="vertical">
      <span>{displayValue}</span>
      {host && <span className="text-xs text-gray-400">{host}</span>}
    </Space>
  )
}
