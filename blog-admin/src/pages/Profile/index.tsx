import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Descriptions, Avatar, Space, Divider, Tabs } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  QqOutlined,
  EditOutlined,
  SaveOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { AvatarUpload } from "@/components/common/ImageUpload";
import { getFullUrl } from "@/utils/format";
import * as userApi from "@/api/user";
import { EnableStatus } from "@/types/enums";

const { TextArea } = Input;

interface ProfileFormData {
  nickname: string;
  avatar: string;
  phone?: string;
  qq?: string;
  signature?: string;
  website?: string;
  introduction?: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, getCurrentUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        nickname: user.nickname || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
        qq: user.qq || "",
        signature: user.signature || "",
        website: user.website || "",
        introduction: user.introduction || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  const handleRefreshUserInfo = async () => {
    setLoading(true);
    try {
      await getCurrentUser();
      message.success("刷新成功");
    } catch (error) {
      console.error("刷新用户信息失败", error);
      message.error("刷新用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const values = await profileForm.validateFields();
      await userApi.updateCurrentUser(values as ProfileFormData);
      await getCurrentUser();
      message.success("更新成功");
      setActiveTab("view");
    } catch (error) {
      console.error("更新失败", error);
      message.error("更新失败");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      profileForm.setFieldsValue({
        nickname: user.nickname || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
        qq: user.qq || "",
        signature: user.signature || "",
        website: user.website || "",
        introduction: user.introduction || "",
        email: user.email || "",
      });
    }
    setActiveTab("view");
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setChangingPassword(true);

      await userApi.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("密码修改成功，请重新登录");
      passwordForm.resetFields();

      // 延迟1.5秒后登出，让用户看到成功提示
      setTimeout(async () => {
        const { logout } = useAuthStore.getState();
        await logout();
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error("修改密码失败", error);
      if (error?.errorFields) {
        // 表单验证错误，不显示message
        return;
      }
      message.error(error?.message || "修改密码失败");
    } finally {
      setChangingPassword(false);
    }
  };

  const viewTabContent = (
    <div className="max-w-3xl">
      <div className="flex items-center gap-6 mb-6">
        <Avatar
          src={getFullUrl(user?.avatar)}
          icon={<UserOutlined />}
          size={100}
          className="bg-blue-500"
        />
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-2">{user?.nickname || user?.username}</h2>
          <p className="text-gray-500 mb-1">@{user?.username}</p>
          {user?.signature && <p className="text-gray-600 text-sm">{user.signature}</p>}
        </div>
      </div>

      <Divider />

      <Descriptions title="基本信息" column={1} bordered>
        <Descriptions.Item label={<><UserOutlined className="mr-2" />用户名</>}>
          {user?.username}
        </Descriptions.Item>
        <Descriptions.Item label={<><MailOutlined className="mr-2" />邮箱</>}>
          {user?.email}
        </Descriptions.Item>
        <Descriptions.Item label={<><PhoneOutlined className="mr-2" />手机号</>}>
          {user?.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={<><QqOutlined className="mr-2" />QQ</>}>
          {user?.qq || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={<><GlobalOutlined className="mr-2" />个人网站</>}>
          {user?.website ? (
            <a href={user.website} target="_blank" rel="noopener noreferrer">
              {user.website}
            </a>
          ) : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="个人简介">
          {user?.introduction || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="角色">
          {user?.roles?.map((role) => role.name).join("、") || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {user?.status === EnableStatus.ENABLED ? (
            <span className="text-green-600">正常</span>
          ) : (
            <span className="text-red-600">禁用</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="最后登录时间">
          {user?.lastLoginTime || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="最后登录IP">
          {user?.lastLoginIp || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {user?.createTime || "-"}
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-6">
        <Button type="primary" icon={<EditOutlined />} onClick={() => setActiveTab("edit")}>
          编辑资料
        </Button>
        <Button className="ml-3" loading={loading} onClick={handleRefreshUserInfo}>
          刷新信息
        </Button>
      </div>
    </div>
  );

  const editTabContent = (
    <div className="max-w-2xl">
      <Form
        form={profileForm}
        layout="vertical"
        className="profile-form"
      >
        <Form.Item name="avatar" label="头像">
          <AvatarUpload width={120} height={120} />
        </Form.Item>

        <Form.Item
          name="nickname"
          label="昵称"
          rules={[{ required: true, message: "请输入昵称" }]}
        >
          <Input placeholder="请输入昵称" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "请输入有效的邮箱地址" },
          ]}
        >
          <Input placeholder="请输入邮箱" prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item name="phone" label="手机号">
          <Input placeholder="请输入手机号" prefix={<PhoneOutlined />} />
        </Form.Item>

        <Form.Item name="qq" label="QQ">
          <Input placeholder="请输入QQ号" prefix={<QqOutlined />} />
        </Form.Item>

        <Form.Item name="website" label="个人网站">
          <Input placeholder="请输入个人网站地址" prefix={<GlobalOutlined />} />
        </Form.Item>

        <Form.Item name="signature" label="个性签名">
          <Input placeholder="一句话介绍自己" />
        </Form.Item>

        <Form.Item name="introduction" label="个人简介">
          <TextArea rows={4} placeholder="详细的自我介绍" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              onClick={handleUpdateProfile}
            >
              保存修改
            </Button>
            <Button onClick={handleCancelEdit}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  const passwordTabContent = (
    <div className="max-w-xl">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          <LockOutlined className="mr-2" />
          为了您的账户安全，修改密码后需要重新登录。
        </p>
      </div>

      <Form
        form={passwordForm}
        layout="vertical"
        className="password-form"
      >
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[
            { required: true, message: "请输入当前密码" },
          ]}
        >
          <Input.Password
            placeholder="请输入当前密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码长度至少6位" },
          ]}
        >
          <Input.Password
            placeholder="请输入新密码（至少6位）"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: "请再次输入新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="请再次输入新密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={changingPassword}
            onClick={handleChangePassword}
            danger
          >
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const tabItems = [
    {
      key: "view",
      label: "查看资料",
      children: viewTabContent,
    },
    {
      key: "edit",
      label: "编辑资料",
      children: editTabContent,
    },
    {
      key: "password",
      label: "修改密码",
      children: passwordTabContent,
    },
  ];

  return (
    <div className="page-container">
      <div className="search-bar">
        <h2 className="text-lg font-medium">个人中心</h2>
      </div>
      <Card className="chart-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="profile-tabs"
        />
      </Card>
      <style>{`
        .profile-tabs .ant-tabs-nav {
          margin-bottom: 24px;
        }
        .profile-form { padding: 16px 0; }
        .profile-form .ant-form-item { margin-bottom: 20px; }
        .password-form { padding: 16px 0; }
        .password-form .ant-form-item { margin-bottom: 20px; }
        .ant-descriptions-item-label {
          width: 140px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
