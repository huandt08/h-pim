import { apiCall } from './api';
import { 
  Alert, 
  AlertFilters, 
  ApiResponse 
} from '../types';

export class AlertService {
  // Get all alerts with filters
  static async getAlerts(filters?: AlertFilters): Promise<ApiResponse<Alert[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/alerts${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall<Alert[]>('GET', url);
  }

  // Get single alert
  static async getAlert(id: string): Promise<ApiResponse<Alert>> {
    return await apiCall<Alert>('GET', `/alerts/${id}`);
  }

  // Update alert status
  static async updateStatus(id: string, status: string, resolutionNotes?: string): Promise<ApiResponse<Alert>> {
    return await apiCall<Alert>('PUT', `/alerts/${id}/status`, {
      status,
      resolution_notes: resolutionNotes
    });
  }

  // Resolve alert
  static async resolve(id: string, resolutionNotes: string): Promise<ApiResponse<Alert>> {
    return await apiCall<Alert>('POST', `/alerts/${id}/resolve`, {
      resolution_notes: resolutionNotes
    });
  }

  // Escalate alert
  static async escalate(id: string): Promise<ApiResponse<Alert>> {
    return await apiCall<Alert>('POST', `/alerts/${id}/escalate`);
  }

  // Get alerts dashboard
  static async getDashboard(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/alerts/dashboard');
  }

  // Get critical alerts
  static async getCriticalAlerts(): Promise<ApiResponse<Alert[]>> {
    return await apiCall<Alert[]>('GET', '/alerts/critical');
  }

  // Get overdue alerts
  static async getOverdueAlerts(): Promise<ApiResponse<Alert[]>> {
    return await apiCall<Alert[]>('GET', '/alerts/overdue');
  }

  // Get alert statistics
  static async getStats(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/alerts/stats');
  }

  // Search alerts
  static async searchAlerts(query: string, filters?: Partial<AlertFilters>): Promise<ApiResponse<Alert[]>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    return await apiCall<Alert[]>('GET', `/alerts/search?${params.toString()}`);
  }

  // Get alerts by department
  static async getAlertsByDepartment(departmentCode?: string): Promise<ApiResponse<Alert[]>> {
    const url = departmentCode ? `/alerts/department/${departmentCode}` : '/alerts/department';
    return await apiCall<Alert[]>('GET', url);
  }

  // Get alerts by priority
  static async getAlertsByPriority(priority: string): Promise<ApiResponse<Alert[]>> {
    return await apiCall<Alert[]>('GET', `/alerts/priority/${priority}`);
  }

  // Get alerts by type
  static async getAlertsByType(type: string): Promise<ApiResponse<Alert[]>> {
    return await apiCall<Alert[]>('GET', `/alerts/type/${type}`);
  }

  // Get alert history
  static async getHistory(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/alerts/${id}/history`);
  }

  // Add alert comment
  static async addComment(id: string, comment: string): Promise<ApiResponse<any>> {
    return await apiCall('POST', `/alerts/${id}/comments`, {
      comment
    });
  }

  // Get alert comments
  static async getComments(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/alerts/${id}/comments`);
  }

  // Assign alert to user
  static async assignToUser(id: string, userId: string): Promise<ApiResponse<Alert>> {
    return await apiCall<Alert>('POST', `/alerts/${id}/assign`, {
      user_id: userId
    });
  }

  // Get my assigned alerts
  static async getMyAssignedAlerts(): Promise<ApiResponse<Alert[]>> {
    return await apiCall<Alert[]>('GET', '/alerts/my-assigned');
  }

  // Get department alert summary
  static async getDepartmentSummary(departmentCode?: string): Promise<ApiResponse<any>> {
    const url = departmentCode 
      ? `/alerts/department-summary/${departmentCode}`
      : '/alerts/department-summary';
    return await apiCall('GET', url);
  }

  // Bulk update alerts
  static async bulkUpdate(alertIds: string[], data: any): Promise<ApiResponse<any>> {
    return await apiCall('PUT', '/alerts/bulk-update', {
      alert_ids: alertIds,
      ...data,
    });
  }

  // Bulk resolve alerts
  static async bulkResolve(alertIds: string[], resolutionNotes: string): Promise<ApiResponse<any>> {
    return await apiCall('POST', '/alerts/bulk-resolve', {
      alert_ids: alertIds,
      resolution_notes: resolutionNotes,
    });
  }

  // Get alert metrics
  static async getMetrics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = `/alerts/metrics${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall('GET', url);
  }

  // Export alerts
  static async exportAlerts(format: 'csv' | 'excel' | 'pdf', filters?: AlertFilters): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall('GET', `/alerts/export?${params.toString()}`, null, {
      responseType: 'blob',
    });

    return response as any; // Return blob directly
  }

  // Get alert trends
  static async getTrends(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/alerts/trends?period=${period}`);
  }

  // Get SLA compliance
  static async getSLACompliance(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/alerts/sla-compliance');
  }

  // Create manual alert
  static async createAlert(data: {
    title: string;
    message: string;
    type: string;
    priority: string;
    primary_responsible_department: string;
    secondary_involved_departments?: string[];
    product_id?: string;
    document_id?: string;
    batch_id?: string;
    due_date?: string;
  }): Promise<ApiResponse<Alert>> {
    return await apiCall<Alert>('POST', '/alerts', data);
  }
}

export default AlertService;