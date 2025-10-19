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
  Upload,
  Progress,
  Badge,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Document, DocumentFilters, DEPARTMENTS, DOCUMENT_STATUSES, DOCUMENT_TYPES } from '../../types';
import DocumentService from '../../services/document';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // Table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Document) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/documents/${record.id}`)}
          style={{ padding: 0, height: 'auto', textAlign: 'left' }}
        >
          <Space>
            <FileTextOutlined />
            {title}
          </Space>
        </Button>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag color="blue">{type.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: 150,
      render: (product: any) => product?.name || '-',
      ellipsis: true,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version: string) => <Tag>{version}</Tag>,
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
      title: 'Secondary Access',
      dataIndex: 'secondary_access_departments',
      key: 'secondary_access_departments',
      width: 200,
      render: (depts: string[]) => (
        <Space wrap>
          {(Array.isArray(depts) ? depts : [])?.map(dept => (
            <Tag key={dept} color="green">
              {DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = {
          active: 'green',
          inactive: 'red',
          expired: 'volcano'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
      },
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
      title: 'File Size',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size: number) => {
        if (!size) return '-';
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Document) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/documents/${record.id}`)}
            />
          </Tooltip>
          {record.file_path && (
            <Tooltip title="Download">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => handleDownload(record)}
              />
            </Tooltip>
          )}
          {canEditDocument(record) && (
            <Tooltip title="Edit">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {canDeleteDocument(record) && (
            <Popconfirm
              title="Are you sure you want to delete this document?"
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
  const canEditDocument = (document: Document): boolean => {
    if (!currentUser) return false;
    return (
      document.primary_owner_department === currentUser.department ||
      document.secondary_access_departments?.includes(currentUser.department)
    );
  };

  const canDeleteDocument = (document: Document): boolean => {
    if (!currentUser) return false;
    return document.primary_owner_department === currentUser.department;
  };

  const canCreateDocument = (): boolean => {
    return !!currentUser; // All authenticated users can create documents
  };

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await DocumentService.getDocuments(filters);
      
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        message.error(response.message || 'Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      message.error('Failed to load documents');
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

  // Handle download
  const handleDownload = async (document: Document) => {
    try {
      if (!document.file_path) {
        message.warning('No file available for download');
        return;
      }
      
      // Create download link (this would need file ID from backend)
      message.info('Download functionality will be implemented with file management');
    } catch (error) {
      console.error('Error downloading document:', error);
      message.error('Failed to download document');
    }
  };

  // Handle edit
  const handleEdit = (document: Document) => {
    navigate(`/documents/${document.id}/edit`);
  };

  // Handle delete
  const handleDelete = async (documentId: string) => {
    try {
      const response = await DocumentService.deleteDocument(documentId);
      if (response.success) {
        message.success('Document deleted successfully');
        loadDocuments();
      } else {
        message.error(response.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error('Failed to delete document');
    }
  };

  // Handle create new document
  const handleCreateNew = () => {
    navigate('/documents/new');
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchText('');
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select documents to delete');
      return;
    }

    try {
      const response = await DocumentService.bulkDelete(selectedRowKeys);
      if (response.success) {
        message.success(`${selectedRowKeys.length} documents deleted successfully`);
        setSelectedRowKeys([]);
        loadDocuments();
      } else {
        message.error(response.message || 'Failed to delete documents');
      }
    } catch (error) {
      console.error('Error deleting documents:', error);
      message.error('Failed to delete documents');
    }
  };

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
    getCheckboxProps: (record: Document) => ({
      disabled: !canDeleteDocument(record),
    }),
  };

  // Load documents on component mount and when filters change
  useEffect(() => {
    loadDocuments();
  }, [filters]);

  // Get status summary
  const getStatusSummary = () => {
    const active = documents.filter(d => d.status === 'active').length;
    const expired = documents.filter(d => d.status === 'expired').length;
    const expiringSoon = documents.filter(d => {
      if (!d.expiry_date) return false;
      return dayjs(d.expiry_date).isBefore(dayjs().add(30, 'days')) && d.status === 'active';
    }).length;

    return { active, expired, expiringSoon };
  };

  const statusSummary = getStatusSummary();

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Documents</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadDocuments}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreateDocument() && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateNew}
              >
                Add Document
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Status Summary */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {statusSummary.active}
              </div>
              <div>Active Documents</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                {statusSummary.expiringSoon}
              </div>
              <div>Expiring Soon</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>
                {statusSummary.expired}
              </div>
              <div>Expired</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {documents.length}
              </div>
              <div>Total Documents</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input.Search
              placeholder="Search documents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Document Type"
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {DOCUMENT_TYPES.map(type => (
                <Option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {DOCUMENT_STATUSES.map(status => (
                <Option key={status} value={status}>
                  {status.toUpperCase()}
                </Option>
              ))}
            </Select>
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
          <Col span={4}>
            <Select
              placeholder="Expiring In"
              value={filters.expiry_within_days}
              onChange={(value) => handleFilterChange('expiry_within_days', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={7}>7 days</Option>
              <Option value={30}>30 days</Option>
              <Option value={90}>90 days</Option>
            </Select>
          </Col>
          <Col span={2}>
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
              <span>{selectedRowKeys.length} documents selected</span>
            </Col>
            <Col>
              <Space>
                <Popconfirm
                  title={`Are you sure you want to delete ${selectedRowKeys.length} documents?`}
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

      {/* Documents Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={{
              total: documents.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} documents`,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Documents;