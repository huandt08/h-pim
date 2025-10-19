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
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Product, ProductFilters, DEPARTMENTS, PRODUCT_STATUSES } from '../../types';
import ProductService from '../../services/product';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  // Table columns
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string, record: Product) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/products/${record.id}`)}
          style={{ padding: 0, height: 'auto' }}
        >
          {code}
        </Button>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      ellipsis: true,
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
        if (!status) return <Tag color="default">Unknown</Tag>;
        
        const colors = {
          active: 'green',
          inactive: 'red',
          pending: 'orange'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance_percentage',
      key: 'compliance_percentage',
      width: 120,
      render: (percentage: number) => {
        if (percentage === null || percentage === undefined) return '-';
        const color = percentage >= 80 ? 'green' : percentage >= 60 ? 'orange' : 'red';
        return <Tag color={color}>{percentage}%</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Product) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/products/${record.id}`)}
            />
          </Tooltip>
          {canEditProduct(record) && (
            <Tooltip title="Edit">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {canDeleteProduct(record) && (
            <Popconfirm
              title="Are you sure you want to delete this product?"
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
  const canEditProduct = (product: Product): boolean => {
    if (!currentUser || !currentUser.department) return false;
    return (
      product.primary_owner_department === currentUser.department ||
      (product.secondary_access_departments?.includes(currentUser.department) || false)
    );
  };

  const canDeleteProduct = (product: Product): boolean => {
    if (!currentUser || !currentUser.department) return false;
    return product.primary_owner_department === currentUser.department;
  };

  const canCreateProduct = (): boolean => {
    return !!currentUser; // All authenticated users can create products
  };

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts(filters);
      
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

  // Handle search
  const handleSearch = () => {
    setFilters({ ...filters, search: searchText });
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    navigate(`/products/${product.id}/edit`);
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    try {
      const response = await ProductService.deleteProduct(productId);
      if (response.success) {
        message.success('Product deleted successfully');
        loadProducts();
      } else {
        message.error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  // Handle create new product
  const handleCreateNew = () => {
    navigate('/products/new');
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchText('');
  };

  // Load products on component mount and when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Products</Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadProducts}
              loading={loading}
            >
              Refresh
            </Button>
            {canCreateProduct() && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateNew}
              >
                Add Product
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Input.Search
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {PRODUCT_STATUSES.map(status => (
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
              placeholder="Compliance Min %"
              value={filters.compliance_min}
              onChange={(value) => handleFilterChange('compliance_min', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value={80}>80%+</Option>
              <Option value={60}>60%+</Option>
              <Option value={40}>40%+</Option>
              <Option value={20}>20%+</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                icon={<FilterOutlined />} 
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={{
              total: products.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} products`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Spin>
      </Card>
    </div>
  );
};

export default Products;