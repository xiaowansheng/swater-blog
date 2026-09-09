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
 * 本文件负责状态编排、数据加载与保存逻辑；各页签的表单 UI 拆分至 ./components/ 下。
 *
 * @author Claude Code
 * @since 2025-01-28
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  message,
  Form,
  Tabs,
  Card,
  Button,
  Spin,
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
  ApiOutlined,
  HeartOutlined,
  CloudUploadOutlined,
  MailOutlined,
} from "@ant-design/icons";
import * as configApi from "@/api/config";
import type { FormInstance } from "antd";
import { convertFromUTC, convertToUTC } from "@/utils/format";
import WebhookConfigTab from "@/components/config/WebhookConfig";
import SiteConfigForm from "./components/SiteConfigForm";
import AuthorConfigForm from "./components/AuthorConfigForm";
import CoverConfigForm from "./components/CoverConfigForm";
import PrivacyConfigForm from "./components/PrivacyConfigForm";
import CommentConfigForm from "./components/CommentConfigForm";
import NotifyConfigForm from "./components/NotifyConfigForm";
import ComponentConfigForm from "./components/ComponentConfigForm";
import RewardConfigForm from "./components/RewardConfigForm";
import UploadConfigForm from "./components/UploadConfigForm";
import EmailConfigForm from "./components/EmailConfigForm";
import { TabLabel } from "./components/shared";

const ConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("site");
  const [unsavedTabs, setUnsavedTabs] = useState<Set<string>>(new Set());
  const [originalValues, setOriginalValues] = useState<Record<string, unknown>>({});

  const defaultPrivacyConfig = useMemo(() => ({
    showIp: false,
    showLocation: true,
    showDevice: false,
    showBrowser: false,
  }), []);

  const normalizeBooleanValue = useCallback((value: unknown, defaultValue = false): boolean => {
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
  }, []);

  const [siteForm] = Form.useForm();
  const [authorForm] = Form.useForm();
  const [coverForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const [componentForm] = Form.useForm();
  const [rewardForm] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [emailForm] = Form.useForm();

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

  const loadAllConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const [
        site,
        author,
        cover,
        privacy,
        comment,
        notify,
        component,
        reward,
        upload,
        email,
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
        configApi.getRewardConfig(),
        configApi.getUploadConfig(),
        configApi.getEmailConfig(),
      ]);

      // 处理配置数据：将null和undefined转换为合适的默认值
      const processConfig = (config: unknown): Record<string, unknown> => {
        if (!config) return {};
        const source = config as Record<string, unknown>;
        return Object.keys(source).reduce<Record<string, unknown>>((acc, key) => {
          const value = source[key];
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
        }, {});
      };

      const normalizePrivacyConfig = (config: unknown) => {
        const source = (config ?? {}) as Record<string, unknown>;
        return {
          showIp: normalizeBooleanValue(source.showIp, defaultPrivacyConfig.showIp),
          showLocation: normalizeBooleanValue(source.showLocation, defaultPrivacyConfig.showLocation),
          showDevice: normalizeBooleanValue(source.showDevice, defaultPrivacyConfig.showDevice),
          showBrowser: normalizeBooleanValue(source.showBrowser, defaultPrivacyConfig.showBrowser),
        };
      };

      const normalizeBooleanConfig = (
        config: unknown,
        keys: string[],
        defaults: Record<string, boolean> = {}
      ) => {
        const processed = processConfig(config);
        keys.forEach((key) => {
          processed[key] = normalizeBooleanValue(processed[key], defaults[key] ?? false);
        });
        return processed;
      };

      const normalizeNestedVisibility = (group: unknown, keys: string[]) => {
        const source = (group ?? {}) as Record<string, unknown>;
        const normalized = { ...source };
        keys.forEach((key) => {
          const item = (source?.[key] ?? {}) as Record<string, unknown>;
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

      const normalizedReward = processConfig(reward);
      normalizedReward.rewardEnabled = normalizeBooleanValue(reward?.rewardEnabled, true);

      const wechatConfig = processConfig(reward?.wechat);
      (wechatConfig as { enabled?: boolean }).enabled = normalizeBooleanValue(reward?.wechat?.enabled, true);
      normalizedReward.wechat = wechatConfig;

      const alipayConfig = processConfig(reward?.alipay);
      (alipayConfig as { enabled?: boolean }).enabled = normalizeBooleanValue(reward?.alipay?.enabled, true);
      normalizedReward.alipay = alipayConfig;

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
      rewardForm.setFieldsValue(normalizedReward);

      // 保存原始值用于撤销
      setOriginalValues({
        site: processConfig(site),
        author: normalizedAuthor,
        cover: processConfig(cover),
        privacy: normalizedPrivacy,
        comment: normalizedComment,
        notify: normalizedNotify,
        component: normalizedComponent,
        reward: normalizedReward,
      });
      uploadForm.setFieldsValue(upload);
      emailForm.setFieldsValue(email);
    } catch (error) {
      console.error("加载配置失败", error);
      message.error("加载配置失败");
    } finally {
      setLoading(false);
    }
  }, [siteForm, authorForm, coverForm, privacyForm, commentForm, notifyForm, componentForm, rewardForm, uploadForm, emailForm, normalizeBooleanValue, defaultPrivacyConfig]);

  useEffect(() => {
    loadAllConfigs();
  }, [loadAllConfigs]);

  // 保存配置
  const handleSave = async <T,>(
    type: string,
    form: FormInstance,
    updateFn: (data: T) => Promise<void>
  ) => {
    setSaving(true);
    try {
      const values = await form.validateFields();

      // 处理表单数据：确保嵌套对象被正确初始化
      const processedValues = Object.keys(values).reduce<Record<string, unknown>>((acc, key) => {
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
      }, {});

      await updateFn(processedValues as T);
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
    const formMap: Record<string, FormInstance> = {
      site: siteForm,
      author: authorForm,
      cover: coverForm,
      privacy: privacyForm,
      comment: commentForm,
      notify: notifyForm,
      component: componentForm,
      reward: rewardForm,
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
        <TabLabel icon={<GlobalOutlined />} text="网站信息" unsaved={unsavedTabs.has("site")} />
      ),
      children: (
        <SiteConfigForm
          form={siteForm}
          onValuesChange={() => markTabAsUnsaved("site")}
        />
      ),
    },
    {
      key: "author",
      label: (
        <TabLabel icon={<UserOutlined />} text="作者信息" unsaved={unsavedTabs.has("author")} />
      ),
      children: (
        <AuthorConfigForm
          form={authorForm}
          onValuesChange={() => markTabAsUnsaved("author")}
        />
      ),
    },
    {
      key: "cover",
      label: (
        <TabLabel icon={<PictureOutlined />} text="封面配置" unsaved={unsavedTabs.has("cover")} />
      ),
      children: (
        <CoverConfigForm
          form={coverForm}
          onValuesChange={() => markTabAsUnsaved("cover")}
        />
      ),
    },
    {
      key: "privacy",
      label: (
        <TabLabel icon={<LockOutlined />} text="隐私设置" unsaved={unsavedTabs.has("privacy")} />
      ),
      children: (
        <PrivacyConfigForm
          form={privacyForm}
          onValuesChange={() => markTabAsUnsaved("privacy")}
        />
      ),
    },
    {
      key: "comment",
      label: (
        <TabLabel icon={<MessageOutlined />} text="评论设置" unsaved={unsavedTabs.has("comment")} />
      ),
      children: (
        <CommentConfigForm
          form={commentForm}
          onValuesChange={() => markTabAsUnsaved("comment")}
        />
      ),
    },
    {
      key: "notify",
      label: (
        <TabLabel icon={<BellOutlined />} text="通知设置" unsaved={unsavedTabs.has("notify")} />
      ),
      children: (
        <NotifyConfigForm
          form={notifyForm}
          onValuesChange={() => markTabAsUnsaved("notify")}
        />
      ),
    },
    {
      key: "component",
      label: (
        <TabLabel icon={<AppstoreOutlined />} text="组件设置" unsaved={unsavedTabs.has("component")} />
      ),
      children: (
        <ComponentConfigForm
          form={componentForm}
          onValuesChange={() => markTabAsUnsaved("component")}
        />
      ),
    },
    {
      key: "reward",
      label: (
        <TabLabel icon={<HeartOutlined />} text="赞赏配置" unsaved={unsavedTabs.has("reward")} />
      ),
      children: (
        <RewardConfigForm
          form={rewardForm}
          onValuesChange={() => markTabAsUnsaved("reward")}
        />
      ),
    },
    {
      key: "upload",
      label: (
        <span>
          <CloudUploadOutlined /> 上传设置
        </span>
      ),
      children: (
        <UploadConfigForm
          form={uploadForm}
          saving={saving}
          onSave={() => handleSave("upload", uploadForm, configApi.updateUploadConfig)}
        />
      ),
    },
    {
      key: "email",
      label: (
        <span>
          <MailOutlined /> 邮件设置
        </span>
      ),
      children: (
        <EmailConfigForm
          form={emailForm}
          saving={saving}
          onSave={() => handleSave("email", emailForm, configApi.updateEmailConfig)}
        />
      ),
    },
    {
      key: "webhook",
      label: (
        <TabLabel icon={<ApiOutlined />} text="Webhook" unsaved={unsavedTabs.has("webhook")} />
      ),
      children: <WebhookConfigTab />,
    },
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
      reward: () => handleSave("reward", rewardForm, configApi.updateRewardConfig),
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
