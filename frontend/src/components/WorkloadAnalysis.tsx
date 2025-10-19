import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Spin,
  Alert,
  Typography,
  Progress,
  Space,
  Button,
  Statistic,
  List,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import {
  TeamOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { DepartmentService } from '../services/department';

const { Title, Text } = Typography;

interface WorkloadAnalysisData {
  departments: Array<{
    department: string;
    department_name: string;
    workload_score: number;
    workload_level: string;
    workload_factors: {
      open_alerts: number;
      critical_alerts: number;
      overdue_alerts: number;
      expired_documents: number;
      upcoming_deadlines: number;
    };
    recommendations: string[];
    users_count: number;
    workload_per_user: number;
  }>;
  summary: {
    total_departments: number;
    average_workload: number;
    total_workload: number;
    workload_distribution: {
      very_high: number;
      high: number;
      medium: number;
      low: number;
      very_low: number;
    };
  };
  insights: {
    most_overloaded: any;
    least_loaded: any;
    balance_recommendations: Array<{
      type: string;
      message: string;
      department?: string;
      overloaded_depts?: string[];
      underloaded_depts?: string[];
      workload_score?: number;
      workload_per_user?: number;
    }>;
  };
}

const WorkloadAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WorkloadAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DepartmentService.getWorkloadAnalysis();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Không thể tải dữ liệu phân tích khối lượng công việc');
      }
    } catch (err: any) {
      console.error('Error fetching workload analysis:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'very high': return '#ff4d4f';
      case 'high': return '#ff7a45';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      case 'very low': return '#73d13d';
      default: return '#d9d9d9';
    }
  };

  const getWorkloadText = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'very high': return 'Rất cao';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      case 'very low': return 'Rất thấp';
      default: return level;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'urgent_attention': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'redistribution': return <ThunderboltOutlined style={{ color: '#faad14' }} />;
      case 'resource_addition': return <UserOutlined style={{ color: '#1890ff' }} />;
      default: return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  const columns = [
    {
      title: 'Phòng ban',
      dataIndex: 'department_name',
      key: 'department_name',
      fixed: 'left' as const,
      width: 150,
      render: (name: string, record: any) => (
        <Space>
          <TeamOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.department}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Điểm tải',
      dataIndex: 'workload_score',
      key: 'workload_score',
      width: 120,
      render: (score: number) => (
        <Progress 
          percent={score > 100 ? 100 : score} 
          size="small" 
          strokeColor={score >= 80 ? '#ff4d4f' : score >= 60 ? '#ff7a45' : score >= 40 ? '#faad14' : '#52c41a'}
          format={percent => `${score}`}
        />
      ),
    },
    {
      title: 'Mức độ tải',
      dataIndex: 'workload_level',
      key: 'workload_level',
      width: 120,
      render: (level: string) => (
        <Tag color={getWorkloadColor(level)}>
          {getWorkloadText(level)}
        </Tag>
      ),
    },
    {
      title: 'Nhân sự',
      dataIndex: 'users_count',
      key: 'users_count',
      width: 100,
      render: (count: number) => (
        <Statistic 
          value={count} 
          prefix={<UserOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Tải/người',
      dataIndex: 'workload_per_user',
      key: 'workload_per_user',
      width: 100,
      render: (value: number) => (
        <Tooltip title="Khối lượng công việc trên mỗi người">
          <Badge 
            count={Math.round(value)} 
            style={{ 
              backgroundColor: value >= 50 ? '#ff4d4f' : value >= 30 ? '#faad14' : '#52c41a' 
            }} 
          />
        </Tooltip>
      ),
    },
    {
      title: 'Yếu tố tải',
      key: 'workload_factors',
      width: 200,
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> Cảnh báo mở: {record.workload_factors.open_alerts}
          </Text>
          <Text style={{ fontSize: 12 }}>
            <ExclamationCircleOutlined /> Khẩn cấp: {record.workload_factors.critical_alerts}
          </Text>
          <Text style={{ fontSize: 12 }}>
            <WarningOutlined /> Quá hạn: {record.workload_factors.overdue_alerts}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Khuyến nghị',
      dataIndex: 'recommendations',
      key: 'recommendations',
      width: 250,
      render: (recommendations: string[]) => (
        <Space direction="vertical" size={4}>
          {recommendations.slice(0, 2).map((rec, index) => (
            <Text key={index} style={{ fontSize: 12 }} type="secondary">
              • {rec}
            </Text>
          ))}
          {recommendations.length > 2 && (
            <Text style={{ fontSize: 12 }} type="secondary">
              +{recommendations.length - 2} khuyến nghị khác
            </Text>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang phân tích khối lượng công việc...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchData}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không tìm thấy dữ liệu phân tích khối lượng công việc"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Phân Tích Khối Lượng Công Việc
        </Title>
        <Text type="secondary">
          Đánh giá và phân tích khối lượng công việc của từng phòng ban
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng phòng ban"
              value={data.summary.total_departments}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tải TB"
              value={data.summary.average_workload}
              suffix="điểm"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tải cao nhất"
              value={data.insights.most_overloaded?.department_name || 'N/A'}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tải thấp nhất"
              value={data.insights.least_loaded?.department_name || 'N/A'}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Workload Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố khối lượng công việc" extra={<TrophyOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Rất cao"
                  value={data.summary.workload_distribution.very_high}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Cao"
                  value={data.summary.workload_distribution.high}
                  valueStyle={{ color: '#ff7a45' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Statistic
                  title="TB"
                  value={data.summary.workload_distribution.medium}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Thấp"
                  value={data.summary.workload_distribution.low}
                  valueStyle={{ color: '#52c41a' }}
              />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Rất thấp"
                  value={data.summary.workload_distribution.very_low}
                  valueStyle={{ color: '#73d13d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Khuyến nghị cân bằng" extra={<ThunderboltOutlined />}>
            <List
              size="small"
              dataSource={data.insights.balance_recommendations.slice(0, 4)}
              renderItem={(item, index) => (
                <List.Item key={index}>
                  <Space>
                    {getRecommendationIcon(item.type)}
                    <Text style={{ fontSize: 12 }}>{item.message}</Text>
                  </Space>
                </List.Item>
              )}
              locale={{ emptyText: 'Không có khuyến nghị nào' }}
            />
            {data.insights.balance_recommendations.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  +{data.insights.balance_recommendations.length - 4} khuyến nghị khác
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Most/Least Loaded Departments */}
      {(data.insights.most_overloaded || data.insights.least_loaded) && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {data.insights.most_overloaded && (
            <Col xs={24} md={12}>
              <Card 
                title="Phòng ban tải cao nhất" 
                extra={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>{data.insights.most_overloaded.department_name}</Text>
                  <Progress 
                    percent={data.insights.most_overloaded.workload_score > 100 ? 100 : data.insights.most_overloaded.workload_score} 
                    strokeColor="#ff4d4f"
                    format={() => `${data.insights.most_overloaded.workload_score} điểm`}
                  />
                  <Text type="secondary">
                    Tải/người: {data.insights.most_overloaded.workload_per_user} điểm
                  </Text>
                </Space>
              </Card>
            </Col>
          )}
          
          {data.insights.least_loaded && (
            <Col xs={24} md={12}>
              <Card 
                title="Phòng ban tải thấp nhất" 
                extra={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>{data.insights.least_loaded.department_name}</Text>
                  <Progress 
                    percent={data.insights.least_loaded.workload_score} 
                    strokeColor="#52c41a"
                    format={() => `${data.insights.least_loaded.workload_score} điểm`}
                  />
                  <Text type="secondary">
                    Tải/người: {data.insights.least_loaded.workload_per_user} điểm
                  </Text>
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* Department Details Table */}
      <Card
        title="Chi tiết khối lượng công việc"
        extra={
          <Button onClick={fetchData} loading={loading} icon={<ReloadOutlined />}>
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data.departments}
          rowKey="department"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} phòng ban`,
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default WorkloadAnalysis;