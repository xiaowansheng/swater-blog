import { Form, Input, Switch, InputNumber, Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";

interface UploadConfigFormProps {
  form: FormInstance;
  saving: boolean;
  onSave: () => void;
}

/** 上传设置页签 */
const UploadConfigForm: React.FC<UploadConfigFormProps> = ({ form, saving, onSave }) => (
  <Form form={form} layout="vertical" className="config-form">
    <Form.Item
      name="maxSize"
      label="文件大小限制(字节)"
      tooltip="默认10MB = 10485760字节"
    >
      <InputNumber min={1048576} max={104857600} style={{ width: 200 }} />
    </Form.Item>
    <Form.Item
      name="allowedTypes"
      label="允许的文件类型"
      tooltip="多个类型用逗号分隔"
    >
      <Input placeholder="jpg,jpeg,png,gif,webp,pdf" />
    </Form.Item>
    <Form.Item
      name="imageCompress"
      label="图片自动压缩"
      valuePropName="checked"
    >
      <Switch />
    </Form.Item>
    <Form.Item name="imageQuality" label="压缩质量(1-100)">
      <InputNumber min={1} max={100} />
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

export default UploadConfigForm;
