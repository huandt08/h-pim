import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Select, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { RegisterData, DEPARTMENTS } from '../../types';

const { Text } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await register(values);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = Object.entries(DEPARTMENTS).map(([code, name]) => (
    <Option key={code} value={code}>
      {name} ({code})
    </Option>
  ));

  return (
    <div>
      {error && (
        <Alert
          message="Registration Failed"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      )}

      <Form
        name="register"
        onFinish={handleSubmit}
        autoComplete="off"
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[
            { required: true, message: 'Please input your full name!' },
            { min: 2, message: 'Name must be at least 2 characters!' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter your full name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter your email"
          />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[
            { required: true, message: 'Please select your department!' },
          ]}
        >
          <Select
            placeholder="Select your department"
            suffixIcon={<TeamOutlined />}
          >
            {departmentOptions}
          </Select>
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number!',
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
          />
        </Form.Item>

        <Form.Item
          name="password_confirmation"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm your password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ height: '40px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/auth/login" style={{ fontWeight: 500 }}>
              Sign in here
            </Link>
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default Register;