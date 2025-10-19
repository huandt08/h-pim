import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Progress,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Switch,
  message,
  Tooltip,
  Row,
  Col,
  Typography,
  Statistic,
  List,
  Alert,
  Spin,
  Divider
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  BugOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { 
  ProductCompletenessService,
  ProductCompletenessResult,
  CompletenessStatistics,
  LowComplianceProduct 
} from '../services/productCompleteness';
import { DEPARTMENTS } from '../types';
import AuthService from '../services/auth';

const { Title, Text } = Typography;
const { Option } = Select;

interface ProductCompletenessProps {
  productId?: string;
  showBatchActions?: boolean;
}

const ProductCompleteness: React.FC<ProductCompletenessProps> = ({ 
  productId, 
  showBatchActions = true 
}) => {
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [statistics, setStatistics] = useState<CompletenessStatistics | null>(null);
  const [lowComplianceProducts, setLowComplianceProducts] = useState<LowComplianceProduct[]>([]);
  const [singleProductResult, setSingleProductResult] = useState<ProductCompletenessResult | null>(null);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const currentUser = AuthService.getCurrentUser();

  // Load statistics
  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await ProductCompletenessService.getStatistics();
      
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        message.error(response.message || 'Không thể tải thống kê completeness');
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      message.error('Không thể tải thống kê completeness');
    } finally {
      setLoading(false);
    }
  };

  // Load low compliance products
  const loadLowComplianceProducts = async (threshold: number = 70) => {
    try {
      const response = await ProductCompletenessService.getLowCompliance(threshold);
      
      if (response.success && response.data) {
        setLowComplianceProducts(response.data);
      } else {
        message.error(response.message || 'Không thể tải danh sách sản phẩm thiếu thông tin');
      }
    } catch (error) {
      console.error('Error loading low compliance products:', error);
      message.error('Không thể tải danh sách sản phẩm thiếu thông tin');
    }
  };

  // Check single product completeness
  const checkSingleProduct = async (id: string) => {
    try {
      setLoading(true);
      const response = await ProductCompletenessService.checkProduct(id);
      
      if (response.success && response.data) {
        setSingleProductResult(response.data);
        message.success('Kiểm tra completeness thành công!');
      } else {
        message.error(response.message || 'Không thể kiểm tra completeness sản phẩm');
      }
    } catch (error) {
      console.error('Error checking product:', error);
      message.error('Không thể kiểm tra completeness sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Handle batch check
  const handleBatchCheck = async (values: any) => {
    try {
      setBatchLoading(true);
      const response = await ProductCompletenessService.batchCheck({
        department: values.department,
        product_ids: values.product_ids,
        generate_alerts: values.generate_alerts
      });
      
      if (response.success && response.data) {
        message.success(`Đã kiểm tra ${response.data.processed} sản phẩm thành công!`);
        setBatchModalVisible(false);
        form.resetFields();
        // Refresh data
        loadStatistics();
        loadLowComplianceProducts();
      } else {
        message.error(response.message || 'Không thể thực hiện kiểm tra hàng loạt');
      }
    } catch (error) {
      console.error('Error in batch check:', error);
      message.error('Không thể thực hiện kiểm tra hàng loạt');
    } finally {
      setBatchLoading(false);
    }
  };

  // Get completion status color
  const getCompletionColor = (score: number): string => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'orange';
    return 'red';
  };

  // Get completion status text
  const getCompletionStatus = (score: number): string => {
    if (score >= 90) return 'Hoàn chỉnh';
    if (score >= 70) return 'Cần cải thiện';
    return 'Chưa hoàn chỉnh';
  };

  // Low compliance products table columns
  const lowComplianceColumns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (dept: string) => (
        <Tag color="blue">
          {DEPARTMENTS[dept as keyof typeof DEPARTMENTS] || dept}
        </Tag>
      ),
    },
    {
      title: 'Điểm completeness',
      dataIndex: 'completeness_score',
      key: 'completeness_score',
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small"
          strokeColor={getCompletionColor(score)}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: 'Trường thiếu',
      dataIndex: 'missing_fields',
      key: 'missing_fields',
      render: (fields: string[]) => (
        <Text>{fields?.length || 0} trường</Text>
      ),
    },
    {
      title: 'Kiểm tra cuối',
      dataIndex: 'last_checked',
      key: 'last_checked',
      render: (date: string) => (
        <Text>{date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa kiểm tra'}</Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: LowComplianceProduct) => (
        <Button
          type="link"
          icon={<PlayCircleOutlined />}
          onClick={() => checkSingleProduct(record.id)}
          loading={loading}
        >
          Kiểm tra ngay
        </Button>
      ),
    },
  ];

  useEffect(() => {
    loadStatistics();
    loadLowComplianceProducts();
  }, []);

  useEffect(() => {
    if (productId) {
      checkSingleProduct(productId);
    }
  }, [productId]);

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <BarChartOutlined /> Kiểm tra Completeness Thông tin Sản phẩm
          </Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => {
                loadStatistics();
                loadLowComplianceProducts();
              }}
              loading={loading}
            >
              Làm mới
            </Button>
            {showBatchActions && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => setBatchModalVisible(true)}
              >
                Kiểm tra hàng loạt
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Statistics Overview */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng sản phẩm"
                value={statistics.total_products}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hoàn chỉnh (≥90%)"
                value={statistics.completed}
                suffix={`(${statistics.completed_percentage}%)`}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Cần cải thiện (50-89%)"
                value={statistics.partial}
                suffix={`(${statistics.partial_percentage}%)`}
                prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chưa hoàn chỉnh (<50%)"
                value={statistics.incomplete}
                suffix={`(${statistics.incomplete_percentage}%)`}
                prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Overall Score */}
      {statistics && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>Điểm trung bình toàn hệ thống</Title>
          <Progress 
            percent={statistics.average_score} 
            strokeColor={getCompletionColor(statistics.average_score)}
            strokeWidth={20}
            format={(percent) => `${percent?.toFixed(2)}%`}
          />
          <Text type="secondary">
            Trạng thái: <Tag color={getCompletionColor(statistics.average_score)}>
              {getCompletionStatus(statistics.average_score)}
            </Tag>
          </Text>
        </Card>
      )}

      {/* Single Product Result */}
      {singleProductResult && (
        <Card style={{ marginBottom: 24 }} title="Kết quả kiểm tra sản phẩm">
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>Điểm completeness</Title>
              <Progress 
                percent={singleProductResult.completeness_score} 
                strokeColor={getCompletionColor(singleProductResult.completeness_score)}
                format={(percent) => `${percent}%`}
              />
            </Col>
            <Col span={12}>
              <Title level={5}>Trạng thái</Title>
              <Tag color={getCompletionColor(singleProductResult.completeness_score)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                {getCompletionStatus(singleProductResult.completeness_score)}
              </Tag>
            </Col>
          </Row>

          {singleProductResult.missing_fields?.length > 0 && (
            <>
              <Divider />
              <Title level={5}>Trường thông tin thiếu ({singleProductResult.missing_fields.length})</Title>
              <List
                size="small"
                dataSource={singleProductResult.missing_fields}
                renderItem={(field) => (
                  <List.Item>
                    <BugOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                    {String(field)}
                  </List.Item>
                )}
              />
            </>
          )}

          {Object.keys(singleProductResult.validation_errors || {}).length > 0 && (
            <>
              <Divider />
              <Title level={5}>Lỗi validation ({Object.keys(singleProductResult.validation_errors).length})</Title>
              <List
                size="small"
                dataSource={Object.entries(singleProductResult.validation_errors)}
                renderItem={([field, errors]) => (
                  <List.Item>
                    <ExclamationCircleOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                    <strong>{String(field)}:</strong> {Array.isArray(errors) ? errors.join(', ') : String(errors)}
                  </List.Item>
                )}
              />
            </>
          )}
        </Card>
      )}

      {/* Low Compliance Products */}
      <Card title="Sản phẩm cần cải thiện thông tin" style={{ marginBottom: 24 }}>
        {lowComplianceProducts.length > 0 ? (
          <Table
            columns={lowComplianceColumns}
            dataSource={lowComplianceProducts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        ) : (
          <Alert
            message="Tuyệt vời!"
            description="Không có sản phẩm nào cần cải thiện thông tin. Tất cả sản phẩm đều có mức độ hoàn thiện tốt."
            type="success"
            showIcon
          />
        )}
      </Card>

      {/* Batch Check Modal */}
      <Modal
        title="Kiểm tra completeness hàng loạt"
        open={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBatchCheck}
          initialValues={{
            generate_alerts: true
          }}
        >
          <Form.Item
            name="department"
            label="Phòng ban"
            tooltip="Chỉ kiểm tra sản phẩm của phòng ban được chọn. Để trống để kiểm tra tất cả."
          >
            <Select placeholder="Chọn phòng ban (tùy chọn)" allowClear>
              {Object.entries(DEPARTMENTS).map(([code, name]) => (
                <Option key={code} value={code}>
                  {String(name)} ({code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="generate_alerts"
            label="Tạo cảnh báo"
            tooltip="Tự động tạo cảnh báo cho các sản phẩm có mức độ hoàn thiện thấp"
          >
            <Switch 
              checkedChildren="Có" 
              unCheckedChildren="Không" 
            />
          </Form.Item>

          <Alert
            message="Lưu ý"
            description={
              currentUser?.department 
                ? `Bạn sẽ kiểm tra sản phẩm ${form.getFieldValue('department') ? `của phòng ban ${DEPARTMENTS[form.getFieldValue('department') as keyof typeof DEPARTMENTS]}` : 'của tất cả phòng ban'}. Quá trình này có thể mất vài phút.`
                : "Quá trình kiểm tra hàng loạt có thể mất vài phút tùy thuộc vào số lượng sản phẩm."
            }
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBatchModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={batchLoading}
                icon={<PlayCircleOutlined />}
              >
                Bắt đầu kiểm tra
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductCompleteness;