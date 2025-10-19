import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Space, 
  Form, 
  message, 
  Row, 
  Col, 
  Spin, 
  Input, 
  Select, 
  Upload, 
  Switch, 
  Divider,
  Avatar
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  UserOutlined,
  UploadOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { User, UserFormData, DEPARTMENTS } from '../../types';
import UserService from '../../services/user';
import AuthService from '../../services/auth';
import { useNavigate, useParams } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const currentUser = AuthService.getCurrentUser();
  const isEdit = !!id;
  const isOwnProfile = currentUser?.id === id;

  // Permission checks
  const canManageUsers = (): boolean => {
    return currentUser?.permissions?.includes('manage_users') || false;
  };

  const canEditUser = (): boolean => {
    if (isOwnProfile) return true; // Can edit own profile
    return canManageUsers();
  };

  // Load user data for editing
  const loadUser = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await UserService.getUser(id);
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setAvatarPreview(userData.avatar_url || '');
        
        // Set form values
        form.setFieldsValue({
          name: userData.name,
          email: userData.email,
          department: userData.department,
          position: userData.position,
          phone: userData.phone,
          bio: userData.bio,
          status: userData.status,
          permissions: userData.permissions || [],
        });
      } else {
        message.error(response.message || 'Failed to load user');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      message.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: UserFormData) => {
    try {
      setSubmitting(true);
      
      let response;
      
      if (isEdit) {
        // Update existing user
        const updateData: Partial<UserFormData> = { ...values };
        
        // Remove password fields if they're empty (for edit mode)
        if (!updateData.password) {
          delete updateData.password;
          delete updateData.password_confirmation;
        }
        
        // If editing own profile, limit what can be changed
        if (isOwnProfile) {
          delete updateData.department;
          delete updateData.status;
          delete updateData.permissions;
        }
        
        response = await UserService.updateUser(id!, updateData);
      } else {
        // Create new user
        response = await UserService.createUser(values);
      }
      
      if (response.success) {
        message.success(`User ${isEdit ? 'updated' : 'created'} successfully`);
        
        // Handle avatar upload if there's a file
        if (avatarFile && response.data) {
          try {
            await UserService.uploadAvatar(avatarFile);
            message.success('Avatar uploaded successfully');
          } catch (error) {
            console.error('Error uploading avatar:', error);
            message.warning('User saved but avatar upload failed');
          }
        }
        
        navigate(isEdit ? `/users/${id}` : '/users');
      } else {
        message.error(response.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} user:`, error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle avatar file change
  const handleAvatarChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return;
      }
      
      // Validate file size (max 2MB)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (isEdit) {
      loadUser();
    } else {
      // Set default values for new user
      form.setFieldsValue({
        status: 'active',
        department: currentUser?.department || '',
      });
    }
  }, [id, isEdit, form, currentUser]);

  // Available permissions
  const availablePermissions = [
    'manage_users',
    'manage_products',
    'manage_documents',
    'manage_batches',
    'manage_alerts',
    'manage_departments',
    'view_dashboard',
    'export_data',
    'import_data',
    'system_settings'
  ];

  if (!canEditUser()) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={3}>Access Denied</Title>
        <p>You don't have permission to {isEdit ? 'edit this user' : 'create users'}.</p>
        <Button onClick={() => navigate('/users')}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div>
      <Spin spinning={loading}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(isEdit ? `/users/${id}` : '/users')}
              >
                {isEdit ? 'Back to Profile' : 'Back to Users'}
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                <Space>
                  <UserOutlined />
                  {isEdit ? `Edit ${isOwnProfile ? 'Profile' : 'User'}` : 'Create New User'}
                </Space>
              </Title>
            </Space>
          </Col>
        </Row>

        {/* Form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'active'
            }}
          >
            <Row gutter={24}>
              {/* Avatar Section */}
              <Col span={6}>
                <Card title="Avatar" size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      src={avatarPreview} 
                      icon={<UserOutlined />}
                      size={120}
                      style={{ marginBottom: 16 }}
                    />
                    <div>
                      <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleAvatarChange}
                        accept="image/*"
                      >
                        <Button icon={<UploadOutlined />} size="small">
                          {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                        </Button>
                      </Upload>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Main Form */}
              <Col span={18}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please enter full name' }]}
                    >
                      <Input placeholder="Enter full name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter email address' },
                        { type: 'email', message: 'Please enter a valid email address' }
                      ]}
                    >
                      <Input placeholder="user@company.com" disabled={isEdit} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="department"
                      label="Department"
                      rules={[{ required: true, message: 'Please select department' }]}
                    >
                      <Select 
                        placeholder="Select department"
                        disabled={isOwnProfile} // Can't change own department
                      >
                        {Object.entries(DEPARTMENTS).map(([code, name]) => (
                          <Option key={code} value={code}>
                            {name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="position"
                      label="Position/Title"
                    >
                      <Input placeholder="Job title or position" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                    >
                      <Input placeholder="Phone number" />
                    </Form.Item>
                  </Col>
                  {!isEdit && (
                    <Col span={12}>
                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                          { required: !isEdit, message: 'Please enter password' },
                          { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                      >
                        <Input.Password
                          placeholder="Enter password"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>

                {!isEdit && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="password_confirmation"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                          { required: !isEdit, message: 'Please confirm password' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Passwords do not match!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          placeholder="Confirm password"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {isEdit && !isOwnProfile && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="password"
                        label="New Password (optional)"
                        rules={[
                          { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                      >
                        <Input.Password
                          placeholder="Leave blank to keep current password"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="password_confirmation"
                        label="Confirm New Password"
                        dependencies={['password']}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const password = getFieldValue('password');
                              if (!password || !value || password === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Passwords do not match!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          placeholder="Confirm new password"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Form.Item
                  name="bio"
                  label="Bio"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Brief description about the user..."
                  />
                </Form.Item>

                {!isOwnProfile && canManageUsers() && (
                  <>
                    <Divider />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="status"
                          label="Status"
                          valuePropName="checked"
                        >
                          <Switch 
                            checkedChildren="Active" 
                            unCheckedChildren="Inactive"
                            checked={form.getFieldValue('status') === 'active'}
                            onChange={(checked) => form.setFieldsValue({ status: checked ? 'active' : 'inactive' })}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="permissions"
                      label="Permissions"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select permissions"
                        style={{ width: '100%' }}
                      >
                        {availablePermissions.map(permission => (
                          <Option key={permission} value={permission}>
                            {permission.replace('_', ' ').toUpperCase()}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>
                )}
              </Col>
            </Row>

            {/* Form Actions */}
            <Divider />
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={() => navigate(isEdit ? `/users/${id}` : '/users')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  {isEdit ? 'Update User' : 'Create User'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default UserForm;