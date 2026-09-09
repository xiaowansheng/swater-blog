import { Form, Switch } from "antd";
import type { ConfigTabFormProps } from "./shared";

/** 组件设置页签 */
const ComponentConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default ComponentConfigForm;
