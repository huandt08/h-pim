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
  DatePicker,
  InputNumber,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  QrcodeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Batch, BatchFilters, DEPARTMENTS, BATCH_STATUSES, QUALITY_STATUSES, Product } from '../../types';
import BatchService from '../../services/batch';
import ProductService from '../../services/product';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Batches: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<BatchFilters>({});
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // Table columns
  const columns = [
    {
      title: 'Batch Number',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 150,
      render: (batchNumber: string, record: Batch) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/batches/${record.id}`)}
          style={{ padding: 0, height: 'auto', textAlign: 'left' }}
        >
          <Space>
            <QrcodeOutlined />
            {batchNumber}
          </Space>
        </Button>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: 200,
      render: (product: Product) => (
        <Space direction="vertical" size="small">
          <div style={{ fontWeight: 500 }}>{product?.name || '-'}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{product?.code || '-'}</div>
        </Space>
      ),
      ellipsis: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number) => (
        <div style={{ textAlign: 'right', fontWeight: 500 }}>
          {quantity?.toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const colors = {
          planning: 'blue',
          in_production: 'processing',
          quality_control: 'warning',
          approved: 'success',
          released: 'green',
          recalled: 'error'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Quality Status',
      dataIndex: 'quality_status',
      key: 'quality_status',
      width: 130,
      render: (status: string) => {
        const colors = {
          pending: 'default',
          passed: 'success',
          failed: 'error',
          conditional: 'warning'
        };
        const icons = {
          pending: <ClockCircleOutlined />,
          passed: <CheckCircleOutlined />,
          failed: <CloseCircleOutlined />,
          conditional: <ExclamationCircleOutlined />
        };
        return (
          <Tag color={colors[status as keyof typeof colors]} icon={icons[status as keyof typeof icons]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Primary Owner',
      dataIndex: 'primary_owner_department',
      key: 'primary_owner_department',
      width: 150,
      render: (dept: string) => (
        <Tag color="blue">{DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}</Tag>
      ),
    },
    {
      title: 'Production Date',
      dataIndex: 'production_date',
      key: 'production_date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      render: (date: string) => {
        if (!date) return '-';
        const expiryDate = dayjs(date);
        const isExpired = expiryDate.isBefore(dayjs());
        const isExpiringSoon = expiryDate.isBefore(dayjs().add(30, 'days')) && !isExpired;
        
        return (
          <Space>
            {isExpired && <ExclamationCircleOutlined style={{ color: 'red' }} />}
            {isExpiringSoon && <ClockCircleOutlined style={{ color: 'orange' }} />}
            <span style={{ 
              color: isExpired ? 'red' : isExpiringSoon ? 'orange' : 'inherit' 
            }}>
              {expiryDate.format('DD/MM/YYYY')}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Batch) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/batches/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Generate Report">
            <Button 
              type="text" 
              icon={<FileTextOutlined />} 
              onClick={() => handleGenerateReport(record)}
            />
          </Tooltip>
          {canEditBatch(record) && (
            <Tooltip title="Edit">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {canDeleteBatch(record) && (
            <Popconfirm
              title="Are you sure you want to delete this batch?"
              onConfirm={() => handleDelete(record.id)}
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
          )}
        </Space>
      ),
    },
  ];

  // Permission checks
  const canEditBatch = (batch: Batch): boolean => {
    if (!currentUser) return false;
    return (
      batch.primary_owner_department === currentUser.department ||
      batch.secondary_access_departments?.includes(currentUser.department)
    );
  };

  const canDeleteBatch = (batch: Batch): boolean => {
    if (!currentUser) return false;
    return batch.primary_owner_department === currentUser.department;
  };

  const canCreateBatch = (): boolean => {
    return !!currentUser; // All authenticated users can create batches
  };

  // Load batches
  const loadBatches = async () => {
    try {
      setLoading(true);
      const response = await BatchService.getBatches(filters);
      
      if (response.success && response.data) {
        setBatches(response.data);
      } else {
        message.error(response.message || 'Failed to load batches');
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      message.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  // Load products for filter
  const loadProducts = async () => {
    try {
      const response = await ProductService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
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
  const handleDateRangeChange = (dates: any, type: 'production' | 'expiry') => {
    if (dates && dates.length === 2) {
      const fromKey = type === 'production' ? 'production_date_from' : 'expiry_date_from';
      const toKey = type === 'production' ? 'production_date_to' : 'expiry_date_to';
      
      setFilters({
        ...filters,
        [fromKey]: dates[0].format('YYYY-MM-DD'),
        [toKey]: dates[1].format('YYYY-MM-DD')
      });
    } else {
      const { production_date_from, production_date_to, expiry_date_from, expiry_date_to, ...rest } = filters;
      if (type === 'production') {
        setFilters(rest);
      } else {
        setFilters({ ...rest, production_date_from, production_date_to });
      }
    }
  };

  // Handle generate report
  const handleGenerateReport = async (batch: Batch) => {
    try {
      message.info('Report generation functionality will be implemented');
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    }
  };

  // Handle edit
  const handleEdit = (batch: Batch) => {
    navigate(`/batches/${batch.id}/edit`);
  };

  // Handle delete
  const handleDelete = async (batchId: string) => {
    try {
      const response = await BatchService.deleteBatch(batchId);
      if (response.success) {
        message.success('Batch deleted successfully');
        loadBatches();
      } else {
        message.error(response.message || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      message.error('Failed to delete batch');
    }
  };

  // Handle create new batch
  const handleCreateNew = () => {
    navigate('/batches/new');
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchText('');
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select batches to delete');
      return;
    }

    try {
      const response = await BatchService.bulkDelete(selectedRowKeys);
      if (response.success) {
        message.success(`${selectedRowKeys.length} batches deleted successfully`);
        setSelectedRowKeys([]);
        loadBatches();
      } else {
        message.error(response.message || 'Failed to delete batches');
      }
    } catch (error) {
      console.error('Error deleting batches:', error);
      message.error('Failed to delete batches');
    }
  };

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
    getCheckboxProps: (record: Batch) => ({
      disabled: !canDeleteBatch(record),
    }),
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadBatches();
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, []);

  // Get status summary
  const getStatusSummary = () => {
    const planning = batches.filter(b => b.status === 'planning').length;
    const inProduction = batches.filter(b => b.status === 'in_production').length;
    const qualityControl = batches.filter(b => b.status === 'quality_control').length;
    const approved = batches.filter(b => b.status === 'approved').length;
    const released = batches.filter(b => b.status === 'released').length;
    const recalled = batches.filter(b => b.status === 'recalled').length;

    const qualityPassed = batches.filter(b => b.quality_status === 'passed').length;
    const qualityFailed = batches.filter(b => b.quality_status === 'failed').length;
    const qualityPending = batches.filter(b => b.quality_status === 'pending').length;

    return { 
      planning, inProduction, qualityControl, approved, released, recalled,
      qualityPassed, qualityFailed, qualityPending
    };
  };

  const statusSummary = getStatusSummary();

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Batches</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadBatches}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreateBatch() && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateNew}
              >
                Add Batch
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Status Summary */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                {statusSummary.inProduction}
              </div>
              <div style={{ fontSize: 12 }}>In Production</div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                {statusSummary.qualityControl}
              </div>
              <div style={{ fontSize: 12 }}>Quality Control</div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                {statusSummary.approved}
              </div>
              <div style={{ fontSize: 12 }}>Approved</div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>
                {statusSummary.released}
              </div>
              <div style={{ fontSize: 12 }}>Released</div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5222d' }}>
                {statusSummary.recalled}
              </div>
              <div style={{ fontSize: 12 }}>Recalled</div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#13c2c2' }}>
                {batches.length}
              </div>
              <div style={{ fontSize: 12 }}>Total Batches</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input.Search
              placeholder="Search batches..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="Product"
              value={filters.product_id}
              onChange={(value) => handleFilterChange('product_id', value)}
              allowClear
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
              }
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
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
              {BATCH_STATUSES.map(status => (
                <Option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Quality Status"
              value={filters.quality_status}
              onChange={(value) => handleFilterChange('quality_status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {QUALITY_STATUSES.map(status => (
                <Option key={status} value={status}>
                  {status.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
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
            <RangePicker
              placeholder={['Production From', 'Production To']}
              onChange={(dates) => handleDateRangeChange(dates, 'production')}
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
              <span>{selectedRowKeys.length} batches selected</span>
            </Col>
            <Col>
              <Space>
                <Popconfirm
                  title={`Are you sure you want to delete ${selectedRowKeys.length} batches?`}
                  onConfirm={handleBulkDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete Selected
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Batches Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={batches}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={{
              total: batches.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} batches`,
            }}
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Batches;