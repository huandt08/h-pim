import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Space, 
  Modal, 
  Form, 
  message, 
  Tag, 
  Row, 
  Col, 
  Spin, 
  Tooltip, 
  Popconfirm, 
  Descriptions, 
  Timeline, 
  Progress, 
  Table, 
  Input, 
  Select, 
  InputNumber, 
  Upload, 
  DatePicker,
  Badge,
  Divider,
  Alert,
  Tabs,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined, 
  ClockCircleOutlined, 
  QrcodeOutlined, 
  UploadOutlined, 
  FileTextOutlined, 
  HistoryOutlined, 
  SafetyOutlined, 
  BarChartOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  AlertOutlined,
  RocketOutlined,
  StopOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Batch, QualityTest, BatchHistory, DEPARTMENTS, BATCH_STATUSES, QUALITY_STATUSES } from '../../types';
import BatchService from '../../services/batch';
import AuthService from '../../services/auth';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface QualityTestFormData {
  test_type: string;
  test_date: string;
  result: string;
  notes?: string;
  attachments?: any[];
}

const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [qualityTests, setQualityTests] = useState<QualityTest[]>([]);
  const [batchHistory, setBatchHistory] = useState<BatchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [qualityTestModalVisible, setQualityTestModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [qualityForm] = Form.useForm();
  const [approvalForm] = Form.useForm();
  const currentUser = AuthService.getCurrentUser();

  // Permission checks
  const canEditBatch = (): boolean => {
    if (!batch || !currentUser || !currentUser.department) return false;
    return (
      batch.primary_owner_department === currentUser.department ||
      (batch.secondary_access_departments?.includes(currentUser.department) || false)
    );
  };

  const canDeleteBatch = (): boolean => {
    if (!batch || !currentUser || !currentUser.department) return false;
    return batch.primary_owner_department === currentUser.department;
  };

  const canApprove = (): boolean => {
    if (!batch || !currentUser) return false;
    return (
      batch.status === 'quality_control' &&
      batch.quality_status === 'passed' &&
      canEditBatch()
    );
  };

  const canRecall = (): boolean => {
    if (!batch || !currentUser) return false;
    return (
      batch.status === 'released' &&
      canEditBatch()
    );
  };

  // Load batch data
  const loadBatch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await BatchService.getBatch(id);
      
      if (response.success && response.data) {
        setBatch(response.data);
      } else {
        message.error(response.message || 'Failed to load batch');
      }
    } catch (error) {
      console.error('Error loading batch:', error);
      message.error('Failed to load batch');
    } finally {
      setLoading(false);
    }
  };

  // Load quality tests
  const loadQualityTests = async () => {
    if (!id) return;
    
    try {
      const response = await BatchService.getQualityTests(id);
      if (response.success && response.data) {
        setQualityTests(response.data);
      }
    } catch (error) {
      console.error('Error loading quality tests:', error);
    }
  };

  // Load batch history
  const loadBatchHistory = async () => {
    if (!id) return;
    
    try {
      const response = await BatchService.getBatchHistory(id);
      if (response.success && response.data) {
        setBatchHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading batch history:', error);
    }
  };

  // Handle quality test submission
  const handleQualityTestSubmit = async (values: QualityTestFormData) => {
    if (!id) return;
    
    try {
      const response = await BatchService.addQualityTest(id, values);
      if (response.success) {
        message.success('Quality test added successfully');
        setQualityTestModalVisible(false);
        qualityForm.resetFields();
        loadQualityTests();
        loadBatch(); // Reload to get updated quality status
      } else {
        message.error(response.message || 'Failed to add quality test');
      }
    } catch (error) {
      console.error('Error adding quality test:', error);
      message.error('Failed to add quality test');
    }
  };

  // Handle batch approval
  const handleApproval = async (values: { notes?: string }) => {
    if (!id) return;
    
    try {
      const response = await BatchService.approveBatch(id, values.notes);
      if (response.success) {
        message.success('Batch approved successfully');
        setApprovalModalVisible(false);
        approvalForm.resetFields();
        loadBatch();
        loadBatchHistory();
      } else {
        message.error(response.message || 'Failed to approve batch');
      }
    } catch (error) {
      console.error('Error approving batch:', error);
      message.error('Failed to approve batch');
    }
  };

  // Handle batch rejection
  const handleRejection = async (reason: string) => {
    if (!id) return;
    
    try {
      const response = await BatchService.rejectBatch(id, reason);
      if (response.success) {
        message.success('Batch rejected successfully');
        loadBatch();
        loadBatchHistory();
      } else {
        message.error(response.message || 'Failed to reject batch');
      }
    } catch (error) {
      console.error('Error rejecting batch:', error);
      message.error('Failed to reject batch');
    }
  };

  // Handle batch recall
  const handleRecall = async (reason: string) => {
    if (!id) return;
    
    try {
      const response = await BatchService.recallBatch(id, reason);
      if (response.success) {
        message.success('Batch recalled successfully');
        loadBatch();
        loadBatchHistory();
      } else {
        message.error(response.message || 'Failed to recall batch');
      }
    } catch (error) {
      console.error('Error recalling batch:', error);
      message.error('Failed to recall batch');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    
    try {
      const response = await BatchService.updateBatchStatus(id, newStatus);
      if (response.success) {
        message.success('Status updated successfully');
        loadBatch();
        loadBatchHistory();
      } else {
        message.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  // Handle generate QR code
  const handleGenerateQR = async () => {
    if (!id) return;
    
    try {
      const response = await BatchService.generateQRCode(id);
      if (response.success) {
        message.success('QR code generated successfully');
        // Handle QR code display/download
      } else {
        message.error(response.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      message.error('Failed to generate QR code');
    }
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    if (!id) return;
    
    try {
      const response = await BatchService.generateReport(id);
      if (response.success) {
        message.success('Report generated successfully');
        // Handle report download
      } else {
        message.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const response = await BatchService.deleteBatch(id);
      if (response.success) {
        message.success('Batch deleted successfully');
        navigate('/batches');
      } else {
        message.error(response.message || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      message.error('Failed to delete batch');
    }
  };

  // Quality tests table columns
  const qualityTestColumns = [
    {
      title: 'Test Type',
      dataIndex: 'test_type',
      key: 'test_type',
    },
    {
      title: 'Test Date',
      dataIndex: 'test_date',
      key: 'test_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => {
        if (!result) return <Tag color="default">Unknown</Tag>;
        
        const colors = {
          passed: 'success',
          failed: 'error',
          conditional: 'warning'
        };
        return <Tag color={colors[result as keyof typeof colors]}>{result.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Tested By',
      dataIndex: 'tested_by',
      key: 'tested_by',
      render: (user: any) => user?.name || '-',
    },
  ];

  // Load data on component mount
  useEffect(() => {
    if (id) {
      loadBatch();
      loadQualityTests();
      loadBatchHistory();
    }
  }, [id]);

  if (!batch) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'default';
    
    const colors = {
      planning: 'blue',
      in_production: 'processing',
      quality_control: 'warning',
      approved: 'success',
      released: 'green',
      recalled: 'error',
      incoming: 'blue',
      stored: 'green',
      shipped: 'orange',
      expired: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getQualityStatusColor = (status?: string) => {
    if (!status) return 'default';
    
    const colors = {
      pending: 'default',
      passed: 'success',
      failed: 'error',
      conditional: 'warning'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  // Check if batch is expiring soon
  const isExpiringSoon = batch.expiry_date && 
    dayjs(batch.expiry_date).isBefore(dayjs().add(30, 'days')) &&
    dayjs(batch.expiry_date).isAfter(dayjs());

  const isExpired = batch.expiry_date && dayjs(batch.expiry_date).isBefore(dayjs());

  return (
    <div>
      <Spin spinning={loading}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/batches')}
              >
                Back to Batches
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                <Space>
                  <QrcodeOutlined />
                  {batch.batch_number}
                </Space>
              </Title>
              <Tag color={getStatusColor(batch.status)}>
                {batch.status ? batch.status.replace('_', ' ').toUpperCase() : 'Unknown'}
              </Tag>
              <Tag color={getQualityStatusColor(batch.quality_status)}>
                {batch.quality_status ? batch.quality_status.toUpperCase() : 'Unknown'}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<QrcodeOutlined />} 
                onClick={handleGenerateQR}
              >
                QR Code
              </Button>
              <Button 
                icon={<FileTextOutlined />} 
                onClick={handleGenerateReport}
              >
                Report
              </Button>
              {canEditBatch() && (
                <Button 
                  icon={<EditOutlined />} 
                  onClick={() => navigate(`/batches/${id}/edit`)}
                >
                  Edit
                </Button>
              )}
              {canDeleteBatch() && (
                <Popconfirm
                  title="Are you sure you want to delete this batch?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>

        {/* Alerts */}
        {isExpired && (
          <Alert
            type="error"
            message="Batch Expired"
            description={`This batch expired on ${dayjs(batch.expiry_date).format('DD/MM/YYYY')}`}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {isExpiringSoon && (
          <Alert
            type="warning"
            message="Batch Expiring Soon"
            description={`This batch will expire on ${dayjs(batch.expiry_date).format('DD/MM/YYYY')}`}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {batch.status === 'recalled' && (
          <Alert
            type="error"
            message="Batch Recalled"
            description="This batch has been recalled and should not be distributed"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Status Actions */}
        {canEditBatch() && (
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col>
                <Text strong>Status Actions:</Text>
              </Col>
              {batch.status === 'planning' && (
                <Col>
                  <Button 
                    type="primary" 
                    icon={<RocketOutlined />}
                    onClick={() => handleStatusUpdate('in_production')}
                  >
                    Start Production
                  </Button>
                </Col>
              )}
              {batch.status === 'in_production' && (
                <Col>
                  <Button 
                    type="primary" 
                    icon={<SafetyOutlined />}
                    onClick={() => handleStatusUpdate('quality_control')}
                  >
                    Submit for Quality Control
                  </Button>
                </Col>
              )}
              {batch.status === 'quality_control' && (
                <Col>
                  <Button 
                    icon={<UploadOutlined />}
                    onClick={() => setQualityTestModalVisible(true)}
                  >
                    Add Quality Test
                  </Button>
                </Col>
              )}
              {canApprove() && (
                <Col>
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    onClick={() => setApprovalModalVisible(true)}
                  >
                    Approve Batch
                  </Button>
                </Col>
              )}
              {batch.status === 'quality_control' && canEditBatch() && (
                <Col>
                  <Popconfirm
                    title="Please provide rejection reason"
                    description={
                      <Input.TextArea 
                        placeholder="Rejection reason..."
                        onChange={(e) => handleRejection(e.target.value)}
                      />
                    }
                    onConfirm={() => {}}
                    okText="Reject"
                    cancelText="Cancel"
                  >
                    <Button danger icon={<CloseCircleOutlined />}>
                      Reject Batch
                    </Button>
                  </Popconfirm>
                </Col>
              )}
              {batch.status === 'approved' && canEditBatch() && (
                <Col>
                  <Button 
                    type="primary" 
                    icon={<SyncOutlined />}
                    onClick={() => handleStatusUpdate('released')}
                  >
                    Release Batch
                  </Button>
                </Col>
              )}
              {canRecall() && (
                <Col>
                  <Popconfirm
                    title="Please provide recall reason"
                    description={
                      <Input.TextArea 
                        placeholder="Recall reason..."
                        onChange={(e) => handleRecall(e.target.value)}
                      />
                    }
                    onConfirm={() => {}}
                    okText="Recall"
                    cancelText="Cancel"
                  >
                    <Button danger icon={<StopOutlined />}>
                      Recall Batch
                    </Button>
                  </Popconfirm>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultActiveKey="details">
          <TabPane tab="Details" key="details">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Basic Information">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Batch Number">
                      {batch.batch_number}
                    </Descriptions.Item>
                    <Descriptions.Item label="Product">
                      {batch.product?.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Product Code">
                      {batch.product?.code || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quantity">
                      {batch.quantity?.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Unit">
                      {batch.unit || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={getStatusColor(batch.status)}>
                        {batch.status ? batch.status.replace('_', ' ').toUpperCase() : 'Unknown'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Quality Status">
                      <Tag color={getQualityStatusColor(batch.quality_status)}>
                        {batch.quality_status ? batch.quality_status.toUpperCase() : 'Unknown'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Dates & Ownership">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Production Date">
                      {dayjs(batch.production_date).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Expiry Date">
                      {batch.expiry_date ? dayjs(batch.expiry_date).format('DD/MM/YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Primary Owner">
                      <Tag color="blue">
                        {DEPARTMENTS[batch.primary_owner_department as keyof typeof DEPARTMENTS] || batch.primary_owner_department}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Secondary Access">
                      {batch.secondary_access_departments?.map(dept => (
                        <Tag key={dept} color="cyan">
                          {DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}
                        </Tag>
                      )) || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created By">
                      {batch.created_by?.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {dayjs(batch.created_at).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {batch.notes && (
              <Card title="Notes" style={{ marginTop: 16 }}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{batch.notes}</p>
              </Card>
            )}
          </TabPane>

          <TabPane tab="Quality Tests" key="quality">
            <Card
              title="Quality Tests"
              extra={
                canEditBatch() && batch.status === 'quality_control' && (
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />}
                    onClick={() => setQualityTestModalVisible(true)}
                  >
                    Add Test
                  </Button>
                )
              }
            >
              {qualityTests.length > 0 ? (
                <Table
                  columns={qualityTestColumns}
                  dataSource={qualityTests}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty 
                  description="No quality tests recorded yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab="History" key="history">
            <Card title="Batch History">
              {batchHistory.length > 0 ? (
                <Timeline>
                  {batchHistory.map((entry, index) => (
                    <Timeline.Item
                      key={index}
                      color={entry.action.includes('approved') ? 'green' : 
                             entry.action.includes('rejected') || entry.action.includes('recalled') ? 'red' : 'blue'}
                    >
                      <div>
                        <strong>{entry.action}</strong>
                        <br />
                        <Text type="secondary">
                          {dayjs(entry.created_at).format('DD/MM/YYYY HH:mm')} by {entry.user?.name}
                        </Text>
                        {entry.notes && (
                          <div style={{ marginTop: 4 }}>
                            <Text style={{ fontStyle: 'italic' }}>{entry.notes}</Text>
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty 
                  description="No history available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>
        </Tabs>

        {/* Quality Test Modal */}
        <Modal
          title="Add Quality Test"
          open={qualityTestModalVisible}
          onCancel={() => {
            setQualityTestModalVisible(false);
            qualityForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={qualityForm}
            layout="vertical"
            onFinish={handleQualityTestSubmit}
          >
            <Form.Item
              name="test_type"
              label="Test Type"
              rules={[{ required: true, message: 'Please enter test type' }]}
            >
              <Input placeholder="e.g., Chemical Analysis, Physical Inspection" />
            </Form.Item>

            <Form.Item
              name="test_date"
              label="Test Date"
              rules={[{ required: true, message: 'Please select test date' }]}
            >
              <DatePicker 
                showTime 
                style={{ width: '100%' }}
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>

            <Form.Item
              name="result"
              label="Result"
              rules={[{ required: true, message: 'Please select result' }]}
            >
              <Select placeholder="Select test result">
                <Option value="passed">Passed</Option>
                <Option value="failed">Failed</Option>
                <Option value="conditional">Conditional</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea 
                rows={4} 
                placeholder="Additional notes about the test..."
              />
            </Form.Item>

            <Form.Item
              name="attachments"
              label="Attachments"
            >
              <Upload
                multiple
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Files</Button>
              </Upload>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={() => {
                    setQualityTestModalVisible(false);
                    qualityForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Add Test
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Approval Modal */}
        <Modal
          title="Approve Batch"
          open={approvalModalVisible}
          onCancel={() => {
            setApprovalModalVisible(false);
            approvalForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={approvalForm}
            layout="vertical"
            onFinish={handleApproval}
          >
            <Form.Item
              name="notes"
              label="Approval Notes"
            >
              <TextArea 
                rows={4} 
                placeholder="Additional notes for approval..."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={() => {
                    setApprovalModalVisible(false);
                    approvalForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Approve Batch
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default BatchDetail;