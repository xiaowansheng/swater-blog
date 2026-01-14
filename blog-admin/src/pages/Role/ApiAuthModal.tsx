import { useState, useEffect } from 'react'
import { Modal, Tree, Input, Tag, Spin, message, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getApiList } from '@/api/api'
import { getRoleApiIds, assignApis } from '@/api/role'
import { ApiVO } from '@/types/api'

interface ApiAuthModalProps {
  visible: boolean
  roleId: number | null
  roleName: string
  onCancel: () => void
  onSuccess: () => void
}

interface DataNode {
  title: React.ReactNode
  key: string
  isLeaf?: boolean
  children?: DataNode[]
  method?: string
  path?: string
}

const ApiAuthModal: React.FC<ApiAuthModalProps> = ({
  visible,
  roleId,
  roleName,
  onCancel,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apis, setApis] = useState<ApiVO[]>([])
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('')

  useEffect(() => {
    if (visible && roleId) {
      loadData()
    }
  }, [visible, roleId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [apiData, roleApiIds] = await Promise.all([
        getApiList(),
        roleId ? getRoleApiIds(roleId) : Promise.resolve([])
      ])
      setApis(apiData)
      setCheckedKeys(roleApiIds)
    } catch (error) {
      console.error('加载数据失败', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!roleId) return

    setSaving(true)
    try {
      await assignApis(roleId, checkedKeys as number[])
      message.success('API权限分配成功')
      onSuccess()
      onCancel()
    } catch (error) {
      console.error('分配API权限失败', error)
      message.error('分配API权限失败')
    } finally {
      setSaving(false)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'blue'
      case 'POST': return 'green'
      case 'PUT': return 'orange'
      case 'DELETE': return 'red'
      default: return 'default'
    }
  }

  // 过滤API树
  const filterApiTree = (apiList: ApiVO[], method: string): ApiVO[] => {
    return apiList.reduce((acc: ApiVO[], api) => {
      // 如果有子节点，递归过滤
      if (api.children && api.children.length > 0) {
        const filteredChildren = filterApiTree(api.children, method)
        if (filteredChildren.length > 0) {
          acc.push({
            ...api,
            children: filteredChildren
          })
        }
      } else {
        // 叶子节点（实际API），根据方法过滤
        if (!method || !api.method || api.method.toUpperCase() === method.toUpperCase()) {
          acc.push(api)
        }
      }
      return acc
    }, [])
  }

  // 构建树形数据
  const buildTreeData = (apiList: ApiVO[]): DataNode[] => {
    return apiList.map((api) => {
      const hasChildren = api.children && api.children.length > 0
      const isApi = api.method && api.path

      if (hasChildren) {
        return {
          title: api.name,
          key: String(api.id),
          children: buildTreeData(api.children)
        }
      } else if (isApi) {
        const title = (
          <div className="flex items-center justify-between py-1">
            <div className="flex-1">
              <div className="font-medium">{api.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                <Tag color={getMethodColor(api.method)} className="mr-1">
                  {api.method?.toUpperCase()}
                </Tag>
                <code className="bg-gray-100 px-1 rounded text-xs">{api.path}</code>
              </div>
            </div>
          </div>
        )
        return {
          title,
          key: String(api.id),
          method: api.method,
          path: api.path
        }
      }
      return null
    }).filter(Boolean) as DataNode[]
  }

  const filteredApis = methodFilter ? filterApiTree(apis, methodFilter) : apis
  const treeData = buildTreeData(filteredApis)

  const getMethodCount = (method: string) => {
    let count = 0
    const countByMethod = (list: ApiVO[]) => {
      list.forEach(api => {
        if (api.children && api.children.length > 0) {
          countByMethod(api.children)
        } else if (api.method && api.method.toUpperCase() === method.toUpperCase()) {
          count++
        }
      })
    }
    countByMethod(apis)
    return count
  }

  return (
    <Modal
      title={`API授权 - ${roleName}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={saving}
      width={700}
      okText="保存"
      cancelText="取消"
    >
      <Spin spinning={loading}>
        <div className="mb-4">
          <Input
            placeholder="搜索接口名称或路径"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            allowClear
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Tag
            color={!methodFilter ? 'blue' : 'default'}
            className="cursor-pointer"
            onClick={() => setMethodFilter('')}
          >
            全部 ({apis.length})
          </Tag>
          <Tag
            color={methodFilter === 'GET' ? 'blue' : 'default'}
            className="cursor-pointer"
            onClick={() => setMethodFilter(methodFilter === 'GET' ? '' : 'GET')}
          >
            GET ({getMethodCount('GET')})
          </Tag>
          <Tag
            color={methodFilter === 'POST' ? 'green' : 'default'}
            className="cursor-pointer"
            onClick={() => setMethodFilter(methodFilter === 'POST' ? '' : 'POST')}
          >
            POST ({getMethodCount('POST')})
          </Tag>
          <Tag
            color={methodFilter === 'PUT' ? 'orange' : 'default'}
            className="cursor-pointer"
            onClick={() => setMethodFilter(methodFilter === 'PUT' ? '' : 'PUT')}
          >
            PUT ({getMethodCount('PUT')})
          </Tag>
          <Tag
            color={methodFilter === 'DELETE' ? 'red' : 'default'}
            className="cursor-pointer"
            onClick={() => setMethodFilter(methodFilter === 'DELETE' ? '' : 'DELETE')}
          >
            DELETE ({getMethodCount('DELETE')})
          </Tag>
        </div>

        <div className="max-h-96 overflow-y-auto border rounded p-4">
          {treeData.length > 0 ? (
            <Tree
              checkable
              checkedKeys={checkedKeys}
              onCheck={(keys) => setCheckedKeys(keys as React.Key[])}
              treeData={treeData}
              defaultExpandAll
              showLine={{ showLeafIcon: false }}
              className="api-auth-tree"
            />
          ) : (
            <Empty description="暂无接口数据" />
          )}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          已选择 {checkedKeys.length} 个接口
        </div>
      </Spin>
    </Modal>
  )
}

export default ApiAuthModal
