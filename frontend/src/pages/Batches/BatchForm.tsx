import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Space, 
  Form, 
  message, 
  Row, 
  Col, 
  Spin, 
  Input, 
  Select, 
  InputNumber, 
  DatePicker,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { Product, BatchFormData, DEPARTMENTS } from '../../types';
import BatchService from '../../services/batch';
import ProductService from '../../services/product';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BatchForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const currentUser = AuthService.getCurrentUser();

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        message.error(response.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: BatchFormData) => {
    try {
      setSubmitting(true);
      
      // Format dates
      const formattedValues: BatchFormData = {
        ...values,
        production_date: values.production_date ? dayjs(values.production_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        expiry_date: values.expiry_date ? dayjs(values.expiry_date).format('YYYY-MM-DD') : undefined,
        primary_owner_department: currentUser?.department || '',
      };

      const response = await BatchService.createBatch(formattedValues);
      
      if (response.success) {
        message.success('Batch created successfully');
        navigate('/batches');
      } else {
        message.error(response.message || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      message.error('Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate batch number
  const generateBatchNumber = () => {
    const timestamp = dayjs().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BATCH-${timestamp}-${random}`;
  };

  // Auto-generate batch number on component mount
  useEffect(() => {
    form.setFieldsValue({
      batch_number: generateBatchNumber(),
      production_date: dayjs(),
      status: 'planning',
      quality_status: 'pending'
    });
  }, [form]);

  // Load data on component mount
  useEffect(() => {
    loadProducts();
  }, []);

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
                  Create New Batch
                </Space>
              </Title>
            </Space>
          </Col>
        </Row>

        {/* Form */}
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'planning',
              quality_status: 'pending'
            }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="batch_number"
                  label="Batch Number"
                  rules={[{ required: true, message: 'Please enter batch number' }]}
                >
                  <Input
                    placeholder="Batch number will be auto-generated"
                    addonAfter={
                      <Button 
                        type="text" 
                        size="small"
                        onClick={() => form.setFieldsValue({ batch_number: generateBatchNumber() })}
                      >
                        Generate
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="product_id"
                  label="Product"
                  rules={[{ required: true, message: 'Please select a product' }]}
                >
                  <Select
                    placeholder="Select product"
                    showSearch
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                    }
                  >
                    {products.map(product => (
                      <Option key={product.id} value={product.id}>
                        <Space direction="vertical" size="small">
                          <div>{product.name}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>{product.code}</div>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    { type: 'number', min: 1, message: 'Quantity must be greater than 0' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Enter quantity"
                    min={1}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="unit"
                  label="Unit"
                >
                  <Select placeholder="Select unit">
                    <Option value="pcs">Pieces</Option>
                    <Option value="kg">Kilograms</Option>
                    <Option value="liter">Liters</Option>
                    <Option value="meter">Meters</Option>
                    <Option value="box">Boxes</Option>
                    <Option value="pack">Packs</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="production_date"
                  label="Production Date"
                  rules={[{ required: true, message: 'Please select production date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="expiry_date"
                  label="Expiry Date"
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="secondary_access_departments"
                  label="Secondary Access Departments"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select departments with secondary access"
                    allowClear
                  >
                    {Object.entries(DEPARTMENTS)
                      .filter(([code]) => code !== currentUser?.department)
                      .map(([code, name]) => (
                        <Option key={code} value={code}>
                          {name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea 
                rows={4} 
                placeholder="Additional notes about this batch..."
              />
            </Form.Item>

            <Divider />

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Initial Status"
                >
                  <Select disabled>
                    <Option value="planning">Planning</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="quality_status"
                  label="Initial Quality Status"
                >
                  <Select disabled>
                    <Option value="pending">Pending</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Form Actions */}
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button 
                  onClick={() => navigate('/batches')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  Create Batch
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default BatchForm;