import { Form, Switch } from "antd";
import { ImageField } from "./shared";
import type { ConfigTabFormProps } from "./shared";

/** 赞赏配置页签 */
const RewardConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
  >
    <Form.Item
      name="rewardEnabled"
      label="启用打赏功能"
      valuePropName="checked"
      tooltip="是否在文章底部显示打赏按钮"
    >
      <Switch />
    </Form.Item>
    <Form.Item
      name={["wechat", "enabled"]}
      label="启用微信打赏"
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>
    <ImageField name={["wechat", "qr"]} label="微信赞赏码" type="cover" />
    <Form.Item
      name={["alipay", "enabled"]}
      label="启用支付宝打赏"
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>
    <ImageField name={["alipay", "qr"]} label="支付宝收款码" type="cover" />
  </Form>
);

export default RewardConfigForm;
