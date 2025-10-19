import { apiCall, setAuthToken, removeAuthToken, setUserData } from './api';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  ApiResponse 
} from '../types';

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiCall<AuthResponse>('POST', '/auth/login', credentials);
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    
    return response;
  }

  // Register user
  static async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiCall<AuthResponse>('POST', '/auth/register', userData);
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      setUserData(response.data.user);
    }
    
    return response;
  }

  // Logout user
  static async logout(): Promise<ApiResponse<null>> {
    const response = await apiCall<null>('POST', '/auth/logout');
    removeAuthToken();
    return response;
  }

  // Logout from all devices
  static async logoutAll(): Promise<ApiResponse<null>> {
    const response = await apiCall<null>('POST', '/auth/logout-all');
    removeAuthToken();
    return response;
  }

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<User>> {
    return await apiCall<User>('GET', '/user/profile');
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return await apiCall<User>('PUT', '/user/profile', data);
  }

  // Change password
  static async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<null>> {
    return await apiCall<null>('PUT', '/user/change-password', data);
  }

  // Get user permissions
  static async getPermissions(): Promise<ApiResponse<{
    direct_permissions: string[];
    role_permissions: string[];
    all_permissions: string[];
    roles: string[];
  }>> {
    return await apiCall('GET', '/user/permissions');
  }

  // Get user dashboard data
  static async getDashboard(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/user/dashboard');
  }

  // Get user activity summary
  static async getActivitySummary(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/user/activity-summary');
  }

  // Get active sessions
  static async getActiveSessions(): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', '/user/active-sessions');
  }

  // Revoke specific session
  static async revokeSession(tokenId: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', `/user/sessions/${tokenId}`);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData);
  }

  // Get current user from local storage
  static getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user has permission
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Check if user has role
  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  // Check if user belongs to department
  static belongsToDepartment(departmentCode: string): boolean {
    const user = this.getCurrentUser();
    return user?.department_code === departmentCode;
  }

  // Get user's department
  static getUserDepartment(): string | null {
    const user = this.getCurrentUser();
    return user?.department_code || null;
  }
}

export default AuthService;