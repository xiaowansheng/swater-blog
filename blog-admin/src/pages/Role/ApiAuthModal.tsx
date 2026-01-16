import { useState, useEffect } from 'react'
import { Modal, Tree, Input, Tag, Spin, message, Empty, Button } from 'antd'
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
      setCheckedKeys(roleApiIds.map(String))
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
      // 过滤掉父节点（模块）的key，只保存实际API的key
      // 收集所有API节点的key（没有children属性的节点）
      const getAllApiKeys = (nodes: any[]): string[] => {
        let keys: string[] = []
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            keys = keys.concat(getAllApiKeys(node.children))
          } else {
            // 是叶子节点（API），有method和path属性
            if (node.method && node.path) {
              keys.push(node.key)
            }
          }
        })
        return keys
      }

      const allValidApiKeys = getAllApiKeys(treeData)
      const validCheckedKeys = checkedKeys.filter(key =>
        allValidApiKeys.includes(key as string)
      )

      await assignApis(roleId, validCheckedKeys.map(Number))
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
          children: buildTreeData(api.children || [])
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
        // 优先判断是否有子节点（模块节点）
        if (api.children && api.children.length > 0) {
          // 模块节点，递归统计子节点
          countByMethod(api.children)
        } else if (api.method && api.path) {
          // 叶子节点（实际的API接口），根据方法过滤统计
          if (!method || api.method.toUpperCase() === method.toUpperCase()) {
            count++
          }
        }
      })
    }
    countByMethod(apis)
    return count
  }

  // 自定义处理选中逻辑
  const handleCheck = (checkedKeysValue: any, info: any) => {
    const { checked, node, checkedNodes } = info

    // 如果选中的是父节点（模块），需要只选择当前过滤后可见的子节点
    if (node.children && node.children.length > 0) {
      // 获取该父节点下所有可见的API节点ID
      const getVisibleApiKeys = (nodes: any[]): string[] => {
        let keys: string[] = []
        nodes.forEach(child => {
          if (child.children && child.children.length > 0) {
            keys = keys.concat(getVisibleApiKeys(child.children))
          } else {
            // 是叶子节点（API）
            keys.push(child.key)
          }
        })
        return keys
      }

      const visibleApiKeys = getVisibleApiKeys(node.children)

      // 合并或移除可见的API节点
      setCheckedKeys((prevKeys: React.Key[]) => {
        let newKeys = [...prevKeys]

        if (checked) {
          // 添加所有可见的API节点
          visibleApiKeys.forEach(key => {
            if (!newKeys.includes(key)) {
              newKeys.push(key)
            }
          })
        } else {
          // 移除该模块下所有的API节点（包括被过滤的）
          const getAllApiKeysUnderParent = (parentId: string, allNodes: any[]): string[] => {
            let keys: string[] = []
            allNodes.forEach(n => {
              if (n.key === parentId && n.children) {
                keys = keys.concat(getAllLeafKeys(n.children))
              } else if (n.children) {
                keys = keys.concat(getAllApiKeysUnderParent(parentId, n.children))
              }
            })
            return keys
          }

          const getAllLeafKeys = (nodes: any[]): string[] => {
            let keys: string[] = []
            nodes.forEach(child => {
              if (child.children && child.children.length > 0) {
                keys = keys.concat(getAllLeafKeys(child.children))
              } else {
                keys.push(child.key)
              }
            })
            return keys
          }

          const allApiKeysToRemove = getAllApiKeysUnderParent(node.key, treeData)
          newKeys = newKeys.filter(key => !allApiKeysToRemove.includes(key))
        }

        return newKeys
      })
    } else {
      // 选中的是叶子节点（API），直接更新
      setCheckedKeys(checkedKeysValue as React.Key[])
    }
  }

  // 清空所有选择
  const handleClearAll = () => {
    setCheckedKeys([])
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
            全部 ({getMethodCount('')})
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
              onCheck={handleCheck}
              treeData={treeData}
              defaultExpandAll
              showLine={{ showLeafIcon: false }}
              className="api-auth-tree"
            />
          ) : (
            <Empty description="暂无接口数据" />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            已选择 {checkedKeys.length} 个接口
          </div>
          {checkedKeys.length > 0 && (
            <Button
              size="small"
              onClick={handleClearAll}
              className="text-gray-600"
            >
              取消选择
            </Button>
          )}
        </div>
      </Spin>
    </Modal>
  )
}

export default ApiAuthModal
