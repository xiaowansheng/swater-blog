/**
 * 配置页共享的组件、类型与常量
 */
import { Form } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import {
  ImageUpload,
  CoverUpload,
  AvatarUpload,
  SquareUpload
} from "@/components/common/ImageUpload";
import type { FormInstance } from "antd";
import type { NamePath } from "antd/es/form/interface";

/** 各配置页签表单组件的公共 Props */
export interface ConfigTabFormProps {
  form: FormInstance;
  onValuesChange: () => void;
}

/** 图片字段组件 - 根据业务需求选择合适的上传组件 */
export const ImageField = ({
  type = "cover",
  name,
  label,
}: {
  type?: "cover" | "avatar" | "icon" | "logo";
  name: NamePath;
  label: string;
}) => {
  if (type === "avatar") {
    // 头像：使用圆形预设
    return (
      <Form.Item name={name} label={label}>
        <AvatarUpload width={100} height={100} />
      </Form.Item>
    );
  }

  if (type === "icon") {
    // 图标/Favicon：使用正方形预设，尺寸较小
    return (
      <Form.Item name={name} label={label}>
        <SquareUpload width={64} height={64} />
      </Form.Item>
    );
  }

  if (type === "logo") {
    // Logo：使用基础组件，完全自定义比例和内部提示
    return (
      <Form.Item name={name} label={label}>
        <ImageUpload
          width={240}
          height={80}
          aspectRatio="any"
        >
          <div className="flex flex-col items-center">
            <PictureOutlined className="mb-2 text-2xl text-gray-300" />
            <span className="text-xs font-medium text-gray-400">上传网站 Logo</span>
            <span className="mt-1 text-[10px] text-gray-300">建议高度 60px</span>
          </div>
        </ImageUpload>
      </Form.Item>
    );
  }

  // 默认封面：使用封面预设 (16:9)
  return (
    <Form.Item name={name} label={label}>
      <CoverUpload width={300} />
    </Form.Item>
  );
};

/** 标签页标题：图标 + 文本 + 未保存红点 */
export const TabLabel = ({
  icon,
  text,
  unsaved,
}: {
  icon: React.ReactNode;
  text: string;
  unsaved: boolean;
}) => (
  <span>
    {icon} {text}
    <span style={{ color: "#ff4d4f", marginLeft: "8px", display: "inline-block", width: "12px" }}>
      {unsaved ? "●" : ""}
    </span>
  </span>
);
