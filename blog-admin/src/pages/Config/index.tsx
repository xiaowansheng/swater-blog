import { useState, useEffect } from 'react'
import { 
  message, Form, Input, Switch, Tabs, Card, Button, Spin, 
  Upload, InputNumber, Space, Divider
} from 'antd'
import Image from '@/components/common/ImageWithPreview'
import { 
  SaveOutlined, UploadOutlined, 
  GlobalOutlined, UserOutlined, PictureOutlined, 
  LockOutlined, BellOutlined, MessageOutlined,
  CloudUploadOutlined, MailOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import * as configApi from '@/api/config'

const { TextArea } = Input

const ConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('site')
  
  const [siteForm] = Form.useForm()
  const [authorForm] = Form.useForm()
  const [coverForm] = Form.useForm()
  const [socialForm] = Form.useForm()
  const [privacyForm] = Form.useForm()
  const [commentForm] = Form.useForm()
  const [notifyForm] = Form.useForm()
  const [uploadForm] = Form.useForm()
  const [emailForm] = Form.useForm()

  useEffect(() => {
    loadAllConfigs()
  }, [])

  const loadAllConfigs = async () => {
    setLoading(true)
    try {
      const [site, author, cover, social, privacy, comment, notify, upload, email] = await Promise.all([
        configApi.getSiteConfig(),
        configApi.getAuthorConfig(),
        configApi.getCoverConfig(),
        configApi.getSocialConfig(),
        configApi.getPrivacyConfig(),
        configApi.getCommentConfig(),
        configApi.getNotifyConfig(),
        configApi.getUploadConfig(),
        configApi.getEmailConfig(),
      ])
      siteForm.setFieldsValue(site)
      authorForm.setFieldsValue(author)
      coverForm.setFieldsValue(cover)
      socialForm.setFieldsValue(social)
      privacyForm.setFieldsValue(privacy)
      commentForm.setFieldsValue(comment)
      notifyForm.setFieldsValue(notify)
      uploadForm.setFieldsValue(upload)
      emailForm.setFieldsValue(email)
    } catch (error) {
      console.error('加载配置失败', error)
      message.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  // 图片上传配置
  const getUploadProps = (form: any, field: string): UploadProps => ({
    name: 'file',
    action: '/api/admin/file/upload',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    showUploadList: false,
    accept: 'image/*',
    onChange(info) {
      if (info.file.status === 'done') {
        const url = info.file.response?.data?.url
        if (url) {
          form.setFieldValue(field, url)
          message.success('上传成功')
        }
      } else if (info.file.status === 'error') {
        message.error('上传失败')
      }
    },
  })

  // 图片字段组件
  const ImageField = ({ form, name, label }: { form: any; name: string; label: string }) => (
    <Form.Item label={label}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item name={name} noStyle>
          <Input placeholder="图片URL" />
        </Form.Item>
        <Space>
          <Upload {...getUploadProps(form, name)}>
            <Button icon={<UploadOutlined />} size="small">上传</Button>
          </Upload>
          <Form.Item noStyle shouldUpdate>
            {() => {
              const url = form.getFieldValue(name)
              return url ? (
                <Image 
                  src={url} 
                  alt="preview" 
                  style={{ height: 32, maxWidth: 80, objectFit: 'cover', borderRadius: 4 }} 
                />
              ) : null
            }}
          </Form.Item>
        </Space>
      </Space>
    </Form.Item>
  )

  // 保存配置
  const handleSave = async (type: string, form: any, updateFn: (data: any) => Promise<void>) => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      await updateFn(values)
      message.success('保存成功')
    } catch (error) {
      console.error('保存失败', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const tabItems = [
    {
      key: 'site',
      label: <span><GlobalOutlined /> 网站信息</span>,
      children: (
        <Form form={siteForm} layout="vertical" className="config-form">
          <Form.Item name="name" label="网站名称" rules={[{ required: true }]}>
            <Input placeholder="请输入网站名称" />
          </Form.Item>
          <Form.Item name="description" label="网站描述">
            <TextArea rows={2} placeholder="网站描述，用于SEO" />
          </Form.Item>
          <Form.Item name="keywords" label="关键词">
            <Input placeholder="多个关键词用逗号分隔" />
          </Form.Item>
          <ImageField form={siteForm} name="logo" label="网站Logo" />
          <ImageField form={siteForm} name="favicon" label="网站图标" />
          <Form.Item name="createTime" label="建站时间">
            <Input placeholder="如：2024-01-01" />
          </Form.Item>
          <Form.Item name="icp" label="ICP备案号">
            <Input placeholder="如：京ICP备xxxxx号" />
          </Form.Item>
          <Form.Item name="police" label="公安备案号">
            <Input placeholder="公安备案号" />
          </Form.Item>
          <Form.Item name="copyright" label="版权信息">
            <Input placeholder="网站底部版权信息" />
          </Form.Item>
          <Form.Item name="notice" label="网站公告">
            <TextArea rows={3} placeholder="首页显示的公告内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('site', siteForm, configApi.updateSiteConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'author',
      label: <span><UserOutlined /> 作者信息</span>,
      children: (
        <Form form={authorForm} layout="vertical" className="config-form">
          <Form.Item name="name" label="作者名称">
            <Input placeholder="博主名称" />
          </Form.Item>
          <ImageField form={authorForm} name="avatar" label="作者头像" />
          <Form.Item name="signature" label="个性签名">
            <Input placeholder="一句话介绍自己" />
          </Form.Item>
          <Form.Item name="introduction" label="详细介绍">
            <TextArea rows={4} placeholder="详细的自我介绍" />
          </Form.Item>
          <Divider>联系方式</Divider>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="联系邮箱" />
          </Form.Item>
          <Form.Item name="showEmail" label="前台显示邮箱" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="qq" label="QQ">
            <Input placeholder="QQ号码" />
          </Form.Item>
          <Form.Item name="showQq" label="前台显示QQ" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="wechat" label="微信">
            <Input placeholder="微信号" />
          </Form.Item>
          <Form.Item name="showWechat" label="前台显示微信" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Divider>社交链接</Divider>
          <Form.Item name="github" label="GitHub">
            <Input placeholder="GitHub主页链接" />
          </Form.Item>
          <Form.Item name="gitee" label="Gitee">
            <Input placeholder="Gitee主页链接" />
          </Form.Item>
          <Form.Item name="weibo" label="微博">
            <Input placeholder="微博主页链接" />
          </Form.Item>
          <Form.Item name="zhihu" label="知乎">
            <Input placeholder="知乎主页链接" />
          </Form.Item>
          <Form.Item name="bilibili" label="B站">
            <Input placeholder="B站主页链接" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('author', authorForm, configApi.updateAuthorConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'cover',
      label: <span><PictureOutlined /> 封面配置</span>,
      children: (
        <Form form={coverForm} layout="vertical" className="config-form">
          <ImageField form={coverForm} name="home" label="首页封面" />
          <ImageField form={coverForm} name="article" label="文章页封面" />
          <ImageField form={coverForm} name="archive" label="归档页封面" />
          <ImageField form={coverForm} name="category" label="分类页封面" />
          <ImageField form={coverForm} name="tag" label="标签页封面" />
          <ImageField form={coverForm} name="talk" label="说说页封面" />
          <ImageField form={coverForm} name="album" label="相册页封面" />
          <ImageField form={coverForm} name="link" label="友链页封面" />
          <ImageField form={coverForm} name="about" label="关于页封面" />
          <ImageField form={coverForm} name="message" label="留言页封面" />
          <ImageField form={coverForm} name="default" label="默认封面" />
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('cover', coverForm, configApi.updateCoverConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'privacy',
      label: <span><LockOutlined /> 隐私设置</span>,
      children: (
        <Form form={privacyForm} layout="vertical" className="config-form">
          <Form.Item name="showIp" label="显示IP地址" valuePropName="checked" tooltip="前台是否显示评论/说说的IP地址">
            <Switch />
          </Form.Item>
          <Form.Item name="showLocation" label="显示位置信息" valuePropName="checked" tooltip="前台是否显示省市位置">
            <Switch />
          </Form.Item>
          <Form.Item name="showDevice" label="显示设备信息" valuePropName="checked" tooltip="前台是否显示设备类型">
            <Switch />
          </Form.Item>
          <Form.Item name="showBrowser" label="显示浏览器信息" valuePropName="checked" tooltip="前台是否显示浏览器信息">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('privacy', privacyForm, configApi.updatePrivacyConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'comment',
      label: <span><MessageOutlined /> 评论设置</span>,
      children: (
        <Form form={commentForm} layout="vertical" className="config-form">
          <Form.Item name="enableAudit" label="开启评论审核" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="allowAnonymous" label="允许匿名评论" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="allowGuest" label="允许游客评论" valuePropName="checked" tooltip="游客需填写昵称和邮箱">
            <Switch />
          </Form.Item>
          <Form.Item name="showEmail" label="显示评论者邮箱" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="pageSize" label="每页评论数">
            <InputNumber min={5} max={50} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('comment', commentForm, configApi.updateCommentConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'notify',
      label: <span><BellOutlined /> 通知设置</span>,
      children: (
        <Form form={notifyForm} layout="vertical" className="config-form">
          <Form.Item name="loginEmail" label="登录邮件通知" valuePropName="checked" tooltip="用户登录时发送邮件通知">
            <Switch />
          </Form.Item>
          <Form.Item name="commentEmail" label="评论邮件通知" valuePropName="checked" tooltip="收到新评论时通知博主">
            <Switch />
          </Form.Item>
          <Form.Item name="replyEmail" label="回复邮件通知" valuePropName="checked" tooltip="评论被回复时通知评论者">
            <Switch />
          </Form.Item>
          <Form.Item name="guestbookEmail" label="留言邮件通知" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="friendLinkEmail" label="友链申请通知" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('notify', notifyForm, configApi.updateNotifyConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'upload',
      label: <span><CloudUploadOutlined /> 上传设置</span>,
      children: (
        <Form form={uploadForm} layout="vertical" className="config-form">
          <Form.Item name="maxSize" label="文件大小限制(字节)" tooltip="默认10MB = 10485760字节">
            <InputNumber min={1048576} max={104857600} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="allowedTypes" label="允许的文件类型" tooltip="多个类型用逗号分隔">
            <Input placeholder="jpg,jpeg,png,gif,webp,pdf" />
          </Form.Item>
          <Form.Item name="imageCompress" label="图片自动压缩" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="imageQuality" label="压缩质量(1-100)">
            <InputNumber min={1} max={100} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('upload', uploadForm, configApi.updateUploadConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'email',
      label: <span><MailOutlined /> 邮件设置</span>,
      children: (
        <Form form={emailForm} layout="vertical" className="config-form">
          <Form.Item name="enable" label="启用邮件功能" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="host" label="SMTP服务器">
            <Input placeholder="如：smtp.qq.com" />
          </Form.Item>
          <Form.Item name="port" label="SMTP端口">
            <InputNumber min={1} max={65535} />
          </Form.Item>
          <Form.Item name="username" label="邮箱账号">
            <Input placeholder="发件人邮箱" />
          </Form.Item>
          <Form.Item name="password" label="邮箱密码/授权码">
            <Input.Password placeholder="邮箱密码或授权码" />
          </Form.Item>
          <Form.Item name="fromName" label="发件人名称">
            <Input placeholder="邮件显示的发件人名称" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => handleSave('email', emailForm, configApi.updateEmailConfig)}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="search-bar">
        <h2 className="text-lg font-medium">系统配置</h2>
      </div>
      <Card className="chart-card">
        <Spin spinning={loading}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabPosition="left"
            style={{ minHeight: 600 }}
          />
        </Spin>
      </Card>
      <style>{`
        .config-form { max-width: 600px; padding-left: 24px; }
        .config-form .ant-form-item { margin-bottom: 16px; }
      `}</style>
    </div>
  )
}

export default ConfigPage
