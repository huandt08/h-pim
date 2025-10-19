import { apiCall } from './api';
import { 
  Product, 
  ProductFilters, 
  ProductFormData, 
  ApiResponse 
} from '../types';

export class ProductService {
  // Get all products with filters
  static async getProducts(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    return await apiCall<Product[]>('GET', url);
  }

  // Get single product
  static async getProduct(id: string): Promise<ApiResponse<Product>> {
    return await apiCall<Product>('GET', `/products/${id}`);
  }

  // Create new product
  static async createProduct(data: ProductFormData): Promise<ApiResponse<Product>> {
    return await apiCall<Product>('POST', '/products', data);
  }

  // Update product
  static async updateProduct(id: string, data: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    return await apiCall<Product>('PUT', `/products/${id}`, data);
  }

  // Delete product
  static async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', `/products/${id}`);
  }

  // Get product compliance details
  static async getCompliance(id: string): Promise<ApiResponse<any>> {
    return await apiCall('GET', `/products/${id}/compliance`);
  }

  // Update product compliance
  static async updateCompliance(id: string, data: any): Promise<ApiResponse<any>> {
    return await apiCall('PUT', `/products/${id}/compliance`, data);
  }

  // Get product statistics
  static async getStats(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/products/stats');
  }

  // Search products
  static async searchProducts(query: string, filters?: Partial<ProductFilters>): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    return await apiCall<Product[]>('GET', `/products/search?${params.toString()}`);
  }

  // Get products by department
  static async getProductsByDepartment(departmentCode?: string): Promise<ApiResponse<Product[]>> {
    const url = departmentCode ? `/products/department/${departmentCode}` : '/products/department';
    return await apiCall<Product[]>('GET', url);
  }

  // Get product alerts
  static async getProductAlerts(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/products/${id}/alerts`);
  }

  // Get product documents
  static async getProductDocuments(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/products/${id}/documents`);
  }

  // Get product batches
  static async getProductBatches(id: string): Promise<ApiResponse<any[]>> {
    return await apiCall('GET', `/products/${id}/batches`);
  }

  // Upload product image
  static async uploadImage(id: string, file: File, imageType: string, altText?: string, isPrimary?: boolean): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('product_id', id);
    formData.append('image_type', imageType);
    
    if (altText) formData.append('alt_text', altText);
    if (isPrimary !== undefined) formData.append('is_primary', isPrimary.toString());

    return await apiCall('POST', '/files/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get compliance summary
  static async getComplianceSummary(): Promise<ApiResponse<any>> {
    return await apiCall('GET', '/products/compliance-summary');
  }

  // Export products
  static async exportProducts(format: 'csv' | 'excel' | 'pdf', filters?: ProductFilters): Promise<Blob> {
    const params = new URLSearchParams({ format });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiCall('GET', `/products/export?${params.toString()}`, null, {
      responseType: 'blob',
    });

    return response as any; // Return blob directly
  }

  // Import products
  static async importProducts(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiCall('POST', '/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Bulk update products
  static async bulkUpdate(productIds: string[], data: Partial<ProductFormData>): Promise<ApiResponse<any>> {
    return await apiCall('PUT', '/products/bulk-update', {
      product_ids: productIds,
      ...data,
    });
  }

  // Bulk delete products
  static async bulkDelete(productIds: string[]): Promise<ApiResponse<null>> {
    return await apiCall<null>('DELETE', '/products/bulk-delete', {
      product_ids: productIds,
    });
  }
}

export default ProductService;