import { Form, Input, Switch, Divider } from "antd";
import { ImageField } from "./shared";
import type { ConfigTabFormProps } from "./shared";

const { TextArea } = Input;

/** 作者信息页签 */
const AuthorConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default AuthorConfigForm;
