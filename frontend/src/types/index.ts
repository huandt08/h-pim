// Department types
export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  head_user_id?: string;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  department_code: string;
  department?: Department;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  permissions?: string[];
  roles?: string[];
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  primary_owner_department: string;
  secondary_access_departments: string[];
  product_type: string;
  status: 'development' | 'active' | 'discontinued' | 'pending_approval';
  compliance_status: 'compliant' | 'non_compliant' | 'pending' | 'expired';
  compliance_percentage: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  department?: Department;
  documents?: Document[];
  alerts?: Alert[];
}

// Document types
export interface Document {
  id: string;
  title: string;
  description?: string;
  document_type: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'expired';
  primary_owner_department: string;
  secondary_access_departments: string[];
  compliance_required: boolean;
  compliance_deadline?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  version: string;
  is_current_version: boolean;
  product_id?: string;
  batch_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  product?: Product;
  batch?: Batch;
  department?: Department;
  versions?: DocumentVersion[];
}

// Document Version types
export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  changes_summary?: string;
  created_by: string;
  created_at: string;
  document?: Document;
  creator?: User;
}

// Alert types
export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'compliance_deadline' | 'document_expired' | 'approval_required' | 'system_notification' | 'quality_issue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  primary_responsible_department: string;
  secondary_involved_departments?: string[];
  product_id?: string;
  document_id?: string;
  batch_id?: string;
  due_date?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  product?: Product;
  document?: Document;
  batch?: Batch;
  department?: Department;
  resolver?: User;
}

// Batch types
export interface Batch {
  id: string;
  batch_number: string;
  product_id: string;
  quantity: number;
  production_date: string;
  expiry_date?: string;
  status: 'planning' | 'in_production' | 'quality_control' | 'approved' | 'released' | 'recalled';
  quality_status: 'pending' | 'passed' | 'failed' | 'conditional';
  primary_owner_department: string;
  secondary_access_departments: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  product?: Product;
  department?: Department;
  documents?: Document[];
  alerts?: Alert[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    [key: string]: any;
  };
  errors?: Record<string, string[]>;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Filter types
export interface ProductFilters extends PaginationParams {
  search?: string;
  status?: string;
  product_type?: string;
  compliance_status?: string;
  department?: string;
}

export interface DocumentFilters extends PaginationParams {
  search?: string;
  document_type?: string;
  status?: string;
  compliance_required?: boolean;
  department?: string;
}

export interface AlertFilters extends PaginationParams {
  priority?: string;
  status?: string;
  type?: string;
  primary_only?: boolean;
}

// Dashboard types
export interface DashboardStats {
  department: string;
  products: {
    total: number;
    by_status: Record<string, number>;
    by_compliance: Record<string, number>;
    recent: Product[];
  };
  documents: {
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    pending_review: number;
    expiring_soon: number;
    recent: Document[];
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    open: number;
    overdue: number;
    recent: Alert[];
  };
}

// File upload types
export interface FileUploadResponse {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  url?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  department_code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Navigation types
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permissions?: string[];
}

// Form types
export interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  product_type: string;
  secondary_access_departments: string[];
  metadata?: Record<string, any>;
}

export interface DocumentFormData {
  title: string;
  description?: string;
  document_type: string;
  compliance_required: boolean;
  compliance_deadline?: string;
  secondary_access_departments: string[];
  product_id?: string;
  batch_id?: string;
  metadata?: Record<string, any>;
}

// Constants
export const DEPARTMENTS = {
  RND: 'Research & Development',
  MKT: 'Marketing',
  ECOM: 'E-Commerce',
  PUR: 'Purchasing',
  LEG: 'Legal',
  WH: 'Warehouse',
  COM: 'Compliance'
} as const;

export const PRODUCT_STATUSES = [
  'development',
  'active', 
  'discontinued',
  'pending_approval'
] as const;

export const DOCUMENT_STATUSES = [
  'draft',
  'under_review',
  'approved',
  'rejected',
  'expired'
] as const;

export const ALERT_PRIORITIES = [
  'low',
  'medium',
  'high',
  'critical'
] as const;

export const ALERT_STATUSES = [
  'open',
  'in_progress',
  'resolved',
  'closed'
] as const;