import { apiCall } from './api';
import { 
  Batch, 
  BatchFilters, 
  BatchFormData, 
  QualityTest,
  BatchHistory,
  ApiResponse 
} from '../types';

export class BatchService {
  // Get all batches with filters
  static async getBatches(filters?: BatchFilters): Promise<ApiResponse<Batch[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/batches${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall<Batch[]>('GET', url);
  }

  // Get single batch
  static async getBatch(id: string): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('GET', `/batches/${id}`);
  }

  // Create new batch
  static async createBatch(data: BatchFormData): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('POST', '/batches', data);
  }

  // Update batch
  static async updateBatch(id: string, data: Partial<BatchFormData>): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('PUT', `/batches/${id}`, data);
  }

  // Delete batch
  static async deleteBatch(id: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', `/batches/${id}`);
  }

  // Get batch quality status
  static async getQualityStatus(id: string): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/batches/${id}/quality-status`);
  }

  // Update batch quality status
  static async updateQualityStatus(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiCall('PUT', `/batches/${id}/quality-status`, data);
  }

  // Approve batch
  static async approveBatch(id: string, notes?: string): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('POST', `/batches/${id}/approve`, { notes });
  }

  // Reject batch
  static async rejectBatch(id: string, reason: string): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('POST', `/batches/${id}/reject`, { reason });
  }

  // Release batch
  static async releaseBatch(id: string, notes?: string): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('POST', `/batches/${id}/release`, { notes });
  }

  // Recall batch
  static async recallBatch(id: string, reason: string): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('POST', `/batches/${id}/recall`, { reason });
  }

  // Get batch statistics
  static async getStats(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/batches/stats');
  }

  // Search batches
  static async searchBatches(query: string, filters?: Partial<BatchFilters>): Promise<ApiResponse<Batch[]>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    return await apiCall<Batch[]>('GET', `/batches/search?${params.toString()}`);
  }

  // Get batches by product
  static async getBatchesByProduct(productId: string): Promise<ApiResponse<Batch[]>> {
    return await apiCall<Batch[]>('GET', `/batches/product/${productId}`);
  }

  // Get batches by department
  static async getBatchesByDepartment(departmentCode?: string): Promise<ApiResponse<Batch[]>> {
    const url = departmentCode ? `/batches/department/${departmentCode}` : '/batches/department';
    return await apiCall<Batch[]>('GET', url);
  }

  // Get batch alerts
  static async getBatchAlerts(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/batches/${id}/alerts`);
  }

  // Get batch documents
  static async getBatchDocuments(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/batches/${id}/documents`);
  }

  // Get quality control tests
  static async getQualityTests(batchId: string): Promise<ApiResponse<QualityTest[]>> {
    return await apiCall<QualityTest[]>('GET', `/batches/${batchId}/quality-tests`);
  }

  // Add quality test result
  static async addQualityTest(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiCall('POST', `/batches/${id}/quality-tests`, data);
  }

  // Update quality test result
  static async updateQualityTest(id: string, testId: string, data: any): Promise<ApiResponse<any>> {
    return await apiCall('PUT', `/batches/${id}/quality-tests/${testId}`, data);
  }

  // Get production timeline
  static async getProductionTimeline(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/batches/${id}/production-timeline`);
  }

  // Add production milestone
  static async addProductionMilestone(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiCall('POST', `/batches/${id}/production-milestones`, data);
  }

  // Get expiring batches
  static async getExpiringBatches(days: number = 30): Promise<ApiResponse<Batch[]>> {
    return await apiCall<Batch[]>('GET', `/batches/expiring?days=${days}`);
  }

  // Get batch history
  static async getBatchHistory(batchId: string): Promise<ApiResponse<BatchHistory[]>> {
    return await apiCall<BatchHistory[]>('GET', `/batches/${batchId}/history`);
  }

  // Update batch status
  static async updateBatchStatus(batchId: string, status: string): Promise<ApiResponse<Batch>> {
    return await apiCall<Batch>('PUT', `/batches/${batchId}/status`, { status });
  }

  // Get batch traceability
  static async getTraceability(id: string): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/batches/${id}/traceability`);
  }

  // Generate batch report
  static async generateReport(id: string, format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/batches/${id}/report?format=${format}`, null, {
      responseType: 'blob',
    });
  }

  // Export batches
  static async exportBatches(format: 'csv' | 'excel' | 'pdf', filters?: BatchFilters): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall('GET', `/batches/export?${params.toString()}`, null, {
      responseType: 'blob',
    });

    return response as any; // Return blob directly
  }

  // Bulk update batches
  static async bulkUpdate(batchIds: string[], data: Partial<BatchFormData>): Promise<ApiResponse<any>> {
    return await apiCall('PUT', '/batches/bulk-update', {
      batch_ids: batchIds,
      ...data,
    });
  }

  // Bulk delete batches
  static async bulkDelete(batchIds: string[]): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', '/batches/bulk-delete', {
      batch_ids: batchIds,
    });
  }

  // Get batch compliance summary
  static async getComplianceSummary(id: string): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/batches/${id}/compliance-summary`);
  }

  // Generate batch QR code
  static async generateQRCode(id: string): Promise<ApiResponse<any>> {
    return await apiCall('POST', `/batches/${id}/generate-qr`);
  }

  // Validate batch number
  static async validateBatchNumber(batchNumber: string, productId?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ batch_number: batchNumber });
    if (productId) params.append('product_id', productId);
    
    return await apiCall('GET', `/batches/validate-number?${params.toString()}`);
  }
}

export default BatchService;