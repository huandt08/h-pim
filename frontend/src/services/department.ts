import { apiCall } from './api';
import { 
  Department, 
  DashboardStats,
  ApiResponse 
} from '../types';

export class DepartmentService {
  // Get all departments
  static async getDepartments(): Promise<ApiResponse<Department[]>> {
    return await apiCall<Department[]>('GET', '/departments');
  }

  // Get single department
  static async getDepartment(code: string): Promise<ApiResponse<Department>> {
    return await apiCall<Department>('GET', `/departments/${code}`);
  }

  // Get department dashboard
  static async getDashboard(code?: string): Promise<ApiResponse<DashboardStats>> {
    const url = code ? `/departments/${code}/dashboard` : '/departments/dashboard';
    return await apiCall<DashboardStats>('GET', url);
  }

  // Get department metrics
  static async getMetrics(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/metrics` : '/departments/metrics';
    return await apiCall('GET', url);
  }

  // Get department workload
  static async getWorkload(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/workload` : '/departments/workload';
    return await apiCall('GET', url);
  }

  // Get department performance
  static async getPerformance(code?: string, period?: 'monthly' | 'quarterly' | 'yearly'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    const url = code 
      ? `/departments/${code}/performance${params.toString() ? `?${params.toString()}` : ''}`
      : `/departments/performance${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall('GET', url);
  }

  // Get collaboration matrix
  static async getCollaborationMatrix(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/departments/collaboration-matrix');
  }

  // Get department users
  static async getDepartmentUsers(code?: string): Promise<ApiResponse<any[]>> {
    const url = code ? `/departments/${code}/users` : '/departments/users';
    return await apiCall('GET', url);
  }

  // Get department products
  static async getDepartmentProducts(code?: string): Promise<ApiResponse<any[]>> {
    const url = code ? `/departments/${code}/products` : '/departments/products';
    return await apiCall('GET', url);
  }

  // Get department documents
  static async getDepartmentDocuments(code?: string): Promise<ApiResponse<any[]>> {
    const url = code ? `/departments/${code}/documents` : '/departments/documents';
    return await apiCall('GET', url);
  }

  // Get department alerts
  static async getDepartmentAlerts(code?: string): Promise<ApiResponse<any[]>> {
    const url = code ? `/departments/${code}/alerts` : '/departments/alerts';
    return await apiCall('GET', url);
  }

  // Get department statistics
  static async getStats(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/stats` : '/departments/stats';
    return await apiCall('GET', url);
  }

  // Get department activity summary
  static async getActivitySummary(code?: string, days: number = 30): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ days: days.toString() });
    const url = code 
      ? `/departments/${code}/activity-summary?${params.toString()}`
      : `/departments/activity-summary?${params.toString()}`;
    return await apiCall('GET', url);
  }

  // Get department workload analysis
  static async getWorkloadAnalysis(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/workload-analysis` : '/departments/workload-analysis';
    return await apiCall('GET', url);
  }

  // Get department efficiency metrics
  static async getEfficiencyMetrics(code?: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = code 
      ? `/departments/${code}/efficiency${params.toString() ? `?${params.toString()}` : ''}`
      : `/departments/efficiency${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall('GET', url);
  }

  // Get cross-department projects
  static async getCrossDepartmentProjects(): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', '/departments/cross-department-projects');
  }

  // Get department resource allocation
  static async getResourceAllocation(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/resource-allocation` : '/departments/resource-allocation';
    return await apiCall('GET', url);
  }

  // Get department compliance status
  static async getComplianceStatus(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/compliance-status` : '/departments/compliance-status';
    return await apiCall('GET', url);
  }

  // Get department bottlenecks
  static async getBottlenecks(code?: string): Promise<ApiResponse<any[]>> {
    const url = code ? `/departments/${code}/bottlenecks` : '/departments/bottlenecks';
    return await apiCall('GET', url);
  }

  // Get department trends
  static async getTrends(code?: string, metric?: string, period?: 'daily' | 'weekly' | 'monthly'): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (metric) params.append('metric', metric);
    if (period) params.append('period', period);
    
    const url = code 
      ? `/departments/${code}/trends${params.toString() ? `?${params.toString()}` : ''}`
      : `/departments/trends${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall('GET', url);
  }

  // Export department data
  static async exportData(
    code?: string, 
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    dataType: 'products' | 'documents' | 'alerts' | 'all' = 'all'
  ): Promise<Blob> {
    const params = new URLSearchParams({ format, data_type: dataType });
    
    const url = code 
      ? `/departments/${code}/export?${params.toString()}`
      : `/departments/export?${params.toString()}`;

    const response = await apiCall('GET', url, null, {
      responseType: 'blob',
    });

    return response as any; // Return blob directly
  }

  // Get department calendar events
  static async getCalendarEvents(code?: string, startDate?: string, endDate?: string): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = code 
      ? `/departments/${code}/calendar${params.toString() ? `?${params.toString()}` : ''}`
      : `/departments/calendar${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall('GET', url);
  }

  // Get department goals and KPIs
  static async getGoalsAndKPIs(code?: string): Promise<ApiResponse<any>> {
    const url = code ? `/departments/${code}/goals-kpis` : '/departments/goals-kpis';
    return await apiCall('GET', url);
  }
}

export default DepartmentService;