import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Layout, Row, Col, Card, Typography } from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px' }}>
        <Row justify="center" align="middle" style={{ width: '100%', minHeight: '80vh' }}>
          <Col xs={22} sm={16} md={12} lg={8} xl={6}>
            <Card
              style={{
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                  PIM System
                </Title>
                <Text type="secondary">
                  Product Information Management
                </Text>
              </div>
              
              <Outlet />
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  © 2024 PIM System. All rights reserved.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AuthLayout;