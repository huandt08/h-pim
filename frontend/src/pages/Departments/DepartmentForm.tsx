import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Space,
  Row,
  Col,
  Spin,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Department, DepartmentFormData, User } from '../../types';
import DepartmentService from '../../services/department';
import UserService from '../../services/user';
import AuthService from '../../services/auth';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DepartmentForm: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [department, setDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const currentUser = AuthService.getCurrentUser();
  const isEdit = !!code && code !== 'new';

  // Permission checks
  const canManageDepartments = (): boolean => {
    return currentUser?.permissions?.includes('manage_departments') || false;
  };

  // Load department data for editing
  const loadDepartment = async () => {
    if (!isEdit || !code) return;
    
    try {
      setLoading(true);
      const response = await DepartmentService.getDepartment(code);
      
      if (response.success && response.data) {
        const dept = response.data;
        setDepartment(dept);
        
        // Set form values
        form.setFieldsValue({
          code: dept.code,
          name: dept.name,
          description: dept.description,
          manager_id: dept.head_user_id,
          status: dept.status === 'active'
        });
      } else {
        message.error(response.message || 'Failed to load department');
        navigate('/departments');
      }
    } catch (error) {
      console.error('Error loading department:', error);
      message.error('Failed to load department');
      navigate('/departments');
    } finally {
      setLoading(false);
    }
  };

  // Load available users for manager selection
  const loadUsers = async () => {
    try {
      const response = await UserService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load existing departments for parent selection
  const loadDepartments = async () => {
    try {
      const response = await DepartmentService.getDepartments();
      if (response.success && response.data) {
        // Filter out current department to prevent circular reference
        const filteredDepts = isEdit 
          ? response.data.filter(d => d.code !== code)
          : response.data;
        setDepartments(filteredDepts);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (!canManageDepartments()) {
      message.error('You do not have permission to manage departments');
      return;
    }

    try {
      setSubmitting(true);

      const formData: DepartmentFormData = {
        code: values.code,
        name: values.name,
        description: values.description,
        manager_id: values.manager_id,
        parent_department: values.parent_department,
        status: values.status ? 'active' : 'inactive'
      };

      let response;
      if (isEdit && code) {
        response = await DepartmentService.updateDepartment(code, formData);
      } else {
        response = await DepartmentService.createDepartment(formData);
      }

      if (response.success) {
        message.success(`Department ${isEdit ? 'updated' : 'created'} successfully`);
        navigate('/departments');
      } else {
        message.error(response.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} department`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form validation failure
  const handleSubmitFailed = (errorInfo: any) => {
    console.log('Form validation failed:', errorInfo);
    message.error('Please fix the form errors before submitting');
  };

  // Generate department code automatically
  const generateDepartmentCode = (name: string) => {
    if (!name || isEdit) return;
    
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(' ')
      .map(word => word.substring(0, 3))
      .join('')
      .substring(0, 10);
    
    form.setFieldValue('code', code);
  };

  // Load data on component mount
  useEffect(() => {
    if (!canManageDepartments()) {
      message.error('You do not have permission to access this page');
      navigate('/departments');
      return;
    }

    loadUsers();
    loadDepartments();
    
    if (isEdit) {
      loadDepartment();
    }
  }, [code, isEdit]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/departments')}
            >
              Back to Departments
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {isEdit ? `Edit Department: ${department?.name}` : 'Create New Department'}
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
          onFinishFailed={handleSubmitFailed}
          autoComplete="off"
          initialValues={{
            status: true // Default to active
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Department Code"
                name="code"
                rules={[
                  { required: true, message: 'Please enter department code' },
                  { 
                    pattern: /^[A-Z0-9_]+$/, 
                    message: 'Code can only contain uppercase letters, numbers, and underscores' 
                  },
                  { max: 10, message: 'Code cannot exceed 10 characters' }
                ]}
              >
                <Input 
                  placeholder="e.g., MKTG, DEV, HR"
                  disabled={isEdit}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Department Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter department name' },
                  { max: 100, message: 'Name cannot exceed 100 characters' }
                ]}
              >
                <Input 
                  placeholder="Enter department name"
                  onChange={(e) => generateDepartmentCode(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' }
            ]}
          >
            <TextArea 
              placeholder="Enter department description..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Divider>Department Configuration</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Department Manager"
                name="manager_id"
                help="Select a user to be the department manager"
              >
                <Select
                  placeholder="Select department manager"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    users.find(u => u.id === option?.value)?.name?.toLowerCase().includes(input.toLowerCase()) || false
                  }
                >
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      <Space>
                        <UserOutlined />
                        <span>{user.name}</span>
                        <Text type="secondary">({user.email})</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Parent Department"
                name="parent_department"
                help="Optional: Select a parent department for hierarchical structure"
              >
                <Select
                  placeholder="Select parent department (optional)"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    departments.find(d => d.code === option?.value)?.name?.toLowerCase().includes(input.toLowerCase()) || false
                  }
                >
                  {departments.map(dept => (
                    <Option key={dept.code} value={dept.code}>
                      <Space>
                        <TeamOutlined />
                        <span>{dept.name}</span>
                        <Text type="secondary">({dept.code})</Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Status & Settings</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                valuePropName="checked"
                help="Active departments are visible to all users"
              >
                <Switch 
                  checkedChildren="Active" 
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Advanced Settings Section */}
          <Card 
            title={
              <Space>
                <SettingOutlined />
                <span>Advanced Settings</span>
              </Space>
            }
            size="small"
            style={{ marginTop: 16, backgroundColor: '#fafafa' }}
          >
            <Text type="secondary">
              Additional department settings will be available after creation. 
              You can configure permissions, workflows, and integration settings 
              from the department detail page.
            </Text>
          </Card>

          {/* Submit Buttons */}
          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
                size="large"
              >
                {isEdit ? 'Update Department' : 'Create Department'}
              </Button>
              <Button 
                onClick={() => navigate('/departments')}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DepartmentForm;