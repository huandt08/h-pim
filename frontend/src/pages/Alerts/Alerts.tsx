import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  Dropdown,
  Modal,
  message,
  Typography,
  Divider,
  Empty,
  Spin
} from 'antd';
import {
  AlertOutlined,
  BellOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { AlertService } from '../../services/alert';
import { Alert, AlertFilters, ALERT_PRIORITIES, ALERT_STATUSES } from '../../types';
import { useAuth } from '../../hooks/useAuth';

dayjs.extend(relativeTime);

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState<AlertFilters>({
    search: '',
    status: '',
    priority: '',
    type: '',
    department: '',
    assigned_to: '',
    date_range: undefined
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchDashboard();
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  const fetchDashboard = async () => {
    try {
      const response = await AlertService.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchAlerts = async (currentFilters?: AlertFilters) => {
    try {
      setLoading(true);
      const response = await AlertService.getAlerts(currentFilters || filters);
      if (response.success && response.data) {
        setAlerts(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      message.error('Không thể tải danh sách cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...alerts];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) ||
        alert.message.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(alert => alert.priority === filters.priority);
    }

    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    if (filters.department) {
      filtered = filtered.filter(alert => 
        alert.primary_responsible_department === filters.department ||
        alert.secondary_involved_departments?.includes(filters.department!)
      );
    }

    if (filters.date_range && filters.date_range.length === 2) {
      const [start, end] = filters.date_range;
      filtered = filtered.filter(alert => {
        const alertDate = dayjs(alert.created_at);
        return alertDate.isAfter(start.startOf('day')) && alertDate.isBefore(end.endOf('day'));
      });
    }

    setFilteredAlerts(filtered);
  }, [alerts, filters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof AlertFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResolve = async (alertId: string) => {
    Modal.confirm({
      title: 'Xác nhận giải quyết',
      content: 'Bạn có chắc chắn muốn đánh dấu cảnh báo này đã được giải quyết?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await AlertService.resolve(alertId, 'Đã được giải quyết');
          message.success('Cảnh báo đã được đánh dấu đã giải quyết');
          fetchAlerts();
        } catch (error) {
          message.error('Không thể cập nhật trạng thái cảnh báo');
        }
      }
    });
  };

  const handleEscalate = async (alertId: string) => {
    try {
      await AlertService.escalate(alertId);
      message.success('Cảnh báo đã được leo thang');
      fetchAlerts();
    } catch (error) {
      message.error('Không thể leo thang cảnh báo');
    }
  };

  const handleBulkResolve = () => {
    if (selectedRows.length === 0) {
      message.warning('Vui lòng chọn ít nhất một cảnh báo');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận giải quyết hàng loạt',
      content: `Bạn có chắc chắn muốn đánh dấu ${selectedRows.length} cảnh báo đã được giải quyết?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await AlertService.bulkResolve(selectedRows, 'Giải quyết hàng loạt');
          message.success(`Đã giải quyết ${selectedRows.length} cảnh báo`);
          setSelectedRows([]);
          fetchAlerts();
        } catch (error) {
          message.error('Không thể giải quyết các cảnh báo được chọn');
        }
      }
    });
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#ff4d4f';
      case 'high': return '#fa8c16';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'Cực kỳ khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return '#1890ff';
      case 'in_progress': return '#fa8c16';
      case 'resolved': return '#52c41a';
      case 'closed': return '#d9d9d9';
      case 'escalated': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'open': return 'Mở';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      case 'closed': return 'Đã đóng';
      case 'escalated': return 'Đã leo thang';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string, record: Alert) => (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            {text}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.message}
          </Text>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Phòng ban',
      dataIndex: 'primary_responsible_department',
      key: 'department',
      width: 120,
      render: (dept: string) => (
        <Tag color="blue">{dept}</Tag>
      ),
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).fromNow()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hạn xử lý',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date: string) => {
        if (!date) return '-';
        const isOverdue = dayjs(date).isBefore(dayjs());
        return (
          <Text style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (record: Alert) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/alerts/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'open' && (
            <Tooltip title="Giải quyết">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleResolve(record.id)}
              />
            </Tooltip>
          )}
          {record.status !== 'escalated' && record.priority !== 'critical' && (
            <Tooltip title="Leo thang">
              <Button
                type="text"
                icon={<ExclamationCircleOutlined />}
                onClick={() => handleEscalate(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRows(selectedRowKeys as string[]);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BellOutlined style={{ marginRight: 8 }} />
          Quản lý Cảnh báo
        </Title>
      </div>

      {/* Dashboard Statistics */}
      {dashboard && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng cảnh báo"
                value={dashboard.total_alerts || 0}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Cảnh báo mở"
                value={dashboard.open_alerts || 0}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Khẩn cấp"
                value={dashboard.critical_alerts || 0}
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Quá hạn"
                value={dashboard.overdue_alerts || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm cảnh báo..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              {ALERT_STATUSES.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Mức độ"
              style={{ width: '100%' }}
              allowClear
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            >
              {ALERT_PRIORITIES.map(priority => (
                <Option key={priority.value} value={priority.value}>
                  {priority.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              onChange={(dates) => handleFilterChange('date_range', dates)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => fetchAlerts()}
              style={{ marginRight: 8 }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Action Bar */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/alerts/new')}
              >
                Tạo cảnh báo
              </Button>
              {selectedRows.length > 0 && (
                <Button
                  type="default"
                  icon={<CheckCircleOutlined />}
                  onClick={handleBulkResolve}
                >
                  Giải quyết ({selectedRows.length})
                </Button>
              )}
            </Space>
          </Col>
          <Col>
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: Implement export functionality
                message.info('Tính năng xuất báo cáo sẽ được triển khai');
              }}
            >
              Xuất báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Alerts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAlerts}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} cảnh báo`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có cảnh báo nào"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default Alerts;