import { Form, Input } from "antd";
import { ImageField } from "./shared";
import type { ConfigTabFormProps } from "./shared";

const { TextArea } = Input;

/** 网站信息页签 */
const SiteConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default SiteConfigForm;
