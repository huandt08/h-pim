import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Space, 
  Modal, 
  Form, 
  message, 
  Tag, 
  Row, 
  Col, 
  Spin, 
  Tooltip, 
  Popconfirm, 
  Descriptions, 
  Timeline, 
  Avatar, 
  Table, 
  Input, 
  Select, 
  Upload, 
  Badge,
  Divider,
  Tabs,
  Empty,
  Switch
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  TeamOutlined, 
  ClockCircleOutlined, 
  UploadOutlined, 
  KeyOutlined, 
  LockOutlined,
  UnlockOutlined,
  SendOutlined,
  SafetyOutlined,
  HistoryOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { User, DEPARTMENTS } from '../../types';
import UserService from '../../services/user';
import AuthService from '../../services/auth';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [passwordResetModalVisible, setPasswordResetModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [permissionsForm] = Form.useForm();
  const currentUser = AuthService.getCurrentUser();

  // Permission checks
  const canEditUser = (): boolean => {
    if (!user || !currentUser) return false;
    if (currentUser.id === user.id) return true; // Can edit own profile
    return currentUser.permissions?.includes('manage_users') || false;
  };

  const canDeleteUser = (): boolean => {
    if (!user || !currentUser) return false;
    if (currentUser.id === user.id) return false; // Cannot delete own account
    return currentUser.permissions?.includes('manage_users') || false;
  };

  const canManagePermissions = (): boolean => {
    if (!user || !currentUser) return false;
    if (currentUser.id === user.id) return false; // Cannot manage own permissions
    return currentUser.permissions?.includes('manage_users') || false;
  };

  const isOwnProfile = (): boolean => {
    return currentUser?.id === user?.id;
  };

  // Load user data
  const loadUser = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await UserService.getUser(id);
      
      if (response.success && response.data) {
        setUser(response.data);
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

  // Load user activities
  const loadUserActivities = async () => {
    if (!id) return;
    
    try {
      const response = await UserService.getUserActivities(id);
      if (response.success && response.data) {
        setUserActivities(response.data);
      }
    } catch (error) {
      console.error('Error loading user activities:', error);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async () => {
    if (!user) return;
    
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const response = await UserService.updateUserStatus(user.id, newStatus);
      
      if (response.success) {
        message.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        setUser({ ...user, status: newStatus });
      } else {
        message.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Failed to update user status');
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user) return;
    
    try {
      const response = await UserService.resetPassword(user.id);
      
      if (response.success) {
        Modal.info({
          title: 'Password Reset',
          content: (
            <div>
              <p>A temporary password has been generated for {user.name}:</p>
              <p style={{ fontWeight: 'bold', fontSize: 16, color: '#1890ff' }}>
                {response.data?.temporary_password}
              </p>
              <p style={{ color: '#666' }}>Please share this with the user securely. They will be required to change it on next login.</p>
            </div>
          ),
        });
        setPasswordResetModalVisible(false);
      } else {
        message.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Failed to reset password');
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async () => {
    if (!user) return;
    
    try {
      const response = await UserService.resendInvitation(user.id);
      
      if (response.success) {
        message.success('Invitation sent successfully');
      } else {
        message.error(response.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      message.error('Failed to send invitation');
    }
  };

  // Handle department assignment
  const handleDepartmentChange = async (department: string) => {
    if (!user) return;
    
    try {
      const response = await UserService.assignToDepartment(user.id, department);
      
      if (response.success) {
        message.success('Department updated successfully');
        setUser({ ...user, department });
      } else {
        message.error(response.message || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      message.error('Failed to update department');
    }
  };

  // Handle permissions update
  const handlePermissionsUpdate = async (values: { permissions: string[] }) => {
    if (!user) return;
    
    try {
      const response = await UserService.updateUserPermissions(user.id, values.permissions);
      
      if (response.success) {
        message.success('Permissions updated successfully');
        setUser({ ...user, permissions: values.permissions });
        setPermissionsModalVisible(false);
        permissionsForm.resetFields();
      } else {
        message.error(response.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      message.error('Failed to update permissions');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user) return;
    
    try {
      const response = await UserService.deleteUser(user.id);
      if (response.success) {
        message.success('User deleted successfully');
        navigate('/users');
      } else {
        message.error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  // Activity columns
  const activityColumns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

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

  // Load data on component mount
  useEffect(() => {
    if (id) {
      loadUser();
      loadUserActivities();
    }
  }, [id]);

  // Set permissions form values when user loads
  useEffect(() => {
    if (user && permissionsModalVisible) {
      permissionsForm.setFieldsValue({
        permissions: user.permissions || []
      });
    }
  }, [user, permissionsModalVisible, permissionsForm]);

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
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
                onClick={() => navigate('/users')}
              >
                Back to Users
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                <Space>
                  <Avatar 
                    src={user.avatar_url} 
                    icon={<UserOutlined />}
                    size="large"
                  />
                  {user.name}
                </Space>
              </Title>
              <Badge 
                status={user.status === 'active' ? 'success' : 'error'} 
                text={user.status === 'active' ? 'Active' : 'Inactive'}
              />
            </Space>
          </Col>
          <Col>
            <Space>
              {canEditUser() && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/users/${id}/edit`)}
                >
                  Edit
                </Button>
              )}
              {canManagePermissions() && (
                <>
                  <Button 
                    icon={user.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                    onClick={handleStatusToggle}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    icon={<KeyOutlined />}
                    onClick={() => setPasswordResetModalVisible(true)}
                  >
                    Reset Password
                  </Button>
                  {user.status === 'inactive' && user.email_verified_at === null && (
                    <Button 
                      icon={<SendOutlined />}
                      onClick={handleResendInvitation}
                    >
                      Resend Invitation
                    </Button>
                  )}
                </>
              )}
              {canDeleteUser() && (
                <Popconfirm
                  title="Are you sure you want to delete this user?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <Tabs defaultActiveKey="profile">
          <TabPane tab="Profile" key="profile">
            <Row gutter={16}>
              <Col span={16}>
                <Card title="Basic Information">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Full Name">
                      {user.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        {user.email}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Position">
                      {user.position || 'Not specified'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {user.phone ? (
                        <Space>
                          <PhoneOutlined />
                          {user.phone}
                        </Space>
                      ) : 'Not specified'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">
                      {canManagePermissions() ? (
                        <Select
                          value={user.department}
                          onChange={handleDepartmentChange}
                          style={{ minWidth: 150 }}
                        >
                          {Object.entries(DEPARTMENTS).map(([code, name]) => (
                            <Option key={code} value={code}>
                              {name}
                            </Option>
                          ))}
                        </Select>
                      ) : (
                        <Tag color="blue" icon={<TeamOutlined />}>
                          {DEPARTMENTS[user.department as keyof typeof DEPARTMENTS] || user.department}
                        </Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Badge 
                        status={user.status === 'active' ? 'success' : 'error'} 
                        text={user.status === 'active' ? 'Active' : 'Inactive'}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Email Verified">
                      {user.email_verified_at ? (
                        <Badge status="success" text="Verified" />
                      ) : (
                        <Badge status="warning" text="Not Verified" />
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Login">
                      {user.last_login_at ? (
                        <Space>
                          <ClockCircleOutlined />
                          {dayjs(user.last_login_at).format('DD/MM/YYYY HH:mm')}
                        </Space>
                      ) : 'Never'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Member Since">
                      {dayjs(user.created_at).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                  </Descriptions>

                  {user.bio && (
                    <>
                      <Divider />
                      <div>
                        <Text strong>Bio:</Text>
                        <Paragraph style={{ marginTop: 8 }}>
                          {user.bio}
                        </Paragraph>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Avatar" size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      src={user.avatar_url} 
                      icon={<UserOutlined />}
                      size={120}
                      style={{ marginBottom: 16 }}
                    />
                    {isOwnProfile() && (
                      <div>
                        <Upload
                          showUploadList={false}
                          beforeUpload={() => false} // Handle upload manually
                        >
                          <Button icon={<UploadOutlined />} size="small">
                            Change Avatar
                          </Button>
                        </Upload>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Permissions" key="permissions">
            <Card
              title="User Permissions"
              extra={
                canManagePermissions() && (
                  <Button 
                    type="primary" 
                    icon={<SettingOutlined />}
                    onClick={() => setPermissionsModalVisible(true)}
                  >
                    Manage Permissions
                  </Button>
                )
              }
            >
              {user.permissions && user.permissions.length > 0 ? (
                <div>
                  {user.permissions.map(permission => (
                    <Tag key={permission} color="blue" style={{ marginBottom: 8 }}>
                      {permission.replace('_', ' ').toUpperCase()}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Empty 
                  description="No permissions assigned"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab="Activity" key="activity">
            <Card title="User Activity">
              {userActivities.length > 0 ? (
                <Table
                  columns={activityColumns}
                  dataSource={userActivities}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              ) : (
                <Empty 
                  description="No activity recorded"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>
        </Tabs>

        {/* Password Reset Modal */}
        <Modal
          title="Reset Password"
          open={passwordResetModalVisible}
          onCancel={() => setPasswordResetModalVisible(false)}
          onOk={handlePasswordReset}
          okText="Reset Password"
          cancelText="Cancel"
        >
          <p>Are you sure you want to reset the password for <strong>{user.name}</strong>?</p>
          <p style={{ color: '#666' }}>A temporary password will be generated and displayed to you.</p>
        </Modal>

        {/* Permissions Modal */}
        <Modal
          title="Manage User Permissions"
          open={permissionsModalVisible}
          onCancel={() => {
            setPermissionsModalVisible(false);
            permissionsForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={permissionsForm}
            layout="vertical"
            onFinish={handlePermissionsUpdate}
          >
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

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={() => {
                    setPermissionsModalVisible(false);
                    permissionsForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" icon={<SafetyOutlined />}>
                  Update Permissions
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default UserDetail;