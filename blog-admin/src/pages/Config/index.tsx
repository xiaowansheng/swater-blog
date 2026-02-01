/**
 * 网站配置管理页面
 *
 * ## 时区处理方案
 *
 * 本页面实现了完整的时区转换机制，确保网站运行时间在全球范围内保持一致：
 *
 * ### 1. 用户输入（管理员）
 * - 管理员在本地时区输入建站时间（如北京时间：2025-01-25）
 * - 含义：本地时间 2025-01-25 00:00:00
 *
 * ### 2. 上传转换（本地时间 → UTC）
 * - 函数：convertToUTC()
 * - 转换：北京 2025-01-25 00:00:00 → UTC 2025-01-24T16:00:00.000Z
 * - 存储：统一以 UTC ISO 格式存储到数据库
 *
 * ### 3. 回显转换（UTC → 本地时间）
 * - 函数：convertFromUTC()
 * - 转换：UTC 2025-01-24T16:00:00.000Z → 北京 2025-01-25 00:00:00
 * - 显示：管理员看到的是本地时区的时间
 *
 * ### 4. 前台展示（统一 UTC 计算）
 * - 组件：SiteRunningTime
 * - 解析：统一按 UTC 时间计算运行时间
 * - 效果：无论访问者身在何处，看到的运行时间一致
 *
 * ### 示例流程
 * ```
 * 北京管理员输入：2025-01-25
 *       ↓ convertToUTC()
 * 存储到数据库：2025-01-24T16:00:00.000Z (UTC)
 *       ↓ convertFromUTC()
 * 北京管理后台：2025-01-25 00:00:00 (回显)
 *       ↓ SiteRunningTime 按UTC计算
 * 全球用户看到：统一的运行时间 ✅
 * ```
 *
 * ### 关键技术点
 * - new Date("2025-01-25") 被解析为 UTC 时间（不是本地时间）
 * - new Date("2025-01-25T00:00:00") 被解析为本地时间 ✅
 * - 纯日期格式需要添加 T00:00:00 后缀才能正确解析为本地时间
 *
 * @author Claude Code
 * @since 2025-01-28
 */
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
  Modal,
} from "antd";
import {
  SaveOutlined,
  GlobalOutlined,
  UserOutlined,
  PictureOutlined,
  LockOutlined,
  BellOutlined,
  MessageOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
  UndoOutlined,
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
  const [unsavedTabs, setUnsavedTabs] = useState<Set<string>>(new Set());
  const [originalValues, setOriginalValues] = useState<Record<string, any>>({});

  const defaultPrivacyConfig = {
    showIp: false,
    showLocation: true,
    showDevice: false,
    showBrowser: false,
  };

  const normalizeBooleanValue = (value: any, defaultValue = false): boolean => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return defaultValue;
      if (trimmed === "true" || trimmed === "1") return true;
      if (trimmed === "false" || trimmed === "0") return false;
    }
    return Boolean(value);
  };

  const [siteForm] = Form.useForm();
  const [authorForm] = Form.useForm();
  const [coverForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const [componentForm] = Form.useForm();
  // const [uploadForm] = Form.useForm();
  // const [emailForm] = Form.useForm();

  useEffect(() => {
    loadAllConfigs();
  }, []);

  // 标记标签页为未保存状态
  const markTabAsUnsaved = (tabKey: string) => {
    setUnsavedTabs((prev) => new Set(prev).add(tabKey));
  };

  // 清除标签页的未保存状态
  const clearTabUnsaved = (tabKey: string) => {
    setUnsavedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tabKey);
      return newSet;
    });
  };

  // 处理标签页切换
  const handleTabChange = (newTab: string) => {
    if (unsavedTabs.has(activeTab)) {
      Modal.confirm({
        title: "未保存的更改",
        icon: <ExclamationCircleOutlined />,
        content: "当前标签页有未保存的数据，确定要离开吗？",
        okText: "离开",
        cancelText: "取消",
        onOk: () => {
          setActiveTab(newTab);
        },
      });
    } else {
      setActiveTab(newTab);
    }
  };

  const loadAllConfigs = async () => {
    setLoading(true);
    try {
      /**
       * 将 UTC 时间字符串转换为本地时间格式（用于管理后台回显）
       *
       * ### 转换规则
       * - 输入：UTC ISO 格式（如 "2025-01-24T16:00:00.000Z"）
       * - 输出：本地时间格式（如 "2025-01-25 00:00:00"）
       *
       * ### 示例（北京时间 UTC+8）
       * ```
       * "2025-01-24T16:00:00.000Z" → "2025-01-25 00:00:00"
       * ```
       *
       * ### 兼容性
       * - 支持纯日期格式（如 "2025-01-25"）
       * - 支持本地时间格式（如 "2025-01-25 00:00:00"）
       * - 支持标准 UTC 格式（如 "2025-01-24T16:00:00.000Z"）
       *
       * @param utcStr - UTC 时间字符串或本地时间字符串
       * @returns 本地时间格式字符串 "yyyy-MM-dd HH:mm:ss"
       */
      const convertFromUTC = (utcStr: string): string => {
        if (!utcStr) return utcStr;

        // 如果不是 UTC 格式（不带 Z），直接返回
        if (!utcStr.endsWith('Z') && !utcStr.includes('+')) {
          // 尝试解析为日期
          const date = new Date(utcStr);
          if (!isNaN(date.getTime())) {
            // 纯日期格式或本地时间格式，转换为 yyyy-MM-dd HH:mm:ss 格式
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          }
          return utcStr;
        }

        // UTC 格式，转换为本地时间
        const date = new Date(utcStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      const [
        site,
        author,
        cover,
        privacy,
        comment,
        notify,
        component,
        // upload,
        // email,
      ] = await Promise.all([
        configApi.getSiteConfig(),
        configApi.getAuthorConfig(),
        configApi.getCoverConfig(),
        configApi.getPrivacyConfig(),
        configApi.getCommentConfig(),
        configApi.getNotifyConfig(),
        configApi.getComponentConfig().catch(() => ({
          articleCommentEnabled: true,
          talkCommentEnabled: true,
          guestbookMessageEnabled: true
        })),
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
            // 特殊处理 createTime：从 UTC 转换为本地时间显示
            if (key === 'createTime' && typeof value === 'string' && value.trim()) {
              acc[key] = convertFromUTC(value.trim());
            } else {
              acc[key] = value;
            }
          }
          return acc;
        }, {} as any);
      };

      const normalizePrivacyConfig = (config: any) => ({
        showIp: normalizeBooleanValue(config?.showIp, defaultPrivacyConfig.showIp),
        showLocation: normalizeBooleanValue(config?.showLocation, defaultPrivacyConfig.showLocation),
        showDevice: normalizeBooleanValue(config?.showDevice, defaultPrivacyConfig.showDevice),
        showBrowser: normalizeBooleanValue(config?.showBrowser, defaultPrivacyConfig.showBrowser),
      });

      const normalizeBooleanConfig = (
        config: any,
        keys: string[],
        defaults: Record<string, boolean> = {}
      ) => {
        const processed = processConfig(config);
        keys.forEach((key) => {
          processed[key] = normalizeBooleanValue(processed[key], defaults[key] ?? false);
        });
        return processed;
      };

      const normalizeNestedVisibility = (group: any, keys: string[]) => {
        const source = group ?? {};
        const normalized = { ...source };
        keys.forEach((key) => {
          const item = source?.[key] ?? {};
          normalized[key] = {
            ...item,
            visible: normalizeBooleanValue(item?.visible, false),
          };
        });
        return normalized;
      };

      const normalizedPrivacy = normalizePrivacyConfig(privacy);
      const normalizedComment = normalizeBooleanConfig(comment, [
        "enabled",
        "needApproval",
        "allowAnonymous",
        "emailNotification",
      ]);
      const normalizedNotify = normalizeBooleanConfig(notify, [
        "loginNotify",
        "commentNotify",
        "replyNotify",
        "guestbookNotify",
        "friendLinkNotify",
      ]);
      const normalizedComponent = normalizeBooleanConfig(
        component,
        ["articleCommentEnabled", "talkCommentEnabled", "guestbookMessageEnabled"],
        {
          articleCommentEnabled: true,
          talkCommentEnabled: true,
          guestbookMessageEnabled: true,
        }
      );

      const normalizedAuthor = processConfig(author);
      normalizedAuthor.contactMethods = normalizeNestedVisibility(
        normalizedAuthor.contactMethods,
        ["email", "qq", "wechat"]
      );
      normalizedAuthor.socialLinks = normalizeNestedVisibility(
        normalizedAuthor.socialLinks,
        [
          "github",
          "gitee",
          "weibo",
          "zhihu",
          "bilibili",
          "twitter",
          "telegram",
          "facebook",
          "youtube",
        ]
      );

      siteForm.setFieldsValue(processConfig(site));
      authorForm.setFieldsValue(normalizedAuthor);
      coverForm.setFieldsValue(processConfig(cover));
      privacyForm.setFieldsValue(normalizedPrivacy);
      commentForm.setFieldsValue(normalizedComment);
      notifyForm.setFieldsValue(normalizedNotify);
      componentForm.setFieldsValue(normalizedComponent);
      
      // 保存原始值用于撤销
      setOriginalValues({
        site: processConfig(site),
        author: normalizedAuthor,
        cover: processConfig(cover),
        privacy: normalizedPrivacy,
        comment: normalizedComment,
        notify: normalizedNotify,
        component: normalizedComponent,
      });
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
  }: {
    type?: "cover" | "avatar" | "icon" | "logo";
    name: string;
    label: string;
  }) => {
    if (type === "avatar") {
      // 头像：使用圆形预设
      return (
        <Form.Item name={name} label={label}>
          <AvatarUpload width={100} height={100} />
        </Form.Item>
      );
    }

    if (type === "icon") {
      // 图标/Favicon：使用正方形预设，尺寸较小
      return (
        <Form.Item name={name} label={label}>
          <SquareUpload width={64} height={64} />
        </Form.Item>
      );
    }

    if (type === "logo") {
      // Logo：使用基础组件，完全自定义比例和内部提示
      return (
        <Form.Item name={name} label={label}>
          <ImageUpload
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
        <CoverUpload width={300} />
      </Form.Item>
    );
  };

  /**
   * 将本地时间字符串转换为 UTC ISO 格式（用于上传到数据库）
   *
   * ### 转换规则
   * - 输入：本地时间格式（如 "2025-01-25" 或 "2025-01-25 00:00:00"）
   * - 输出：UTC ISO 格式（如 "2025-01-24T16:00:00.000Z"）
   *
   * ### 示例（北京时间 UTC+8）
   * ```
   * "2025-01-25"           → "2025-01-24T16:00:00.000Z"
   * "2025-01-25 00:00:00"  → "2025-01-24T16:00:00.000Z"
   * ```
   *
   * ### 关键技术点
   * 纯日期格式的解析行为：
   * - `new Date("2025-01-25")` → 解析为 **UTC 时间** ❌
   * - `new Date("2025-01-25T00:00:00")` → 解析为 **本地时间** ✅
   *
   * 因此需要将纯日期格式转换为 ISO 8601 格式（添加 T00:00:00），才能正确解析为本地时间。
   *
   * ### 支持的输入格式
   * - 纯日期：`"2025-01-25"`
   * - 带时间：`"2025-01-25 00:00:00"`
   * - ISO格式：`"2025-01-25T00:00:00"`（已是 UTC）
   *
   * @param localTimeStr - 本地时间字符串
   * @returns UTC ISO 格式字符串 "yyyy-MM-ddTHH:mm:ss.sssZ"
   */
  const convertToUTC = (localTimeStr: string): string => {
    if (!localTimeStr) return localTimeStr;

    // 如果已经是 UTC 格式（带 Z），直接返回
    if (localTimeStr.endsWith('Z')) return localTimeStr;

    // 关键修复：纯日期格式需要特殊处理
    // new Date("2025-01-25") 会被解析为 UTC 时间，不是本地时间
    // new Date("2025-01-25T00:00:00") 会被解析为本地时间 ✅
    let inputToParse = localTimeStr;
    if (/^\d{4}-\d{2}-\d{2}$/.test(localTimeStr)) {
      // 纯日期格式：添加时间部分 T00:00:00，使其被解析为本地时间
      inputToParse = `${localTimeStr}T00:00:00`;
    } else if (!localTimeStr.includes('T')) {
      // 带空格的格式：2025-01-25 00:00:00 → 2025-01-25T00:00:00
      inputToParse = localTimeStr.replace(' ', 'T');
    }

    // 解析为本地时间
    const date = new Date(inputToParse);

    // 检查是否是有效日期
    if (isNaN(date.getTime())) return localTimeStr;

    // 转换为 UTC ISO 字符串
    return date.toISOString();
  };

  // 保存配置
  const handleSave = async (
    type: string,
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
          // 特殊处理 createTime：转换为 UTC 时间
          if (key === 'createTime' && typeof value === 'string' && value.trim()) {
            acc[key] = convertToUTC(value.trim());
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as any);

      await updateFn(processedValues);
      message.success("保存成功");
      clearTabUnsaved(type); // 保存成功后清除未保存标记

      // 更新原始值
      setOriginalValues(prev => ({
        ...prev,
        [type]: processedValues
      }));
    } catch (error) {
      console.error("保存失败", error);
      message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 撤销修改
  const handleUndo = () => {
    const formMap: Record<string, any> = {
      site: siteForm,
      author: authorForm,
      cover: coverForm,
      privacy: privacyForm,
      comment: commentForm,
      notify: notifyForm,
      component: componentForm,
    };
    
    const currentForm = formMap[activeTab];
    if (currentForm && originalValues[activeTab]) {
      currentForm.setFieldsValue(originalValues[activeTab]);
      clearTabUnsaved(activeTab);
      message.success("已撤销修改");
    }
  };

  const tabItems = [
    {
      key: "site",
      label: (
        <span>
          <GlobalOutlined /> 网站信息
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("site") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={siteForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("site")}
        >
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

        </Form>
      ),
    },
    {
      key: "author",
      label: (
        <span>
          <UserOutlined /> 作者信息
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("author") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={authorForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("author")}
        >
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


        </Form>
      ),
    },
    {
      key: "cover",
      label: (
        <span>
          <PictureOutlined /> 封面配置
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("cover") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={coverForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("cover")}
        >
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

        </Form>
      ),
    },
    {
      key: "privacy",
      label: (
        <span>
          <LockOutlined /> 隐私设置
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("privacy") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={privacyForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("privacy")}
        >
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

        </Form>
      ),
    },
    {
      key: "comment",
      label: (
        <span>
          <MessageOutlined /> 评论设置
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("comment") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={commentForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("comment")}
        >
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

        </Form>
      ),
    },
    {
      key: "notify",
      label: (
        <span>
          <BellOutlined /> 通知设置
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("notify") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={notifyForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("notify")}
        >
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

        </Form>
      ),
    },
    {
      key: "component",
      label: (
        <span>
          <AppstoreOutlined /> 组件设置
          <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
            {unsavedTabs.has("component") ? "●" : ""}
          </span>
        </span>
      ),
      children: (
        <Form 
          form={componentForm} 
          layout="vertical" 
          className="config-form"
          onValuesChange={() => markTabAsUnsaved("component")}
        >
          <Form.Item
            name="articleCommentEnabled"
            label="文章评论组件"
            valuePropName="checked"
            tooltip="是否在文章详情页显示评论组件"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="talkCommentEnabled"
            label="说说评论组件"
            valuePropName="checked"
            tooltip="是否在说说详情页显示评论组件"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="guestbookMessageEnabled"
            label="留言组件"
            valuePropName="checked"
            tooltip="是否在留言板显示留言组件"
          >
            <Switch />
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

  // 获取当前标签页对应的保存函数
  const getSaveHandler = () => {
    const handlers: Record<string, () => void> = {
      site: () => handleSave("site", siteForm, configApi.updateSiteConfig),
      author: () => handleSave("author", authorForm, configApi.updateAuthorConfig),
      cover: () => handleSave("cover", coverForm, configApi.updateCoverConfig),
      privacy: () => handleSave("privacy", privacyForm, configApi.updatePrivacyConfig),
      comment: () => handleSave("comment", commentForm, configApi.updateCommentConfig),
      notify: () => handleSave("notify", notifyForm, configApi.updateNotifyConfig),
      component: () => handleSave("component", componentForm, configApi.updateComponentConfig),
    };
    return handlers[activeTab];
  };

  return (
    <div className="page-container">
      <div className="search-bar">
        <h2 className="text-lg font-medium">系统配置</h2>
      </div>
      <Card className="chart-card config-card-wrapper">
        <Spin spinning={loading}>
          <div className="tabs-wrapper">
            <Tabs
              className="config-tabs"
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              tabPosition="left"
            />
            
            {/* 固定在标签页内容区域右下角的操作按钮 */}
            {unsavedTabs.has(activeTab) && (
              <div className="fixed-action-buttons">
                <Button
                  size="large"
                  icon={<UndoOutlined />}
                  onClick={handleUndo}
                >
                  撤销
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={getSaveHandler()}
                >
                  保存
                </Button>
              </div>
            )}
          </div>
        </Spin>
      </Card>

      <style>{`
        .config-card-wrapper {
          position: relative;
        }
        
        .tabs-wrapper {
          position: relative;
          height: calc(100vh - 280px);
          min-height: 400px;
        }
        
        .config-tabs {
          height: 100%;
        }
        .config-tabs .ant-tabs-nav {
          overflow-y: auto;
        }
        .config-tabs .ant-tabs-content-holder {
          overflow-y: auto;
          position: relative;
        }
        .config-form { 
          max-width: 600px; 
          padding-left: 24px;
          padding-bottom: 100px;
        }
        .config-form .ant-form-item { margin-bottom: 16px; }
        
        .fixed-action-buttons {
          position: absolute;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .fixed-action-buttons .ant-btn {
          height: 48px;
          padding: 0 32px;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          width: 120px;
        }
      `}</style>
    </div>
  );
};

export default ConfigPage;
