import { Form, Switch } from "antd";
import type { ConfigTabFormProps } from "./shared";

/** 隐私设置页签 */
const PrivacyConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default PrivacyConfigForm;
