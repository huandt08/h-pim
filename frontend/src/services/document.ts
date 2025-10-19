import { apiCall } from './api';
import { 
  Document, 
  DocumentFilters, 
  DocumentFormData, 
  ApiResponse 
} from '../types';

export class DocumentService {
  // Get all documents with filters
  static async getDocuments(filters?: DocumentFilters): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/documents${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall<Document[]>('GET', url);
  }

  // Get single document
  static async getDocument(id: string): Promise<ApiResponse<Document>> {
    return await apiCall<Document>('GET', `/documents/${id}`);
  }

  // Create new document
  static async createDocument(data: DocumentFormData): Promise<ApiResponse<Document>> {
    return await apiCall<Document>('POST', '/documents', data);
  }

  // Update document
  static async updateDocument(id: string, data: Partial<DocumentFormData>): Promise<ApiResponse<Document>> {
    return await apiCall<Document>('PUT', `/documents/${id}`, data);
  }

  // Delete document
  static async deleteDocument(id: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', `/documents/${id}`);
  }

  // Upload document file
  static async uploadFile(
    documentId: string, 
    file: File, 
    documentType: string, 
    version?: string, 
    notes?: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_id', documentId);
    formData.append('document_type', documentType);
    
    if (version) formData.append('version', version);
    if (notes) formData.append('notes', notes);

    return await apiCall('POST', '/files/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Download document file
  static async downloadFile(fileId: string): Promise<Blob> {
    const response = await apiCall('GET', `/files/download/${fileId}`, null, {
      responseType: 'blob',
    });

    return response as any; // Return blob directly
  }

  // Get document versions
  static async getVersions(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/documents/${id}/versions`);
  }

  // Get document compliance status
  static async getCompliance(id: string): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/documents/${id}/compliance`);
  }

  // Update document compliance
  static async updateCompliance(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiCall('PUT', `/documents/${id}/compliance`, data);
  }

  // Get documents requiring approval
  static async getPendingApproval(): Promise<ApiResponse<Document[]>> {
    return await apiCall<Document[]>('GET', '/documents/pending-approval');
  }

  // Approve document
  static async approve(id: string, notes?: string): Promise<ApiResponse<Document>> {
    return await apiCall<Document>('POST', `/documents/${id}/approve`, { notes });
  }

  // Reject document
  static async reject(id: string, reason: string): Promise<ApiResponse<Document>> {
    return await apiCall<Document>('POST', `/documents/${id}/reject`, { reason });
  }

  // Get expiring documents
  static async getExpiring(days: number = 30): Promise<ApiResponse<Document[]>> {
    return await apiCall<Document[]>('GET', `/documents/expiring?days=${days}`);
  }

  // Extend document deadline
  static async extendDeadline(id: string, newDeadline: string, reason: string): Promise<ApiResponse<Document>> {
    return await apiCall<Document>('PUT', `/documents/${id}/extend-deadline`, {
      new_deadline: newDeadline,
      reason
    });
  }

  // Search documents
  static async searchDocuments(query: string, filters?: Partial<DocumentFilters>): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    return await apiCall<Document[]>('GET', `/documents/search?${params.toString()}`);
  }

  // Get document statistics
  static async getStats(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/documents/stats');
  }

  // Get documents by department
  static async getDocumentsByDepartment(departmentCode?: string): Promise<ApiResponse<Document[]>> {
    const url = departmentCode ? `/documents/department/${departmentCode}` : '/documents/department';
    return await apiCall<Document[]>('GET', url);
  }

  // Get document alerts
  static async getDocumentAlerts(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/documents/${id}/alerts`);
  }

  // Check document access
  static async checkAccess(id: string): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/documents/${id}/check-access`);
  }

  // Request document access
  static async requestAccess(id: string, reason: string): Promise<ApiResponse<any>> {
    return await apiCall('POST', `/documents/${id}/request-access`, { reason });
  }

  // Get document history
  static async getHistory(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/documents/${id}/history`);
  }

  // Create document link
  static async createLink(id: string, expiresAt?: string): Promise<ApiResponse<any>> {
    const data = expiresAt ? { expires_at: expiresAt } : {};
    return await apiCall('POST', `/documents/${id}/create-link`, data);
  }

  // Revoke document link
  static async revokeLink(id: string, linkId: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', `/documents/${id}/links/${linkId}`);
  }

  // Export documents
  static async exportDocuments(format: 'csv' | 'excel' | 'pdf', filters?: DocumentFilters): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall('GET', `/documents/export?${params.toString()}`, null, {
      responseType: 'blob',
    });

    return response as any; // Return blob directly
  }

  // Bulk update documents
  static async bulkUpdate(documentIds: string[], data: Partial<DocumentFormData>): Promise<ApiResponse<any>> {
    return await apiCall('PUT', '/documents/bulk-update', {
      document_ids: documentIds,
      ...data,
    });
  }

  // Bulk delete documents
  static async bulkDelete(documentIds: string[]): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', '/documents/bulk-delete', {
      document_ids: documentIds,
    });
  }

  // Get compliance summary
  static async getComplianceSummary(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/documents/compliance-summary');
  }
}

export default DocumentService;