import { Form, Input, Switch, InputNumber } from "antd";
import type { ConfigTabFormProps } from "./shared";

const { TextArea } = Input;

/** 评论设置页签 */
const CommentConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default CommentConfigForm;
