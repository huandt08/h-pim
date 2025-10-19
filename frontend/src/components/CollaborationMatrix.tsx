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
  Tooltip,
  Progress,
  Space,
  Button,
  Select,
  Statistic
} from 'antd';
import {
  TeamOutlined,
  ShareAltOutlined,
  SyncOutlined,
  ProjectOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ForkOutlined
} from '@ant-design/icons';
import { DepartmentService } from '../services/department';

const { Title, Text } = Typography;
const { Option } = Select;

interface CollaborationData {
  matrix: Array<{
    department_from: string;
    department_to: string;
    shared_products: number;
    shared_documents: number;
    collaboration_score: number;
    collaboration_level: string;
  }>;
  summary: {
    total_collaborations: number;
    average_collaboration_score: number;
    most_collaborative_dept: string;
    least_collaborative_dept: string;
  };
  departments: Array<{
    code: string;
    name: string;
    total_collaborations: number;
    collaboration_score: number;
    collaboration_level: string;
  }>;
}

const CollaborationMatrix: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CollaborationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DepartmentService.getCollaborationMatrix();
      
      console.log('Collaboration Matrix API Response:', response);
      
      if (response.success && response.data) {
        console.log('Setting collaboration data:', response.data);
        setData(response.data);
      } else {
        console.error('API response not successful:', response);
        setError('Không thể tải dữ liệu ma trận hợp tác');
      }
    } catch (err: any) {
      console.error('Error fetching collaboration matrix:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getCollaborationColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'excellent': return '#52c41a';
      case 'good': return '#1890ff';
      case 'fair': return '#faad14';
      case 'poor': return '#ff7a45';
      case 'none': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getCollaborationText = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Tốt';
      case 'fair': return 'Khá';
      case 'poor': return 'Kém';
      case 'none': return 'Không có';
      default: return level;
    }
  };

  const matrixColumns = [
    {
      title: 'Từ phòng ban',
      dataIndex: 'department_from',
      key: 'department_from',
      fixed: 'left' as const,
      width: 150,
      render: (code: string) => (
        <Tag color="blue">{code}</Tag>
      ),
    },
    {
      title: 'Đến phòng ban',
      dataIndex: 'department_to',
      key: 'department_to',
      width: 150,
      render: (code: string) => (
        <Tag color="green">{code}</Tag>
      ),
    },
    {
      title: 'Sản phẩm chung',
      dataIndex: 'shared_products',
      key: 'shared_products',
      width: 120,
      render: (count: number) => (
        <Statistic 
          value={count} 
          prefix={<ProjectOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Tài liệu chung',
      dataIndex: 'shared_documents',
      key: 'shared_documents',
      width: 120,
      render: (count: number) => (
        <Statistic 
          value={count} 
          prefix={<FileTextOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Điểm hợp tác',
      dataIndex: 'collaboration_score',
      key: 'collaboration_score',
      width: 120,
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          strokeColor={getCollaborationColor(score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor')}
        />
      ),
    },
    {
      title: 'Mức độ hợp tác',
      dataIndex: 'collaboration_level',
      key: 'collaboration_level',
      width: 120,
      render: (level: string) => (
        <Tag color={getCollaborationColor(level)}>
          {getCollaborationText(level)}
        </Tag>
      ),
    },
  ];

  const departmentColumns = [
    {
      title: 'Phòng ban',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <TeamOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tổng hợp tác',
      dataIndex: 'total_collaborations',
      key: 'total_collaborations',
      render: (count: number) => (
        <Statistic 
          value={count} 
          prefix={<ShareAltOutlined />}
          valueStyle={{ fontSize: 14 }}
        />
      ),
    },
    {
      title: 'Điểm hợp tác',
      dataIndex: 'collaboration_score',
      key: 'collaboration_score',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          strokeColor={getCollaborationColor(score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor')}
        />
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'collaboration_level',
      key: 'collaboration_level',
      render: (level: string) => (
        <Tag color={getCollaborationColor(level)}>
          {getCollaborationText(level)}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang tải ma trận hợp tác...</Text>
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

  if (!data || !data.summary || !data.departments) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không tìm thấy dữ liệu ma trận hợp tác hoặc dữ liệu không đúng định dạng"
        type="warning"
        showIcon
        action={
          <Button size="small" onClick={fetchData}>
            Tải lại
          </Button>
        }
      />
    );
  }

  // Additional safety check to prevent runtime errors
  const safeData = {
    summary: data?.summary || {
      total_collaborations: 0,
      average_collaboration_score: 0,
      most_collaborative_dept: 'N/A',
      least_collaborative_dept: 'N/A'
    },
    departments: data?.departments || [],
    matrix: data?.matrix || []
  };

  const filteredMatrix = selectedDepartment 
    ? safeData.matrix.filter(item => 
        item.department_from === selectedDepartment || 
        item.department_to === selectedDepartment
      )
    : safeData.matrix;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ForkOutlined style={{ marginRight: 8 }} />
          Ma Trận Hợp Tác Phòng Ban
        </Title>
        <Text type="secondary">
          Phân tích mức độ hợp tác và chia sẻ tài nguyên giữa các phòng ban
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng hợp tác"
              value={safeData.summary.total_collaborations}
              prefix={<ShareAltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Điểm hợp tác TB"
              value={safeData.summary.average_collaboration_score}
              suffix="%"
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hợp tác tốt nhất"
              value={safeData.summary.most_collaborative_dept}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Cần cải thiện"
              value={safeData.summary.least_collaborative_dept}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Department Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title="Tổng quan phòng ban"
            extra={
              <Space>
                <Select
                  placeholder="Lọc theo phòng ban"
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  allowClear
                  style={{ width: 200 }}
                >
                  {safeData.departments.map(dept => (
                    <Option key={dept.code} value={dept.code}>
                      {dept.name} ({dept.code})
                    </Option>
                  ))}
                </Select>
                <Button onClick={fetchData} loading={loading} icon={<ReloadOutlined />}>
                  Làm mới
                </Button>
              </Space>
            }
          >
            <Table
              columns={departmentColumns}
              dataSource={safeData.departments}
              rowKey="code"
              pagination={false}
              scroll={{ x: 600 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Collaboration Matrix */}
      <Card
        title="Ma trận hợp tác chi tiết"
        extra={
          selectedDepartment && (
            <Tag color="blue">
              Lọc: {selectedDepartment}
            </Tag>
          )
        }
      >
        <Table
          columns={matrixColumns}
          dataSource={filteredMatrix}
          rowKey={(record) => `${record.department_from}-${record.department_to}`}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} mối quan hệ hợp tác`,
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default CollaborationMatrix;