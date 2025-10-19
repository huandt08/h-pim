import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message, 
  Tag, 
  Card,
  Row,
  Col,
  Spin,
  Tooltip,
  Popconfirm,
  Badge,
  Avatar,
  DatePicker,
  Switch,
  Dropdown,
  MenuProps
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  MoreOutlined,
  KeyOutlined,
  UserAddOutlined,
  SendOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { User, UserFilters, DEPARTMENTS } from '../../types';
import UserService from '../../services/user';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteForm] = Form.useForm();
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // Permission checks
  const canManageUsers = (): boolean => {
    return currentUser?.permissions?.includes('manage_users') || false;
  };

  const canEditUser = (user: User): boolean => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return true; // Can edit own profile
    return canManageUsers();
  };

  const canDeleteUser = (user: User): boolean => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return false; // Cannot delete own account
    return canManageUsers();
  };

  const canInviteUsers = (): boolean => {
    return canManageUsers();
  };

  // Table columns
  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: User) => (
        <Space>
          <Avatar 
            src={record.avatar_url} 
            icon={<UserOutlined />}
            size="default"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.position || 'No position'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => (
        <Space>
          <MailOutlined style={{ color: '#666' }} />
          <span>{email}</span>
        </Space>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (dept: string) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status === 'active' ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => phone ? (
        <Space>
          <PhoneOutlined style={{ color: '#666' }} />
          <span>{phone}</span>
        </Space>
      ) : '-',
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      width: 130,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Never',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: User) => {
        const items: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Profile',
            onClick: () => navigate(`/users/${record.id}`),
          },
          ...(canEditUser(record) ? [{
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => navigate(`/users/${record.id}/edit`),
          }] : []),
          ...(canManageUsers() ? [
            {
              key: 'status',
              icon: record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />,
              label: record.status === 'active' ? 'Deactivate' : 'Activate',
              onClick: () => handleStatusToggle(record),
            },
            {
              key: 'reset-password',
              icon: <KeyOutlined />,
              label: 'Reset Password',
              onClick: () => handlePasswordReset(record),
            },
            ...(record.status === 'inactive' && record.email_verified_at === null ? [{
              key: 'resend-invitation',
              icon: <SendOutlined />,
              label: 'Resend Invitation',
              onClick: () => handleResendInvitation(record),
            }] : []),
          ] : []),
          ...(canDeleteUser(record) ? [
            {
              type: 'divider' as const,
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Delete',
              danger: true,
              onClick: () => handleDelete(record.id),
            },
          ] : []),
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers(filters);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        message.error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchText });
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  // Handle date range filter
  const handleDateRangeChange = (dates: any, type: 'created' | 'last_login') => {
    if (dates && dates.length === 2) {
      const fromKey = type === 'created' ? 'created_from' : 'last_login_from';
      const toKey = type === 'created' ? 'created_to' : 'last_login_to';
      
      setFilters({
        ...filters,
        [fromKey]: dates[0].format('YYYY-MM-DD'),
        [toKey]: dates[1].format('YYYY-MM-DD')
      });
    } else {
      const { created_from, created_to, last_login_from, last_login_to, ...rest } = filters;
      if (type === 'created') {
        setFilters({ ...rest, last_login_from, last_login_to });
      } else {
        setFilters({ ...rest, created_from, created_to });
      }
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const response = await UserService.updateUserStatus(user.id, newStatus);
      
      if (response.success) {
        message.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
      } else {
        message.error(response.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Failed to update user status');
    }
  };

  // Handle password reset
  const handlePasswordReset = async (user: User) => {
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
      } else {
        message.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Failed to reset password');
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async (user: User) => {
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

  // Handle delete
  const handleDelete = async (userId: string) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await UserService.deleteUser(userId);
          if (response.success) {
            message.success('User deleted successfully');
            loadUsers();
          } else {
            message.error(response.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error('Failed to delete user');
        }
      },
    });
  };

  // Handle invite user
  const handleInviteUser = async (values: { email: string; department: string; role?: string }) => {
    try {
      const response = await UserService.sendInvitation(values.email, values.department, values.role);
      
      if (response.success) {
        message.success('Invitation sent successfully');
        setInviteModalVisible(false);
        inviteForm.resetFields();
        loadUsers();
      } else {
        message.error(response.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      message.error('Failed to send invitation');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchText('');
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select users to delete');
      return;
    }

    Modal.confirm({
      title: 'Delete Users',
      content: `Are you sure you want to delete ${selectedRowKeys.length} users? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await UserService.bulkDelete(selectedRowKeys);
          if (response.success) {
            message.success(`${selectedRowKeys.length} users deleted successfully`);
            setSelectedRowKeys([]);
            loadUsers();
          } else {
            message.error(response.message || 'Failed to delete users');
          }
        } catch (error) {
          console.error('Error deleting users:', error);
          message.error('Failed to delete users');
        }
      },
    });
  };

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
    getCheckboxProps: (record: User) => ({
      disabled: !canDeleteUser(record),
    }),
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Get user summary
  const getUserSummary = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const byDepartment = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, inactive, byDepartment };
  };

  const userSummary = getUserSummary();

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>User Management</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadUsers}
              loading={loading}
            >
              Refresh
            </Button>
            {canInviteUsers() && (
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={() => setInviteModalVisible(true)}
              >
                Invite User
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* User Summary */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                {userSummary.total}
              </div>
              <div style={{ fontSize: 12 }}>Total Users</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                {userSummary.active}
              </div>
              <div style={{ fontSize: 12 }}>Active Users</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5222d' }}>
                {userSummary.inactive}
              </div>
              <div style={{ fontSize: 12 }}>Inactive Users</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>
                {Object.keys(userSummary.byDepartment).length}
              </div>
              <div style={{ fontSize: 12 }}>Departments</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input.Search
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Department"
              value={filters.department}
              onChange={(value) => handleFilterChange('department', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(DEPARTMENTS).map(([code, name]) => (
                <Option key={code} value={code}>
                  {name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col span={4}>
            <RangePicker
              placeholder={['Created From', 'Created To']}
              onChange={(dates) => handleDateRangeChange(dates, 'created')}
              style={{ width: '100%' }}
              size="middle"
            />
          </Col>
          <Col span={4}>
            <RangePicker
              placeholder={['Last Login From', 'Last Login To']}
              onChange={(dates) => handleDateRangeChange(dates, 'last_login')}
              style={{ width: '100%' }}
              size="middle"
            />
          </Col>
          <Col span={3}>
            <Button 
              icon={<FilterOutlined />} 
              onClick={clearFilters}
              style={{ width: '100%' }}
            >
              Clear
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <Card style={{ marginBottom: 16, backgroundColor: '#f0f2f5' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <span>{selectedRowKeys.length} users selected</span>
            </Col>
            <Col>
              <Space>
                {canManageUsers() && (
                  <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
                    Delete Selected
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            rowSelection={canManageUsers() ? rowSelection : undefined}
            pagination={{
              total: users.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* Invite User Modal */}
      <Modal
        title="Invite New User"
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false);
          inviteForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInviteUser}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input placeholder="user@company.com" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select placeholder="Select department">
              {Object.entries(DEPARTMENTS).map(([code, name]) => (
                <Option key={code} value={code}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
          >
            <Select placeholder="Select role (optional)">
              <Option value="admin">Administrator</Option>
              <Option value="manager">Manager</Option>
              <Option value="user">User</Option>
              <Option value="viewer">Viewer</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setInviteModalVisible(false);
                  inviteForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Send Invitation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;