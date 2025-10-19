import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Spin,
  Alert,
  Typography,
  Divider,
  Tooltip,
  Space,
  Button,
  Select,
  DatePicker
} from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  AlertOutlined,
  TrophyOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { DepartmentService } from '../services/department';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DepartmentStatsData {
  departments: Array<{
    code: string;
    name: string;
    metrics: {
      department: string;
      department_name: string;
      primary_owner_products: number;
      secondary_access_products: number;
      total_accessible_products: number;
      primary_owner_documents: number;
      secondary_access_documents: number;
      total_accessible_documents: number;
      total_alerts: number;
      critical_alerts: number;
      open_alerts: number;
      overdue_alerts: number;
      overall_compliance_score: number;
      low_compliance_products: number;
      upcoming_deadlines: number;
      expired_documents: number;
      avg_response_time_hours: number;
      total_users: number;
      calculated_at: string;
    };
    workload: {
      department: string;
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
    };
    performance_level: string;
    compliance_status: string;
    alert_status: string;
  }>;
  totals: {
    total_departments: number;
    total_products: number;
    total_documents: number;
    total_alerts: number;
    total_users: number;
    average_compliance: number;
    critical_alerts: number;
    overdue_alerts: number;
  };
  performance_summary: {
    excellent: number;
    good: number;
    average: number;
    below_average: number;
    poor: number;
  };
  compliance_distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
  };
}

const DepartmentStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DepartmentStatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DepartmentService.getAllDepartmentStats();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Không thể tải dữ liệu thống kê phòng ban');
      }
    } catch (err: any) {
      console.error('Error fetching department stats:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number): string => {
    if (score >= 95) return '#52c41a'; // green
    if (score >= 85) return '#1890ff'; // blue
    if (score >= 70) return '#faad14'; // yellow
    if (score >= 50) return '#ff7a45'; // orange
    return '#ff4d4f'; // red
  };

  const getPerformanceColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'excellent': return '#52c41a';
      case 'good': return '#1890ff';
      case 'average': return '#faad14';
      case 'below average': return '#ff7a45';
      case 'poor': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getWorkloadColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'very low': return '#52c41a';
      case 'low': return '#73d13d';
      case 'medium': return '#faad14';
      case 'high': return '#ff7a45';
      case 'very high': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const columns = [
    {
      title: 'Phòng ban',
      dataIndex: ['name'],
      key: 'department',
      render: (name: string, record: any) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.code}
          </Text>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['metrics', 'primary_owner_products'],
      key: 'products',
      render: (value: number, record: any) => (
        <Tooltip title={`${record.metrics.total_accessible_products} sản phẩm có thể truy cập`}>
          <Statistic 
            value={value} 
            suffix={`/ ${record.metrics.total_accessible_products}`}
            valueStyle={{ fontSize: 14 }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Tài liệu',
      dataIndex: ['metrics', 'primary_owner_documents'],
      key: 'documents',
      render: (value: number, record: any) => (
        <Tooltip title={`${record.metrics.total_accessible_documents} tài liệu có thể truy cập`}>
          <Statistic 
            value={value} 
            suffix={`/ ${record.metrics.total_accessible_documents}`}
            valueStyle={{ fontSize: 14 }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Nhân sự',
      dataIndex: ['metrics', 'total_users'],
      key: 'users',
      render: (value: number) => (
        <Statistic 
          value={value} 
          prefix={<TeamOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Tuân thủ',
      dataIndex: ['metrics', 'overall_compliance_score'],
      key: 'compliance',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          strokeColor={getComplianceColor(score)}
          format={percent => `${percent}%`}
        />
      ),
    },
    {
      title: 'Cảnh báo',
      key: 'alerts',
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <div>
            <Tag color={record.metrics.critical_alerts > 0 ? 'red' : 'green'}>
              Khẩn cấp: {record.metrics.critical_alerts}
            </Tag>
          </div>
          <div>
            <Tag color={record.metrics.overdue_alerts > 0 ? 'orange' : 'blue'}>
              Quá hạn: {record.metrics.overdue_alerts}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Hiệu suất',
      dataIndex: 'performance_level',
      key: 'performance',
      render: (level: string) => (
        <Tag color={getPerformanceColor(level)}>
          {level}
        </Tag>
      ),
    },
    {
      title: 'Tải công việc',
      key: 'workload',
      render: (record: any) => (
        <div>
          <Tag color={getWorkloadColor(record.workload.workload_level)}>
            {record.workload.workload_level}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Score: {record.workload.workload_score}
          </Text>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải dữ liệu thống kê...</Text>
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
        description="Không tìm thấy dữ liệu thống kê phòng ban"
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
          Thống Kê Tổng Quan Phòng Ban
        </Title>
        <Text type="secondary">
          Báo cáo tổng hợp hiệu suất và hoạt động của tất cả phòng ban
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng phòng ban"
              value={data.totals.total_departments}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={data.totals.total_products}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng tài liệu"
              value={data.totals.total_documents}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng nhân sự"
              value={data.totals.total_users}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố hiệu suất phòng ban" extra={<TrophyOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Xuất sắc"
                  value={data.performance_summary.excellent}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tốt"
                  value={data.performance_summary.good}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Statistic
                  title="Trung bình"
                  value={data.performance_summary.average}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Dưới TB"
                  value={data.performance_summary.below_average}
                  valueStyle={{ color: '#ff7a45' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Kém"
                  value={data.performance_summary.poor}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Phân bố tuân thủ" extra={<CheckCircleOutlined />}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Xuất sắc (≥95%)"
                  value={data.compliance_distribution.excellent}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tốt (≥85%)"
                  value={data.compliance_distribution.good}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Statistic
                  title="Khá (≥70%)"
                  value={data.compliance_distribution.fair}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Kém (≥50%)"
                  value={data.compliance_distribution.poor}
                  valueStyle={{ color: '#ff7a45' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Nguy hiểm (<50%)"
                  value={data.compliance_distribution.critical}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Alert Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Cảnh báo khẩn cấp"
              value={data.totals.critical_alerts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: data.totals.critical_alerts > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Cảnh báo quá hạn"
              value={data.totals.overdue_alerts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: data.totals.overdue_alerts > 0 ? '#ff7a45' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tuân thủ trung bình"
              value={data.totals.average_compliance}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: getComplianceColor(data.totals.average_compliance) }}
            />
          </Card>
        </Col>
      </Row>

      {/* Department Details Table */}
      <Card
        title="Chi tiết phòng ban"
        extra={
          <Space>
            <Button onClick={fetchData} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data.departments}
          rowKey="code"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} phòng ban`,
          }}
        />
      </Card>
    </div>
  );
};

export default DepartmentStatistics;