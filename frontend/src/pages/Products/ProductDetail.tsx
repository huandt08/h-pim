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
  Divider
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  FileTextOutlined,
  AlertOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, DEPARTMENTS } from '../../types';
import ProductService from '../../services/product';
import AuthService from '../../services/auth';
import ProductCompleteness from '../../components/ProductCompleteness';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [compliance, setCompliance] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showCompleteness, setShowCompleteness] = useState(false);
  const [completenessLoading, setCompletenessLoading] = useState(false);
  const currentUser = AuthService.getCurrentUser();

  // Load product details
  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await ProductService.getProduct(id);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        message.error(response.message || 'Failed to load product');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Load compliance data
  const loadCompliance = async () => {
    if (!id) return;
    
    try {
      const response = await ProductService.getCompliance(id);
      if (response.success && response.data) {
        setCompliance(response.data);
      }
    } catch (error) {
      console.error('Error loading compliance:', error);
    }
  };

  // Load documents
  const loadDocuments = async () => {
    if (!id) return;
    
    try {
      const response = await ProductService.getProductDocuments(id);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Load alerts
  const loadAlerts = async () => {
    if (!id) return;
    
    try {
      const response = await ProductService.getProductAlerts(id);
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  // Permission checks
  const canEdit = (): boolean => {
    if (!currentUser || !product || !currentUser.department) return false;
    return (
      product.primary_owner_department === currentUser.department ||
      (product.secondary_access_departments?.includes(currentUser.department) || false)
    );
  };

  const canDelete = (): boolean => {
    if (!currentUser || !product || !currentUser.department) return false;
    return product.primary_owner_department === currentUser.department;
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const response = await ProductService.deleteProduct(id);
      if (response.success) {
        message.success('Product deleted successfully');
        navigate('/products');
      } else {
        message.error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadProduct();
    loadCompliance();
    loadDocuments();
    loadAlerts();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Title level={4}>Product not found</Title>
        <Button type="primary" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </div>
    );
  }

  const statusColors = {
    active: 'green',
    inactive: 'red',
    pending: 'orange'
  };

  const complianceColor = (percentage: number) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'orange';
    return 'red';
  };

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/products')}
            >
              Back
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {product?.name || 'Unknown Product'}
            </Title>
            <Tag color={statusColors[product?.status as keyof typeof statusColors] || 'default'}>
              {product?.status ? product.status.toUpperCase() : 'Unknown'}
            </Tag>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              type="default" 
              icon={<PlayCircleOutlined />}
              onClick={() => setShowCompleteness(!showCompleteness)}
              loading={completenessLoading}
            >
              {showCompleteness ? 'Ẩn' : 'Kiểm tra'} Completeness
            </Button>
            {canEdit() && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/products/${id}/edit`)}
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

      <Row gutter={24}>
        {/* Main Info */}
        <Col span={16}>
          <Card title="Product Information">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Product Code">{product?.code || '-'}</Descriptions.Item>
              <Descriptions.Item label="Brand">{product?.brand || '-'}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[product?.status as keyof typeof statusColors] || 'default'}>
                  {product?.status ? product.status.toUpperCase() : 'Unknown'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Compliance">
                {product?.compliance_percentage !== null && product?.compliance_percentage !== undefined ? (
                  <Tag color={complianceColor(product.compliance_percentage)}>
                    {product.compliance_percentage}%
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Primary Owner">
                <Tag color="blue">
                  {DEPARTMENTS[product?.primary_owner_department as keyof typeof DEPARTMENTS] || product?.primary_owner_department || '-'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Secondary Access">
                <Space wrap>
                  {(Array.isArray(product?.secondary_access_departments) ? product.secondary_access_departments : [])?.map(dept => (
                    <Tag key={dept} color="green">
                      {DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}
                    </Tag>
                  ))}
                  {(!product?.secondary_access_departments || product.secondary_access_departments.length === 0) && '-'}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {product.description && (
              <>
                <Divider />
                <Title level={4}>Description</Title>
                <Paragraph>{product.description}</Paragraph>
              </>
            )}

            {product.detailed_description && (
              <>
                <Title level={4}>Detailed Description</Title>
                <Paragraph>{product.detailed_description}</Paragraph>
              </>
            )}

            {product.specifications && (
              <>
                <Title level={4}>Specifications</Title>
                <Paragraph>{product.specifications}</Paragraph>
              </>
            )}

            {product.ingredients && (
              <>
                <Title level={4}>Ingredients</Title>
                <Paragraph>{product.ingredients}</Paragraph>
              </>
            )}

            {product.usage && (
              <>
                <Title level={4}>Usage</Title>
                <Paragraph>{product.usage}</Paragraph>
              </>
            )}

            {product.instructions && (
              <>
                <Title level={4}>Instructions</Title>
                <Paragraph>{product.instructions}</Paragraph>
              </>
            )}

            {product.storage && (
              <>
                <Title level={4}>Storage</Title>
                <Paragraph>{product.storage}</Paragraph>
              </>
            )}

            {product.development_reason && (
              <>
                <Title level={4}>Development Reason</Title>
                <Paragraph>{product.development_reason}</Paragraph>
              </>
            )}

            {product.similar_products && (
              <>
                <Title level={4}>Similar Products</Title>
                <Paragraph>{product.similar_products}</Paragraph>
              </>
            )}

            {product.usp && (
              <>
                <Title level={4}>Unique Selling Points</Title>
                <Paragraph>{product.usp}</Paragraph>
              </>
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col span={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Quick Stats */}
            <Card title="Quick Stats" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      <FileTextOutlined />
                    </div>
                    <div>{documents.length}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Documents</div>
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
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: complianceColor(product?.compliance_percentage || 0) }}>
                      <BarChartOutlined />
                    </div>
                    <div>{product?.compliance_percentage || 0}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Compliance</div>
                  </div>
                </Col>
              </Row>
            </Card>

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
                  {product?.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {product?.updated_at ? new Date(product.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Completeness Check Section */}
      {showCompleteness && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Product Completeness Analysis">
              <ProductCompleteness 
                productId={id} 
                showBatchActions={false}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ProductDetail;