import { apiCall } from './api';
import { ApiResponse } from '../types';

// Product completeness types
export interface ProductCompletenessResult {
  product_id: string;
  completeness_score: number;
  missing_fields: string[];
  validation_errors: { [field: string]: string[] };
  field_completion_status: { [field: string]: boolean };
  last_checked: string;
}

export interface CompletenessStatistics {
  total_products: number;
  completed: number;
  completed_percentage: number;
  partial: number;
  partial_percentage: number;
  incomplete: number;
  incomplete_percentage: number;
  average_score: number;
}

export interface BatchCheckRequest {
  product_ids?: string[];
  department?: string;
  generate_alerts?: boolean;
}

export interface LowComplianceProduct {
  id: string;
  name: string;
  completeness_score: number;
  department: string;
  missing_fields: string[];
  last_checked: string;
}

export class ProductCompletenessService {
  // Check completeness for a single product
  static async checkProduct(productId: string): Promise<ApiResponse<ProductCompletenessResult>> {
    return await apiCall<ProductCompletenessResult>('GET', `/products/${productId}/completeness`);
  }

  // Batch check completeness for multiple products
  static async batchCheck(data: BatchCheckRequest): Promise<ApiResponse<{
    processed: number;
    results: ProductCompletenessResult[];
    statistics: CompletenessStatistics;
  }>> {
    return await apiCall('POST', '/products/completeness/batch-check', data);
  }

  // Get system-wide completeness statistics
  static async getStatistics(): Promise<ApiResponse<CompletenessStatistics>> {
    return await apiCall<CompletenessStatistics>('GET', '/products/completeness/statistics');
  }

  // Get products with low compliance scores
  static async getLowCompliance(threshold: number = 70): Promise<ApiResponse<LowComplianceProduct[]>> {
    return await apiCall<LowComplianceProduct[]>('GET', `/products/completeness/low-compliance?threshold=${threshold}`);
  }

  // Check completeness for all products in a department
  static async checkDepartmentProducts(department: string, generateAlerts: boolean = false): Promise<ApiResponse<{
    department: string;
    processed: number;
    results: ProductCompletenessResult[];
    statistics: CompletenessStatistics;
  }>> {
    return await apiCall('POST', '/products/completeness/batch-check', {
      department,
      generate_alerts: generateAlerts
    });
  }

  // Get completeness validation configuration
  static async getValidationConfig(): Promise<ApiResponse<{
    fields: { [key: string]: { weight: number; required: boolean; validation_rules: string[] } };
    thresholds: { complete: number; partial: number; incomplete: number };
  }>> {
    return await apiCall('GET', '/products/completeness/config');
  }
}

export default ProductCompletenessService;