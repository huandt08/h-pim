import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Space, 
  Spin, 
  message, 
  Row, 
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Avatar,
  Descriptions,
  Tabs,
  List,
  Badge,
  Timeline,
  Empty,
  Tooltip,
  Divider,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  AlertOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  ExportOutlined,
  PlusOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Department, User, Product, Document as ProductDocument, Alert as ProductAlert } from '../../types';
import DepartmentService from '../../services/department';
import AuthService from '../../services/auth';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const DepartmentDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [documents, setDocuments] = useState<ProductDocument[]>([]);
  const [alerts, setAlerts] = useState<ProductAlert[]>([]);
  const [performance, setPerformance] = useState<any>({});
  const [workload, setWorkload] = useState<any>({});
  const [activeTab, setActiveTab] = useState('overview');
  
  const currentUser = AuthService.getCurrentUser();

  // Permission checks
  const canManageDepartments = (): boolean => {
    return currentUser?.permissions?.includes('manage_departments') || false;
  };

  const canEditDepartment = (): boolean => {
    return canManageDepartments() || 
           (currentUser?.department === code && (currentUser?.permissions?.includes('edit_own_department') || false));
  };

  // Load department data
  const loadDepartment = async () => {
    if (!code) return;
    
    try {
      setLoading(true);
      const response = await DepartmentService.getDepartment(code);
      
      if (response.success && response.data) {
        setDepartment(response.data);
      } else {
        message.error(response.message || 'Failed to load department');
      }
    } catch (error) {
      console.error('Error loading department:', error);
      message.error('Failed to load department');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboard = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getDashboard(code);
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  // Load department users
  const loadUsers = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getDepartmentUsers(code);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load department products
  const loadProducts = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getDepartmentProducts(code);
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Load department documents
  const loadDocuments = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getDepartmentDocuments(code);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Load department alerts
  const loadAlerts = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getDepartmentAlerts(code);
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Load performance data
  const loadPerformance = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getPerformance(code);
      if (response.success && response.data) {
        setPerformance(response.data);
      }
    } catch (error) {
      console.error('Error loading performance:', error);
    }
  };

  // Load workload data
  const loadWorkload = async () => {
    if (!code) return;
    
    try {
      const response = await DepartmentService.getWorkload(code);
      if (response.success && response.data) {
        setWorkload(response.data);
      }
    } catch (error) {
      console.error('Error loading workload:', error);
    }
  };

  // User table columns
  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position: string) => position || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      render: (phone: string) => phone || '-',
    }
  ];

  // Product table columns
  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.code}</div>
        </div>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand: string) => brand || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors = {
          active: 'success',
          inactive: 'error',
          pending: 'warning'
        };
        return <Tag color={statusColors[status as keyof typeof statusColors]}>{status}</Tag>;
      },
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance_percentage',
      key: 'compliance_percentage',
      render: (percentage: number) => (
        <Progress 
          percent={percentage || 0} 
          size="small" 
          status={percentage >= 80 ? 'success' : percentage >= 60 ? 'normal' : 'exception'}
        />
      ),
    }
  ];

  // Load data on component mount
  useEffect(() => {
    if (code) {
      loadDepartment();
      loadDashboard();
      loadUsers();
      loadProducts();
      loadDocuments();
      loadAlerts();
      loadPerformance();
      loadWorkload();
    }
  }, [code]);

  if (loading && !department) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!department) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Empty description="Department not found" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/departments')}
            >
              Back to Departments
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {department.name}
            </Title>
            <Tag color="blue">{department.code}</Tag>
            <Badge 
              status={department.status === 'active' ? 'success' : 'error'} 
              text={department.status === 'active' ? 'Active' : 'Inactive'}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ExportOutlined />} 
              onClick={() => DepartmentService.exportData(code)}
            >
              Export
            </Button>
            <Button 
              icon={<BarChartOutlined />} 
              onClick={() => navigate(`/departments/${code}/analytics`)}
            >
              Analytics
            </Button>
            {canEditDepartment() && (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/departments/${code}/edit`)}
              >
                Edit Department
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Department Info */}
      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="Department Code">{department.code}</Descriptions.Item>
          <Descriptions.Item label="Name">{department.name}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge 
              status={department.status === 'active' ? 'success' : 'error'} 
              text={department.status === 'active' ? 'Active' : 'Inactive'}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>
            {department.description || 'No description provided'}
          </Descriptions.Item>
          <Descriptions.Item label="Manager">
            {department.manager ? (
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{department.manager.name}</span>
              </Space>
            ) : 'No manager assigned'}
          </Descriptions.Item>
          <Descriptions.Item label="Created">{new Date(department.created_at).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="Updated">{new Date(department.updated_at).toLocaleDateString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Quick Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={department.users_count || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Products"
              value={department.products_count || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Documents"
              value={department.documents_count || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Efficiency"
              value={Math.round(department.efficiency_score || 0)}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ 
                color: (department.efficiency_score || 0) >= 80 ? '#52c41a' : 
                       (department.efficiency_score || 0) >= 60 ? '#fa8c16' : '#f5222d' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Alert
          message={`${alerts.length} Active Alerts`}
          description="There are pending alerts that require attention"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => setActiveTab('alerts')}>
              View Alerts
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Overview" key="overview">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Performance Overview" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Monthly Productivity"
                        value={dashboardData.productivity || 0}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Task Completion"
                        value={dashboardData.task_completion || 0}
                        suffix="%"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <Progress 
                    percent={dashboardData.overall_efficiency || 0} 
                    status="active" 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <Text type="secondary">Overall Efficiency</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Recent Activity" size="small">
                  <Timeline>
                    <Timeline.Item color="green">
                      <Text>New product added</Text>
                      <br />
                      <Text type="secondary">2 hours ago</Text>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <Text>Document updated</Text>
                      <br />
                      <Text type="secondary">1 day ago</Text>
                    </Timeline.Item>
                    <Timeline.Item color="red">
                      <Text>Alert resolved</Text>
                      <br />
                      <Text type="secondary">2 days ago</Text>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={`Users (${users.length})`} key="users">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => navigate(`/users/new?department=${code}`)}
                >
                  Add User
                </Button>
                <Button 
                  icon={<TeamOutlined />} 
                  onClick={() => navigate(`/departments/${code}/team-structure`)}
                >
                  Team Structure
                </Button>
              </Space>
            </div>
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </TabPane>

          <TabPane tab={`Products (${products.length})`} key="products">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => navigate(`/products/new?department=${code}`)}
                >
                  Add Product
                </Button>
                <Button 
                  icon={<BarChartOutlined />} 
                  onClick={() => navigate(`/departments/${code}/product-analytics`)}
                >
                  Product Analytics
                </Button>
              </Space>
            </div>
            <Table
              columns={productColumns}
              dataSource={products}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </TabPane>

          <TabPane tab={`Documents (${documents.length})`} key="documents">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => navigate(`/documents/new?department=${code}`)}
                >
                  Add Document
                </Button>
                <Button 
                  icon={<FileTextOutlined />} 
                  onClick={() => navigate(`/departments/${code}/document-library`)}
                >
                  Document Library
                </Button>
              </Space>
            </div>
            <List
              dataSource={documents}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<EditOutlined />} />,
                    <Button type="text">View</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} />}
                    title={doc.title}
                    description={doc.description}
                  />
                  <div>
                    <Tag color="blue">{(doc as any).document_type || 'Document'}</Tag>
                    <Tag color="green">{doc.status}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={`Alerts (${alerts.length})`} key="alerts">
            <List
              dataSource={alerts}
              renderItem={(alert) => (
                <List.Item
                  actions={[
                    <Button type="text">Resolve</Button>,
                    <Button type="text">View Details</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<AlertOutlined />} 
                        style={{ 
                          backgroundColor: alert.priority === 'high' ? '#f5222d' : 
                                         alert.priority === 'medium' ? '#fa8c16' : '#52c41a' 
                        }} 
                      />
                    }
                    title={alert.title}
                    description={(alert as any).description || alert.title}
                  />
                  <div>
                    <Tag color={alert.priority === 'high' ? 'red' : alert.priority === 'medium' ? 'orange' : 'green'}>
                      {alert.priority}
                    </Tag>
                    <Text type="secondary">{new Date(alert.created_at).toLocaleDateString()}</Text>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Analytics" key="analytics">
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Workload Distribution" size="small">
                  <Progress type="circle" percent={workload.current_load || 0} />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Text type="secondary">Current Workload</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Team Collaboration" size="small">
                  <Progress type="circle" percent={75} strokeColor="#52c41a" />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Text type="secondary">Collaboration Score</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Resource Utilization" size="small">
                  <Progress type="circle" percent={85} strokeColor="#1890ff" />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Text type="secondary">Resource Usage</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DepartmentDetail;