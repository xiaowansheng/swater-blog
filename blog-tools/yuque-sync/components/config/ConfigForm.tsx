'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateConfig, testConnection } from '@/app/actions/config'
import { toast } from 'sonner'

interface Field {
  name: string
  label: string
  type: 'text' | 'password' | 'number' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  description?: React.ReactNode
  options?: Array<{ value: string; label: string }>
}

interface ConfigFormProps {
  title: string
  description: string
  category: string
  initialValues: Record<string, string>
  fields: Field[]
}

export function ConfigForm({
  title,
  description,
  category,
  initialValues,
  fields,
}: ConfigFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateConfig(category, values)
      if (result.success) {
        toast.success('配置已保存')
      } else {
        toast.error(result.message || '保存失败')
      }
    } catch (error) {
      toast.error('保存配置时发生错误')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const result = await testConnection(category as 'yuque' | 'blog')
      if (result.success) {
        toast.success(result.message || '连接测试成功')
      } else {
        toast.error(result.message || '连接测试失败')
      }
    } catch (error) {
      toast.error('连接测试时发生错误')
      console.error(error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'text' || field.type === 'password' || field.type === 'number' ? (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === 'select' ? (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values[field.name] === 'true'}
                    onChange={(e) =>
                      handleChange(field.name, e.target.checked ? 'true' : 'false')
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">
                    {field.description}
                  </span>
                </label>
              ) : null}

              {field.description && field.type !== 'checkbox' && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存配置'}
            </Button>
            {(category === 'yuque' || category === 'blog') && (
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? '测试中...' : '测试连接'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
