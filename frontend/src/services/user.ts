import { apiCall } from './api';
import { 
  User, 
  UserFilters, 
  UserFormData,
  ApiResponse 
} from '../types';

export class UserService {
  // Get all users with filters
  static async getUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    return await apiCall<User[]>('GET', url);
  }

  // Get single user by ID
  static async getUser(id: string): Promise<ApiResponse<User>> {
    return await apiCall<User>('GET', `/users/${id}`);
  }

  // Create new user
  static async createUser(data: UserFormData): Promise<ApiResponse<User>> {
    return await apiCall<User>('POST', '/users', data);
  }

  // Update user
  static async updateUser(id: string, data: Partial<UserFormData>): Promise<ApiResponse<User>> {
    return await apiCall<User>('PUT', `/users/${id}`, data);
  }

  // Delete user
  static async deleteUser(id: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', `/users/${id}`);
  }

  // Bulk delete users
  static async bulkDelete(userIds: string[]): Promise<ApiResponse<null>> {
    return await apiCall<null>('POST', '/users/bulk-delete', { user_ids: userIds });
  }

  // Update user status (activate/deactivate)
  static async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<User>> {
    return await apiCall<User>('PUT', `/users/${id}/status`, { status });
  }

  // Reset user password
  static async resetPassword(id: string): Promise<ApiResponse<{ temporary_password: string }>> {
    return await apiCall<{ temporary_password: string }>('POST', `/users/${id}/reset-password`);
  }

  // Update user profile (self)
  static async updateProfile(data: Partial<UserFormData>): Promise<ApiResponse<User>> {
    return await apiCall<User>('PUT', '/profile', data);
  }

  // Change password (self)
  static async changePassword(data: { 
    current_password: string; 
    new_password: string; 
    new_password_confirmation: string; 
  }): Promise<ApiResponse<null>> {
    return await apiCall<null>('PUT', '/profile/password', data);
  }

  // Get user activities
  static async getUserActivities(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall<any[]>('GET', `/users/${id}/activities`);
  }

  // Get users by department
  static async getUsersByDepartment(department: string): Promise<ApiResponse<User[]>> {
    return await apiCall<User[]>('GET', `/users/department/${department}`);
  }

  // Search users
  static async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return await apiCall<User[]>('GET', `/users/search?q=${encodeURIComponent(query)}`);
  }

  // Get user statistics
  static async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    by_department: Record<string, number>;
    recent_activities: any[];
  }>> {
    return await apiCall('GET', '/users/statistics');
  }

  // Upload user avatar
  static async uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return await apiCall<{ avatar_url: string }>('POST', '/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Remove user avatar
  static async removeAvatar(): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', '/profile/avatar');
  }

  // Assign user to department
  static async assignToDepartment(userId: string, department: string): Promise<ApiResponse<User>> {
    return await apiCall<User>('PUT', `/users/${userId}/department`, { department });
  }

  // Get user permissions
  static async getUserPermissions(id: string): Promise<ApiResponse<string[]>> {
    return await apiCall<string[]>('GET', `/users/${id}/permissions`);
  }

  // Update user permissions
  static async updateUserPermissions(id: string, permissions: string[]): Promise<ApiResponse<User>> {
    return await apiCall<User>('PUT', `/users/${id}/permissions`, { permissions });
  }

  // Send user invitation
  static async sendInvitation(email: string, department: string, role?: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('POST', '/users/invite', { email, department, role });
  }

  // Resend invitation
  static async resendInvitation(userId: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('POST', `/users/${userId}/resend-invitation`);
  }

  // Accept invitation
  static async acceptInvitation(token: string, userData: {
    name: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<User>> {
    return await apiCall<User>('POST', '/users/accept-invitation', { token, ...userData });
  }
}

export default UserService;