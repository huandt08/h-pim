import api from './api';
import { Alert, AlertFilters, AlertFormData, AlertStatistics, AlertDashboard, ExtendedAlertFilters, ApiResponse } from '../types';

class AlertService {
  private readonly baseURL = '/alerts';

  // Get all alerts with filters
  async getAllAlerts(filters?: ExtendedAlertFilters): Promise<ApiResponse<Alert[]>> {
    const params = new URLSearchParams();
    
    if (filters?.department) params.append('department', filters.department);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.overdue_only) params.append('overdue_only', 'true');
    if (filters?.my_alerts_only) params.append('my_alerts_only', 'true');
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`${this.baseURL}?${params.toString()}`);
    return response.data;
  }

  // Get alert by ID
  async getAlertById(id: string): Promise<ApiResponse<Alert>> {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Create new alert
  async createAlert(data: AlertFormData): Promise<ApiResponse<Alert>> {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  // Update alert
  async updateAlert(id: string, data: Partial<AlertFormData>): Promise<ApiResponse<Alert>> {
    const response = await api.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Delete alert
  async deleteAlert(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Resolve alert
  async resolveAlert(id: string, resolutionNotes?: string): Promise<ApiResponse<Alert>> {
    const response = await api.post(`${this.baseURL}/${id}/resolve`, {
      resolution_notes: resolutionNotes
    });
    return response.data;
  }

  // Update alert status
  async updateStatus(id: string, status: string, resolutionNotes?: string): Promise<ApiResponse<Alert>> {
    const response = await api.patch(`${this.baseURL}/${id}/status`, {
      status,
      resolution_notes: resolutionNotes
    });
    return response.data;
  }

  // Escalate alert
  async escalateAlert(id: string): Promise<ApiResponse<Alert>> {
    const response = await api.post(`${this.baseURL}/${id}/escalate`);
    return response.data;
  }

  // Get alert dashboard data
  async getDashboard(): Promise<ApiResponse<AlertDashboard>> {
    const response = await api.get(`${this.baseURL}/dashboard`);
    return response.data;
  }

  // Get alert statistics
  async getStatistics(department?: string): Promise<ApiResponse<AlertStatistics>> {
    const params = department ? `?department=${department}` : '';
    const response = await api.get(`${this.baseURL}/statistics${params}`);
    return response.data;
  }

  // Get critical alerts
  async getCriticalAlerts(department?: string): Promise<ApiResponse<Alert[]>> {
    const params = department ? `?department=${department}` : '';
    const response = await api.get(`${this.baseURL}/critical${params}`);
    return response.data;
  }

  // Get overdue alerts
  async getOverdueAlerts(department?: string): Promise<ApiResponse<Alert[]>> {
    const params = department ? `?department=${department}` : '';
    const response = await api.get(`${this.baseURL}/overdue${params}`);
    return response.data;
  }

  // Search alerts
  async searchAlerts(query: string, filters?: Omit<ExtendedAlertFilters, 'search'>): Promise<ApiResponse<Alert[]>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const response = await api.get(`${this.baseURL}/search?${params.toString()}`);
    return response.data;
  }

  // Bulk operations
  async bulkOperation(
    alertIds: string[], 
    operation: 'resolve' | 'mark_in_progress' | 'escalate' | 'delete' | 'update_department',
    data?: any
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`${this.baseURL}/bulk-operation`, {
      alert_ids: alertIds,
      operation,
      data
    });
    return response.data;
  }

  // Get alert trends
  async getTrends(params?: {
    department?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any>> {
    const urlParams = new URLSearchParams();
    
    if (params?.department) urlParams.append('department', params.department);
    if (params?.period) urlParams.append('period', params.period);
    if (params?.start_date) urlParams.append('start_date', params.start_date);
    if (params?.end_date) urlParams.append('end_date', params.end_date);

    const response = await api.get(`${this.baseURL}/trends?${urlParams.toString()}`);
    return response.data;
  }

  // Create system alert
  async createSystemAlert(data: {
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    department: string;
    metadata?: any;
  }): Promise<ApiResponse<Alert>> {
    const response = await api.post(`${this.baseURL}/system-alert`, data);
    return response.data;
  }

  // Helper methods for UI
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return '#ff4d4f';
      case 'high': return '#ff7a45';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return '#ff4d4f';
      case 'in_progress': return '#faad14';
      case 'resolved': return '#52c41a';
      case 'closed': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'critical': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'open': return 'Mở';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      case 'closed': return 'Đã đóng';
      default: return status;
    }
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'missing_document': return 'Thiếu tài liệu';
      case 'document_expiry': return 'Tài liệu hết hạn';
      case 'low_compliance': return 'Tuân thủ thấp';
      case 'batch_expiry': return 'Lô hàng hết hạn';
      case 'system_alert': return 'Cảnh báo hệ thống';
      case 'manual': return 'Thủ công';
      case 'compliance_deadline': return 'Hạn tuân thủ';
      case 'document_expired': return 'Tài liệu đã hết hạn';
      case 'approval_required': return 'Cần phê duyệt';
      case 'system_notification': return 'Thông báo hệ thống';
      case 'quality_issue': return 'Vấn đề chất lượng';
      default: return type;
    }
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  }

  isOverdue(alert: Alert): boolean {
    if (!alert.due_date) return false;
    return new Date(alert.due_date) < new Date() && !['resolved', 'closed'].includes(alert.status);
  }

  getTimeUntilDue(alert: Alert): string | null {
    if (!alert.due_date) return null;
    
    const dueDate = new Date(alert.due_date);
    const now = new Date();
    const diffInHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return `Quá hạn ${Math.abs(diffInHours)} giờ`;
    } else if (diffInHours < 24) {
      return `Còn ${diffInHours} giờ`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Còn ${diffInDays} ngày`;
    }
  }
}

export default new AlertService();