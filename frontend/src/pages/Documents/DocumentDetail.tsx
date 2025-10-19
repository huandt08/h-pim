import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Descriptions, 
  Space, 
  Button, 
  Tag, 
  Row, 
  Col, 
  Spin, 
  message,
  Tabs,
  List,
  Badge,
  Divider,
  Upload,
  Modal,
  Form,
  Input,
  DatePicker,
  Alert,
  Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileTextOutlined,
  AlertOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, DEPARTMENTS, DOCUMENT_TYPES } from '../../types';
import DocumentService from '../../services/document';
import AuthService from '../../services/auth';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const currentUser = AuthService.getCurrentUser();

  // Load document details
  const loadDocument = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await DocumentService.getDocument(id);
      
      if (response.success && response.data) {
        setDocument(response.data);
      } else {
        message.error(response.message || 'Failed to load document');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      message.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  // Load document versions
  const loadVersions = async () => {
    if (!id) return;
    
    try {
      const response = await DocumentService.getVersions(id);
      if (response.success && response.data) {
        setVersions(response.data);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  // Load document alerts
  const loadAlerts = async () => {
    if (!id) return;
    
    try {
      const response = await DocumentService.getDocumentAlerts(id);
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Load document history
  const loadHistory = async () => {
    if (!id) return;
    
    try {
      const response = await DocumentService.getHistory(id);
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Permission checks
  const canEdit = (): boolean => {
    if (!currentUser || !document) return false;
    return (
      document.primary_owner_department === currentUser.department ||
      document.secondary_access_departments?.includes(currentUser.department)
    );
  };

  const canDelete = (): boolean => {
    if (!currentUser || !document) return false;
    return document.primary_owner_department === currentUser.department;
  };

  const canUpload = (): boolean => {
    return canEdit();
  };

  // Handle download
  const handleDownload = async () => {
    if (!document?.file_path) {
      message.warning('No file available for download');
      return;
    }
    
    try {
      message.info('Download functionality will be implemented with file management');
    } catch (error) {
      console.error('Error downloading document:', error);
      message.error('Failed to download document');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const response = await DocumentService.deleteDocument(id);
      if (response.success) {
        message.success('Document deleted successfully');
        navigate('/documents');
      } else {
        message.error(response.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      message.error('Failed to delete document');
    }
  };

  // Handle file upload
  const handleUpload = async (values: any) => {
    if (!id) return;
    
    try {
      // This would integrate with file upload service
      message.success('File upload functionality will be implemented');
      setUploadModalVisible(false);
      uploadForm.resetFields();
      loadVersions();
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDocument();
    loadVersions();
    loadAlerts();
    loadHistory();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Title level={4}>Document not found</Title>
        <Button type="primary" onClick={() => navigate('/documents')}>
          Back to Documents
        </Button>
      </div>
    );
  }

  const statusColors = {
    active: 'green',
    inactive: 'red',
    expired: 'volcano'
  };

  const isExpired = document.expiry_date && dayjs(document.expiry_date).isBefore(dayjs());
  const isExpiringSoon = document.expiry_date && 
    dayjs(document.expiry_date).isBefore(dayjs().add(30, 'days')) && 
    !isExpired;

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/documents')}
            >
              Back
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {document.title}
            </Title>
            <Tag color={statusColors[document.status as keyof typeof statusColors]}>
              {document.status.toUpperCase()}
            </Tag>
            {isExpired && (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                EXPIRED
              </Tag>
            )}
            {isExpiringSoon && (
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                EXPIRING SOON
              </Tag>
            )}
          </Space>
        </Col>
        <Col>
          <Space>
            {document.file_path && (
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                Download
              </Button>
            )}
            {canUpload() && (
              <Button 
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
              >
                Upload New Version
              </Button>
            )}
            {canEdit() && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/documents/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDelete() && (
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Alert for expired/expiring documents */}
      {(isExpired || isExpiringSoon) && (
        <Alert
          message={isExpired ? "Document Expired" : "Document Expiring Soon"}
          description={
            isExpired 
              ? `This document expired on ${dayjs(document.expiry_date).format('DD/MM/YYYY')}`
              : `This document will expire on ${dayjs(document.expiry_date).format('DD/MM/YYYY')}`
          }
          type={isExpired ? "error" : "warning"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={24}>
        {/* Main Content */}
        <Col span={16}>
          <Card>
            <Tabs defaultActiveKey="details">
              <TabPane tab="Document Details" key="details">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Document Type">
                    <Tag color="blue">
                      {DOCUMENT_TYPES.includes(document.type as any) 
                        ? document.type.replace('_', ' ').toUpperCase()
                        : document.type
                      }
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Version">
                    <Tag>{document.version}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={statusColors[document.status as keyof typeof statusColors]}>
                      {document.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="File Size">
                    {document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Primary Owner">
                    <Tag color="blue">
                      {DEPARTMENTS[document.primary_owner_department as keyof typeof DEPARTMENTS] || document.primary_owner_department}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Secondary Access">
                    <Space wrap>
                      {(Array.isArray(document.secondary_access_departments) ? document.secondary_access_departments : [])?.map(dept => (
                        <Tag key={dept} color="green">
                          {DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}
                        </Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                  {document.issued_date && (
                    <Descriptions.Item label="Issued Date">
                      {dayjs(document.issued_date).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                  )}
                  {document.expiry_date && (
                    <Descriptions.Item label="Expiry Date">
                      <span style={{ 
                        color: isExpired ? 'red' : isExpiringSoon ? 'orange' : 'inherit' 
                      }}>
                        {dayjs(document.expiry_date).format('DD/MM/YYYY')}
                      </span>
                    </Descriptions.Item>
                  )}
                  {document.issuing_authority && (
                    <Descriptions.Item label="Issuing Authority" span={2}>
                      {document.issuing_authority}
                    </Descriptions.Item>
                  )}
                  {document.certificate_number && (
                    <Descriptions.Item label="Certificate Number" span={2}>
                      {document.certificate_number}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {document.description && (
                  <>
                    <Divider />
                    <Title level={4}>Description</Title>
                    <Paragraph>{document.description}</Paragraph>
                  </>
                )}

                {document.compliance_standards && document.compliance_standards.length > 0 && (
                  <>
                    <Divider />
                    <Title level={4}>Compliance Standards</Title>
                    <Space wrap>
                      {document.compliance_standards.map(standard => (
                        <Tag key={standard} color="purple">{standard}</Tag>
                      ))}
                    </Space>
                  </>
                )}
              </TabPane>

              <TabPane tab={`Versions (${versions.length})`} key="versions">
                <List
                  dataSource={versions}
                  renderItem={(version: any) => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<DownloadOutlined />}>
                          Download
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={`Version ${version.version}`}
                        description={
                          <Space direction="vertical" size="small">
                            <div>
                              <Text type="secondary">
                                Uploaded: {dayjs(version.created_at).format('DD/MM/YYYY HH:mm')}
                              </Text>
                            </div>
                            {version.changes_summary && (
                              <div>
                                <Text>{version.changes_summary}</Text>
                              </div>
                            )}
                            <div>
                              <Text type="secondary">
                                Size: {(version.file_size / 1024 / 1024).toFixed(2)} MB
                              </Text>
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab={`Activity History (${history.length})`} key="history">
                <List
                  dataSource={history}
                  renderItem={(activity: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<HistoryOutlined />}
                        title={activity.action}
                        description={
                          <Space direction="vertical" size="small">
                            <div>{activity.description}</div>
                            <Text type="secondary">
                              {dayjs(activity.created_at).format('DD/MM/YYYY HH:mm')} by {activity.user_name}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col span={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Quick Stats */}
            <Card title="Quick Info" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      <FileTextOutlined />
                    </div>
                    <div>{versions.length}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Versions</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                      <AlertOutlined />
                    </div>
                    <div>{alerts.length}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Alerts</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                      <CheckCircleOutlined />
                    </div>
                    <div>{document.status === 'active' ? 'Yes' : 'No'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Active</div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Related Product */}
            {document.product && (
              <Card title="Related Product" size="small">
                <Button 
                  type="link" 
                  style={{ padding: 0 }}
                  onClick={() => navigate(`/products/${document.product_id}`)}
                >
                  {document.product.name}
                </Button>
              </Card>
            )}

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <Card title="Recent Alerts" size="small">
                <List
                  size="small"
                  dataSource={alerts.slice(0, 3)}
                  renderItem={(alert: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Badge 
                              status={alert.priority === 'critical' ? 'error' : alert.priority === 'high' ? 'warning' : 'default'} 
                            />
                            {alert.title}
                          </Space>
                        }
                        description={alert.message}
                      />
                    </List.Item>
                  )}
                />
                {alerts.length > 3 && (
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    View all alerts ({alerts.length})
                  </Button>
                )}
              </Card>
            )}

            {/* Timestamps */}
            <Card title="Timeline" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Created">
                  {dayjs(document.created_at).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {dayjs(document.updated_at).format('DD/MM/YYYY')}
                </Descriptions.Item>
                {document.issued_date && (
                  <Descriptions.Item label="Issued">
                    {dayjs(document.issued_date).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                )}
                {document.expiry_date && (
                  <Descriptions.Item label="Expires">
                    <span style={{ 
                      color: isExpired ? 'red' : isExpiringSoon ? 'orange' : 'inherit' 
                    }}>
                      {dayjs(document.expiry_date).format('DD/MM/YYYY')}
                    </span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal
        title="Upload New Version"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => uploadForm.submit()}
        okText="Upload"
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: 'Please enter version number' }]}
          >
            <Input placeholder="e.g., 2.0, 1.1" />
          </Form.Item>
          <Form.Item
            name="changes_summary"
            label="Changes Summary"
          >
            <Input.TextArea rows={3} placeholder="Describe what changed in this version..." />
          </Form.Item>
          <Form.Item
            name="file"
            label="File"
            rules={[{ required: true, message: 'Please select a file' }]}
          >
            <Upload.Dragger>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">Support for single file upload.</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentDetail;