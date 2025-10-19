import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Import providers
import { AuthProvider } from './hooks/useAuth';

// Import components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import ProductDetail from './pages/Products/ProductDetail';
import Documents from './pages/Documents/Documents';
import DocumentDetail from './pages/Documents/DocumentDetail';
import Batches from './pages/Batches/Batches';
import BatchDetail from './pages/Batches/BatchDetail';
import BatchForm from './pages/Batches/BatchForm';
import Users from './pages/Users/Users';
import UserDetail from './pages/Users/UserDetail';
import UserForm from './pages/Users/UserForm';
import Departments from './pages/Departments/Departments';
import DepartmentDetail from './pages/Departments/DepartmentDetail';
import DepartmentForm from './pages/Departments/DepartmentForm';
import DepartmentStatistics from './components/DepartmentStatistics';
import CollaborationMatrix from './components/CollaborationMatrix';
import WorkloadAnalysis from './components/WorkloadAnalysis';
import Alerts from './pages/Alerts/Alerts';
import AlertDetail from './pages/Alerts/AlertDetail';
import AlertForm from './pages/Alerts/AlertForm';
// import Profile from './pages/Profile/Profile';
// import Settings from './pages/Settings/Settings';

// Configure dayjs
dayjs.locale('vi');

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#1890ff',
    },
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Protected routes */}
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard */}
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Products */}
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                
                {/* Documents */}
                <Route path="documents" element={<Documents />} />
                <Route path="documents/:id" element={<DocumentDetail />} />
                
                {/* Batches */}
                <Route path="batches" element={<Batches />} />
                <Route path="batches/new" element={<BatchForm />} />
                <Route path="batches/:id" element={<BatchDetail />} />
                <Route path="batches/:id/edit" element={<BatchForm />} />
                
                {/* Users */}
                <Route path="users" element={<Users />} />
                <Route path="users/new" element={<UserForm />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="users/:id/edit" element={<UserForm />} />
                
                {/* Departments */}
                <Route path="departments" element={<Departments />} />
                <Route path="departments/statistics" element={<DepartmentStatistics />} />
                <Route path="departments/collaboration-matrix" element={<CollaborationMatrix />} />
                <Route path="departments/workload-analysis" element={<WorkloadAnalysis />} />
                <Route path="departments/new" element={<DepartmentForm />} />
                <Route path="departments/:code" element={<DepartmentDetail />} />
                <Route path="departments/:code/edit" element={<DepartmentForm />} />
                
                {/* Alerts */}
                <Route path="alerts" element={<Alerts />} />
                <Route path="alerts/new" element={<AlertForm />} />
                <Route path="alerts/:id" element={<AlertDetail />} />
                <Route path="alerts/edit/:id" element={<AlertForm />} />
                
                {/* Profile & Settings */}
                {/* <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} /> */}
                
                {/* Default redirect */}
                <Route path="" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
