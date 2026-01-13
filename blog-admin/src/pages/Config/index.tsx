import { useState, useEffect } from "react";
import {
  message,
  Form,
  Input,
  Switch,
  Tabs,
  Card,
  Button,
  Spin,
  InputNumber,
  Divider,
} from "antd";
import {
  SaveOutlined,
  GlobalOutlined,
  UserOutlined,
  PictureOutlined,
  LockOutlined,
  BellOutlined,
  MessageOutlined,
  CloudUploadOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { 
  ImageUpload,
  CoverUpload, 
  AvatarUpload, 
  SquareUpload 
} from "@/components/common/ImageUpload";
import * as configApi from "@/api/config";

const { TextArea } = Input;

const ConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("site");

  const [siteForm] = Form.useForm();
  const [authorForm] = Form.useForm();
  const [coverForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [notifyForm] = Form.useForm();
  // const [uploadForm] = Form.useForm();
  // const [emailForm] = Form.useForm();

  useEffect(() => {
    loadAllConfigs();
  }, []);

  const loadAllConfigs = async () => {
    setLoading(true);
    try {
      const [
        site,
        author,
        cover,
        social,
        privacy,
        comment,
        notify,
        // upload,
        // email,
      ] = await Promise.all([
        configApi.getSiteConfig(),
        configApi.getAuthorConfig(),
        configApi.getCoverConfig(),
        configApi.getSocialConfig(),
        configApi.getPrivacyConfig(),
        configApi.getCommentConfig(),
        configApi.getNotifyConfig(),
        // configApi.getUploadConfig(),
        // configApi.getEmailConfig(),
      ]);

      // 处理配置数据：将null和undefined转换为合适的默认值
      const processConfig = (config: any) => {
        return Object.keys(config).reduce((acc, key) => {
          const value = config[key];
          if (value === null || value === undefined) {
            // 对于contactMethods和socialLinks，初始化为空对象
            if (key === 'contactMethods' || key === 'socialLinks') {
              acc[key] = {};
            } else {
              acc[key] = '';
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as any);
      };

      siteForm.setFieldsValue(processConfig(site));
      authorForm.setFieldsValue(processConfig(author));
      coverForm.setFieldsValue(processConfig(cover));
      privacyForm.setFieldsValue(processConfig(privacy));
      commentForm.setFieldsValue(processConfig(comment));
      notifyForm.setFieldsValue(processConfig(notify));
      // uploadForm.setFieldsValue(upload);
      // emailForm.setFieldsValue(email);
    } catch (error) {
      console.error("加载配置失败", error);
      message.error("加载配置失败");
    } finally {
      setLoading(false);
    }
  };

  // 图片字段组件 - 根据业务需求选择合适的上传组件
  const ImageField = ({
    type = "cover",
    name,
    label,
    category,
  }: {
    type?: "cover" | "avatar" | "icon" | "logo";
    name: string;
    label: string;
    category?: string;
  }) => {
    const commonProps = {
      category: category || "config",
    };

    if (type === "avatar") {
      // 头像：使用圆形预设
      return (
        <Form.Item name={name} label={label}>
          <AvatarUpload {...commonProps} width={100} height={100} />
        </Form.Item>
      );
    }

    if (type === "icon") {
      // 图标/Favicon：使用正方形预设，尺寸较小
      return (
        <Form.Item name={name} label={label}>
          <SquareUpload {...commonProps} width={64} height={64} />
        </Form.Item>
      );
    }

    if (type === "logo") {
      // Logo：使用基础组件，完全自定义比例和内部提示
      return (
        <Form.Item name={name} label={label}>
          <ImageUpload 
            {...commonProps} 
            width={240} 
            height={80} 
            aspectRatio="any"
          >
            <div className="flex flex-col items-center">
              <PictureOutlined className="mb-2 text-2xl text-gray-300" />
              <span className="text-xs font-medium text-gray-400">上传网站 Logo</span>
              <span className="mt-1 text-[10px] text-gray-300">建议高度 60px</span>
            </div>
          </ImageUpload>
        </Form.Item>
      );
    }

    // 默认封面：使用封面预设 (16:9)
    return (
      <Form.Item name={name} label={label}>
        <CoverUpload {...commonProps} width={300} />
      </Form.Item>
    );
  };

  // 保存配置
  const handleSave = async (
    _type: string,
    form: any,
    updateFn: (data: any) => Promise<void>
  ) => {
    setSaving(true);
    try {
      const values = await form.validateFields();

      // 处理表单数据：确保嵌套对象被正确初始化
      const processedValues = Object.keys(values).reduce((acc, key) => {
        const value = values[key];
        if (value === undefined || value === null) {
          // 对于contactMethods和socialLinks，初始化为空对象
          if (key === 'contactMethods' || key === 'socialLinks') {
            acc[key] = {};
          } else {
            acc[key] = '';
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      await updateFn(processedValues);
      message.success("保存成功");
    } catch (error) {
      console.error("保存失败", error);
      message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const tabItems = [
    {
      key: "site",
      label: (
        <span>
          <GlobalOutlined /> 网站信息
        </span>
      ),
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
          <ImageField name="logo" label="网站Logo" type="logo" />
          <ImageField name="favicon" label="网站图标" type="icon" />
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
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() =>
                handleSave("site", siteForm, configApi.updateSiteConfig)
              }
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "author",
      label: (
        <span>
          <UserOutlined /> 作者信息
        </span>
      ),
      children: (
        <Form form={authorForm} layout="vertical" className="config-form">
          <Form.Item name="name" label="作者名称">
            <Input placeholder="博主名称" />
          </Form.Item>
          <ImageField name="avatar" label="作者头像" type="avatar" />
          <Form.Item name="signature" label="个性签名">
            <Input placeholder="一句话介绍自己" />
          </Form.Item>
          <Form.Item name="introduction" label="详细介绍">
            <TextArea rows={4} placeholder="详细的自我介绍" />
          </Form.Item>

          <Divider>联系方式</Divider>

          {/* 邮箱 */}
          <Form.Item
            name={['contactMethods', 'email', 'value']}
            label="邮箱"
          >
            <Input placeholder="联系邮箱" />
          </Form.Item>
          <Form.Item
            name={['contactMethods', 'email', 'visible']}
            label="前台显示邮箱"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* QQ */}
          <Form.Item
            name={['contactMethods', 'qq', 'value']}
            label="QQ"
          >
            <Input placeholder="QQ号码" />
          </Form.Item>
          <Form.Item
            name={['contactMethods', 'qq', 'visible']}
            label="前台显示QQ"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* 微信 */}
          <Form.Item
            name={['contactMethods', 'wechat', 'value']}
            label="微信"
          >
            <Input placeholder="微信号" />
          </Form.Item>
          <Form.Item
            name={['contactMethods', 'wechat', 'visible']}
            label="前台显示微信"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider>社交链接</Divider>

          {/* GitHub */}
          <Form.Item
            name={['socialLinks', 'github', 'value']}
            label="GitHub"
          >
            <Input placeholder="GitHub主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'github', 'visible']}
            label="前台显示GitHub"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Gitee */}
          <Form.Item
            name={['socialLinks', 'gitee', 'value']}
            label="Gitee"
          >
            <Input placeholder="Gitee主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'gitee', 'visible']}
            label="前台显示Gitee"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* 微博 */}
          <Form.Item
            name={['socialLinks', 'weibo', 'value']}
            label="微博"
          >
            <Input placeholder="微博主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'weibo', 'visible']}
            label="前台显示微博"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* 知乎 */}
          <Form.Item
            name={['socialLinks', 'zhihu', 'value']}
            label="知乎"
          >
            <Input placeholder="知乎主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'zhihu', 'visible']}
            label="前台显示知乎"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* B站 */}
          <Form.Item
            name={['socialLinks', 'bilibili', 'value']}
            label="B站"
          >
            <Input placeholder="B站主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'bilibili', 'visible']}
            label="前台显示B站"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Twitter */}
          <Form.Item
            name={['socialLinks', 'twitter', 'value']}
            label="Twitter"
          >
            <Input placeholder="Twitter主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'twitter', 'visible']}
            label="前台显示Twitter"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Telegram */}
          <Form.Item
            name={['socialLinks', 'telegram', 'value']}
            label="Telegram"
          >
            <Input placeholder="Telegram频道链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'telegram', 'visible']}
            label="前台显示Telegram"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Facebook */}
          <Form.Item
            name={['socialLinks', 'facebook', 'value']}
            label="Facebook"
          >
            <Input placeholder="Facebook主页链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'facebook', 'visible']}
            label="前台显示Facebook"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* YouTube */}
          <Form.Item
            name={['socialLinks', 'youtube', 'value']}
            label="YouTube"
          >
            <Input placeholder="YouTube频道链接" />
          </Form.Item>
          <Form.Item
            name={['socialLinks', 'youtube', 'visible']}
            label="前台显示YouTube"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() =>
                handleSave("author", authorForm, configApi.updateAuthorConfig)
              }
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "cover",
      label: (
        <span>
          <PictureOutlined /> 封面配置
        </span>
      ),
      children: (
        <Form form={coverForm} layout="vertical" className="config-form">
          <ImageField name="home" label="首页封面" />
          <ImageField name="article" label="文章页封面" />
          <ImageField name="archive" label="归档页封面" />
          <ImageField name="category" label="分类页封面" />
          <ImageField name="tag" label="标签页封面" />
          <ImageField name="talk" label="说说页封面" />
          <ImageField name="album" label="相册页封面" />
          <ImageField name="link" label="友链页封面" />
          <ImageField name="about" label="关于页封面" />
          <ImageField name="message" label="留言页封面" />
          <ImageField name="default" label="默认封面" />
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() =>
                handleSave("cover", coverForm, configApi.updateCoverConfig)
              }
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "privacy",
      label: (
        <span>
          <LockOutlined /> 隐私设置
        </span>
      ),
      children: (
        <Form form={privacyForm} layout="vertical" className="config-form">
          <Form.Item
            name="showIp"
            label="显示IP地址"
            valuePropName="checked"
            tooltip="前台是否显示评论/说说的IP地址"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="showLocation"
            label="显示位置信息"
            valuePropName="checked"
            tooltip="前台是否显示省市位置"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="showDevice"
            label="显示设备信息"
            valuePropName="checked"
            tooltip="前台是否显示设备类型"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="showBrowser"
            label="显示浏览器信息"
            valuePropName="checked"
            tooltip="前台是否显示浏览器信息"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() =>
                handleSave(
                  "privacy",
                  privacyForm,
                  configApi.updatePrivacyConfig
                )
              }
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "comment",
      label: (
        <span>
          <MessageOutlined /> 评论设置
        </span>
      ),
      children: (
        <Form form={commentForm} layout="vertical" className="config-form">
          <Form.Item
            name="enabled"
            label="启用评论功能"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="needApproval"
            label="开启评论审核"
            valuePropName="checked"
            tooltip="新评论需要管理员审核后才能显示"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="allowAnonymous"
            label="允许匿名评论"
            valuePropName="checked"
            tooltip="允许未登录用户发表评论"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="maxLength"
            label="评论最大长度"
            tooltip="评论内容的最大字符数限制"
          >
            <InputNumber min={0} max={10000} style={{ width: 200 }} placeholder="不限制则留空" />
          </Form.Item>
          <Form.Item
            name="emailNotification"
            label="邮件通知"
            valuePropName="checked"
            tooltip="收到新评论时发送邮件通知"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="sensitiveWords"
            label="敏感词过滤"
            tooltip="多个敏感词用逗号分隔，包含敏感词的评论将被拦截"
          >
            <TextArea rows={2} placeholder="例如：垃圾,广告,违法" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() =>
                handleSave(
                  "comment",
                  commentForm,
                  configApi.updateCommentConfig
                )
              }
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "notify",
      label: (
        <span>
          <BellOutlined /> 通知设置
        </span>
      ),
      children: (
        <Form form={notifyForm} layout="vertical" className="config-form">
          <Form.Item
            name="loginNotify"
            label="登录通知"
            valuePropName="checked"
            tooltip="用户登录时发送通知"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="commentNotify"
            label="评论通知"
            valuePropName="checked"
            tooltip="收到新评论时通知博主"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="replyNotify"
            label="回复通知"
            valuePropName="checked"
            tooltip="评论被回复时通知评论者"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="guestbookNotify"
            label="留言通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="friendLinkNotify"
            label="友链申请通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() =>
                handleSave("notify", notifyForm, configApi.updateNotifyConfig)
              }
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    // {
    //   key: "upload",
    //   label: (
    //     <span>
    //       <CloudUploadOutlined /> 上传设置
    //     </span>
    //   ),
    //   children: (
    //     <Form form={uploadForm} layout="vertical" className="config-form">
    //       <Form.Item
    //         name="maxSize"
    //         label="文件大小限制(字节)"
    //         tooltip="默认10MB = 10485760字节"
    //       >
    //         <InputNumber min={1048576} max={104857600} style={{ width: 200 }} />
    //       </Form.Item>
    //       <Form.Item
    //         name="allowedTypes"
    //         label="允许的文件类型"
    //         tooltip="多个类型用逗号分隔"
    //       >
    //         <Input placeholder="jpg,jpeg,png,gif,webp,pdf" />
    //       </Form.Item>
    //       <Form.Item
    //         name="imageCompress"
    //         label="图片自动压缩"
    //         valuePropName="checked"
    //       >
    //         <Switch />
    //       </Form.Item>
    //       <Form.Item name="imageQuality" label="压缩质量(1-100)">
    //         <InputNumber min={1} max={100} />
    //       </Form.Item>
    //       <Form.Item>
    //         <Button
    //           type="primary"
    //           icon={<SaveOutlined />}
    //           loading={saving}
    //           onClick={() =>
    //             handleSave("upload", uploadForm, configApi.updateUploadConfig)
    //           }
    //         >
    //           保存
    //         </Button>
    //       </Form.Item>
    //     </Form>
    //   ),
    // },
    // {
    //   key: "email",
    //   label: (
    //     <span>
    //       <MailOutlined /> 邮件设置
    //     </span>
    //   ),
    //   children: (
    //     <Form form={emailForm} layout="vertical" className="config-form">
    //       <Form.Item name="enable" label="启用邮件功能" valuePropName="checked">
    //         <Switch />
    //       </Form.Item>
    //       <Form.Item name="host" label="SMTP服务器">
    //         <Input placeholder="如：smtp.qq.com" />
    //       </Form.Item>
    //       <Form.Item name="port" label="SMTP端口">
    //         <InputNumber min={1} max={65535} />
    //       </Form.Item>
    //       <Form.Item name="username" label="邮箱账号">
    //         <Input placeholder="发件人邮箱" />
    //       </Form.Item>
    //       <Form.Item name="password" label="邮箱密码/授权码">
    //         <Input.Password placeholder="邮箱密码或授权码" />
    //       </Form.Item>
    //       <Form.Item name="fromName" label="发件人名称">
    //         <Input placeholder="邮件显示的发件人名称" />
    //       </Form.Item>
    //       <Form.Item>
    //         <Button
    //           type="primary"
    //           icon={<SaveOutlined />}
    //           loading={saving}
    //           onClick={() =>
    //             handleSave("email", emailForm, configApi.updateEmailConfig)
    //           }
    //         >
    //           保存
    //         </Button>
    //       </Form.Item>
    //     </Form>
    //   ),
    // },
  ];

  return (
    <div className="page-container">
      <div className="search-bar">
        <h2 className="text-lg font-medium">系统配置</h2>
      </div>
      <Card className="chart-card">
        <Spin spinning={loading}>
          <Tabs
            className="config-tabs"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabPosition="left"
          />
        </Spin>
      </Card>
      <style>{`
        .config-tabs {
          height: calc(100vh - 280px);
          min-height: 400px;
        }
        .config-tabs .ant-tabs-nav {
          overflow-y: auto;
        }
        .config-tabs .ant-tabs-content-holder {
          overflow-y: auto;
        }
        .config-form { max-width: 600px; padding-left: 24px; }
        .config-form .ant-form-item { margin-bottom: 16px; }
      `}</style>
    </div>
  );
};

export default ConfigPage;
