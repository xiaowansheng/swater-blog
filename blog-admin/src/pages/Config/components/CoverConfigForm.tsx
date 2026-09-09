import { Form } from "antd";
import { ImageField } from "./shared";
import type { ConfigTabFormProps } from "./shared";

/** 封面配置页签 */
const CoverConfigForm: React.FC<ConfigTabFormProps> = ({ form, onValuesChange }) => (
  <Form
    form={form}
    layout="vertical"
    className="config-form"
    onValuesChange={onValuesChange}
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
);

export default CoverConfigForm;
