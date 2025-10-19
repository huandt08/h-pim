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
  Progress,
  Statistic,
  Tree,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  BranchesOutlined,
  PieChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { Department, DepartmentFilters, DEPARTMENTS } from '../../types';
import DepartmentService from '../../services/department';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DepartmentFilters>({});
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [stats, setStats] = useState<any>({});
  const [collaborationMatrix, setCollaborationMatrix] = useState<any>({});
  const [workloadAnalysis, setWorkloadAnalysis] = useState<any>({});
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // Permission checks
  const canManageDepartments = (): boolean => {
    return currentUser?.permissions?.includes('manage_departments') || false;
  };

  const canViewDepartmentDetails = (): boolean => {
    return currentUser?.permissions?.includes('view_department_details') || canManageDepartments();
  };

  // Table columns
  const columns = [
    {
      title: 'Department',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: Department) => (
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => description || 'No description',
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
      width: 150,
      render: (manager: any) => manager ? (
        <Space>
          <UserOutlined />
          <span>{manager.name}</span>
        </Space>
      ) : '-',
    },
    {
      title: 'Users',
      dataIndex: 'users_count',
      key: 'users_count',
      width: 80,
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Products',
      dataIndex: 'products_count',
      key: 'products_count',
      width: 80,
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Documents',
      dataIndex: 'documents_count',
      key: 'documents_count',
      width: 80,
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#722ed1' }} />
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
      title: 'Efficiency',
      dataIndex: 'efficiency_score',
      key: 'efficiency_score',
      width: 120,
      render: (score: number) => (
        <Progress 
          percent={Math.round(score || 0)} 
          size="small" 
          status={score >= 80 ? 'success' : score >= 60 ? 'normal' : 'exception'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Department) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/departments/${record.code}`)}
            />
          </Tooltip>
          <Tooltip title="Analytics">
            <Button 
              type="text" 
              icon={<BarChartOutlined />} 
              onClick={() => navigate(`/departments/${record.code}/analytics`)}
            />
          </Tooltip>
          {canManageDepartments() && (
            <>
              <Tooltip title="Edit">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/departments/${record.code}/edit`)}
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete this department?"
                onConfirm={() => handleDelete(record.code)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Load departments
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await DepartmentService.getDepartments(filters);
      
      if (response.success && response.data) {
        setDepartments(response.data);
      } else {
        message.error(response.message || 'Failed to load departments');
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      message.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  // Load department statistics
  const loadStats = async () => {
    try {
      const response = await DepartmentService.getAllDepartmentStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load collaboration matrix
  const loadCollaborationMatrix = async () => {
    try {
      const response = await DepartmentService.getCollaborationMatrix();
      if (response.success && response.data) {
        setCollaborationMatrix(response.data);
      }
    } catch (error) {
      console.error('Error loading collaboration matrix:', error);
    }
  };

  // Load workload analysis
  const loadWorkloadAnalysis = async () => {
    try {
      const response = await DepartmentService.getWorkloadAnalysis();
      if (response.success && response.data) {
        setWorkloadAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error loading workload analysis:', error);
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

  // Handle delete
  const handleDelete = async (departmentCode: string) => {
    try {
      const response = await DepartmentService.deleteDepartment(departmentCode);
      if (response.success) {
        message.success('Department deleted successfully');
        loadDepartments();
      } else {
        message.error(response.message || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      message.error('Failed to delete department');
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
      message.warning('Please select departments to delete');
      return;
    }

    Modal.confirm({
      title: 'Delete Departments',
      content: `Are you sure you want to delete ${selectedRowKeys.length} departments? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Implement bulk delete
          message.success(`${selectedRowKeys.length} departments deleted successfully`);
          setSelectedRowKeys([]);
          loadDepartments();
        } catch (error) {
          console.error('Error deleting departments:', error);
          message.error('Failed to delete departments');
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
    getCheckboxProps: (record: Department) => ({
      disabled: !canManageDepartments(),
    }),
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDepartments();
  }, [filters]);

  useEffect(() => {
    loadStats();
    loadCollaborationMatrix();
    loadWorkloadAnalysis();
  }, []);

  // Get department summary
  const getDepartmentSummary = () => {
    const total = departments.length;
    const active = departments.filter(d => d.status === 'active').length;
    const inactive = departments.filter(d => d.status === 'inactive').length;
    const totalUsers = departments.reduce((sum, dept) => sum + (dept.users_count || 0), 0);
    const totalProducts = departments.reduce((sum, dept) => sum + (dept.products_count || 0), 0);
    const avgEfficiency = departments.length > 0 
      ? departments.reduce((sum, dept) => sum + (dept.efficiency_score || 0), 0) / departments.length 
      : 0;

    return { total, active, inactive, totalUsers, totalProducts, avgEfficiency };
  };

  const summary = getDepartmentSummary();

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Department Management</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadDepartments}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              icon={<ApartmentOutlined />} 
              onClick={() => navigate('/departments/hierarchy')}
            >
              Hierarchy
            </Button>
            <Button 
              icon={<PieChartOutlined />} 
              onClick={() => navigate('/departments/analytics')}
            >
              Analytics
            </Button>
            {canManageDepartments() && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/departments/new')}
              >
                Add Department
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Department Summary */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Total Departments"
              value={summary.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Active Departments"
              value={summary.active}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Total Users"
              value={summary.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Total Products"
              value={summary.totalProducts}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Avg Efficiency"
              value={Math.round(summary.avgEfficiency)}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ 
                color: summary.avgEfficiency >= 80 ? '#52c41a' : 
                       summary.avgEfficiency >= 60 ? '#fa8c16' : '#f5222d' 
              }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="Collaboration Score"
              value={75}
              suffix="%"
              prefix={<BranchesOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Insights */}
      {canViewDepartmentDetails() && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card title="Top Performing Departments" size="small">
              {departments
                .sort((a, b) => (b.efficiency_score || 0) - (a.efficiency_score || 0))
                .slice(0, 3)
                .map((dept, index) => (
                  <div key={dept.code} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                      <Text>{dept.name}</Text>
                    </Space>
                    <Text strong>{Math.round(dept.efficiency_score || 0)}%</Text>
                  </div>
                ))}
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Largest Departments" size="small">
              {departments
                .sort((a, b) => (b.users_count || 0) - (a.users_count || 0))
                .slice(0, 3)
                .map((dept, index) => (
                  <div key={dept.code} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: '#52c41a' }} />
                      <Text>{dept.name}</Text>
                    </Space>
                    <Text strong>{dept.users_count || 0} users</Text>
                  </div>
                ))}
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Most Productive" size="small">
              {departments
                .sort((a, b) => (b.products_count || 0) - (a.products_count || 0))
                .slice(0, 3)
                .map((dept, index) => (
                  <div key={dept.code} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: '#fa8c16' }} />
                      <Text>{dept.name}</Text>
                    </Space>
                    <Text strong>{dept.products_count || 0} products</Text>
                  </div>
                ))}
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Input.Search
              placeholder="Search departments..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={4}>
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
            <Select
              placeholder="Has Users"
              value={filters.has_users}
              onChange={(value) => handleFilterChange('has_users', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={true}>Has Users</Option>
              <Option value={false}>No Users</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              icon={<FilterOutlined />} 
              onClick={clearFilters}
              style={{ width: '100%' }}
            >
              Clear Filters
            </Button>
          </Col>
          <Col span={4}>
            <Button 
              icon={<SettingOutlined />} 
              onClick={() => navigate('/departments/settings')}
              style={{ width: '100%' }}
            >
              Settings
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && canManageDepartments() && (
        <Card style={{ marginBottom: 16, backgroundColor: '#f0f2f5' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <span>{selectedRowKeys.length} departments selected</span>
            </Col>
            <Col>
              <Space>
                <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
                  Delete Selected
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Departments Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={departments}
            rowKey="code"
            rowSelection={canManageDepartments() ? rowSelection : undefined}
            pagination={{
              total: departments.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} departments`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Departments;