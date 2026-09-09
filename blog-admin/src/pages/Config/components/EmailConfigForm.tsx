import { Form, Input, Switch, InputNumber, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";

interface EmailConfigFormProps {
  form: FormInstance;
  saving: boolean;
  onSave: () => void;
}

/** 邮件设置页签 */
const EmailConfigForm: React.FC<EmailConfigFormProps> = ({ form, saving, onSave }) => (
  <Form form={form} layout="vertical" className="config-form">
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
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={saving}
        onClick={onSave}
      >
        保存
      </Button>
    </Form.Item>
  </Form>
);

export default EmailConfigForm;
