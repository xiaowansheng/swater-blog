import { Form, Switch } from "antd";
import type { ConfigTabFormProps } from "./shared";

/** 通知设置页签 */
const NotifyConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default NotifyConfigForm;
