import React, { useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space, 
  Alert,
  List,
  Tag,
  Button,
  Spin
} from 'antd';
import {
  ProductOutlined,
  FileTextOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { AuthService, DepartmentService, AlertService } from '../../services';
import { DEPARTMENTS } from '../../types';

const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API calls
  const {
    data: dashboardData,
    loading: dashboardLoading,
    execute: fetchDashboard,
  } = useApi(AuthService.getDashboard);

  const {
    data: departmentMetrics,
    loading: metricsLoading,
    execute: fetchMetrics,
  } = useApi(DepartmentService.getMetrics);

  const {
    data: criticalAlerts,
    loading: alertsLoading,
    execute: fetchCriticalAlerts,
  } = useApi(AlertService.getCriticalAlerts);

  useEffect(() => {
    fetchDashboard();
    fetchMetrics();
    fetchCriticalAlerts();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'approved':
      case 'resolved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'non_compliant':
      case 'rejected':
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'pending':
      case 'under_review':
      case 'open':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const loading = dashboardLoading || metricsLoading || alertsLoading;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Dashboard</Title>
        <Paragraph type="secondary">
          Welcome back, {user?.name}! Here's an overview of your {' '}
          {user?.department && DEPARTMENTS[user.department as keyof typeof DEPARTMENTS]} department.
        </Paragraph>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && (
        <>
          {/* Quick Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Products Accessible"
                  value={dashboardData?.quick_stats?.products_accessible || 0}
                  prefix={<ProductOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => navigate('/products')}
                >
                  View All Products
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Documents Accessible"
                  value={dashboardData?.quick_stats?.documents_accessible || 0}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => navigate('/documents')}
                >
                  View All Documents
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Active Alerts"
                  value={dashboardData?.quick_stats?.alerts_assigned || 0}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => navigate('/alerts')}
                >
                  View All Alerts
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Recent Activities"
                  value={dashboardData?.quick_stats?.recent_activities || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </Button>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Critical Alerts */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <AlertOutlined style={{ color: '#f5222d' }} />
                    Critical Alerts
                  </Space>
                }
                extra={
                  <Button type="link" onClick={() => navigate('/alerts?priority=critical')}>
                    View All
                  </Button>
                }
              >
                {criticalAlerts && criticalAlerts.length > 0 ? (
                  <List
                    dataSource={criticalAlerts.slice(0, 5)}
                    renderItem={(alert: any) => (
                      <List.Item
                        actions={[
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => navigate(`/alerts/${alert.id}`)}
                          >
                            View
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getStatusIcon(alert.status)}
                          title={
                            <Space>
                              <Text strong>{alert.title}</Text>
                              <Tag color={getPriorityColor(alert.priority)}>
                                {alert.priority.toUpperCase()}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Text type="secondary" ellipsis>
                              {alert.message}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">No critical alerts</Text>
                    </div>
                  </div>
                )}
              </Card>
            </Col>

            {/* Recent Alerts */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    Recent Alerts
                  </Space>
                }
                extra={
                  <Button type="link" onClick={() => navigate('/alerts')}>
                    View All
                  </Button>
                }
              >
                {dashboardData?.recent_alerts && dashboardData.recent_alerts.length > 0 ? (
                  <List
                    dataSource={dashboardData.recent_alerts.slice(0, 5)}
                    renderItem={(alert: any) => (
                      <List.Item
                        actions={[
                          <Button 
                            type="link" 
                            size="small"
                            onClick={() => navigate(`/alerts/${alert.id}`)}
                          >
                            View
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={getStatusIcon(alert.status)}
                          title={
                            <Space>
                              <Text strong>{alert.title}</Text>
                              <Tag color={getPriorityColor(alert.priority)}>
                                {alert.priority.toUpperCase()}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Text type="secondary" ellipsis>
                              {alert.message}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">No recent alerts</Text>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Department Info */}
          {user?.department && (
            <Row style={{ marginTop: '24px' }}>
              <Col span={24}>
                <Alert
                  message={`Department: ${DEPARTMENTS[user.department as keyof typeof DEPARTMENTS]}`}
                  description={`You are currently working in the ${DEPARTMENTS[user.department as keyof typeof DEPARTMENTS]} department. You have access to products and documents assigned to your department.`}
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;