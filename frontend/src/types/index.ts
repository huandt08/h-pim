// Department types
export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  head_user_id?: string;
  manager?: User; // Manager information
  status: 'active' | 'inactive';
  users_count?: number;
  products_count?: number;
  documents_count?: number;
  efficiency_score?: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  department: string; // Changed from department_code to department
  status?: 'active' | 'inactive';
  position?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  last_login_at?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  permissions?: string[];
  roles?: string[];
}

export interface UserFilters {
  search?: string;
  department?: string;
  status?: 'active' | 'inactive';
  role?: string;
  created_from?: string;
  created_to?: string;
  last_login_from?: string;
  last_login_to?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  department: string;
  password?: string;
  password_confirmation?: string;
  status?: 'active' | 'inactive';
  role?: string;
  permissions?: string[];
  phone?: string;
  position?: string;
  bio?: string;
}

// Product types
export interface Product {
  id: string;
  code: string; // Added code field
  name: string;
  brand?: string; // Added brand
  description?: string;
  detailed_description?: string; // Added detailed_description
  specifications?: string; // Added specifications
  ingredients?: string; // Added ingredients
  usage?: string; // Added usage
  instructions?: string; // Added instructions
  storage?: string; // Added storage
  development_reason?: string; // Added development_reason
  similar_products?: string; // Added similar_products
  usp?: string; // Added USP
  primary_owner_department: string;
  secondary_access_departments: string[];
  status: 'active' | 'inactive' | 'pending'; // Updated status values
  compliance_percentage?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  documents?: Document[];
  alerts?: Alert[];
}

// Document types
export interface Document {
  id: string;
  product_id?: string;
  type: string;
  title: string;
  description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  version: string;
  issued_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  certificate_number?: string;
  compliance_standards?: string[];
  primary_owner_department: string;
  secondary_access_departments: string[];
  status: 'active' | 'inactive' | 'expired';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  product?: Product;
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
  unit?: string;
  production_date: string;
  expiry_date?: string;
  status: 'planning' | 'in_production' | 'quality_control' | 'approved' | 'released' | 'recalled';
  quality_status: 'pending' | 'passed' | 'failed' | 'conditional';
  notes?: string;
  primary_owner_department: string;
  secondary_access_departments: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: User;
  product?: Product;
  documents?: Document[];
  alerts?: Alert[];
}

export interface QualityTest {
  id: string;
  batch_id: string;
  test_type: string;
  test_date: string;
  result: 'passed' | 'failed' | 'conditional';
  notes?: string;
  attachments?: string[];
  tested_by?: User;
  created_at: string;
  updated_at: string;
}

export interface BatchHistory {
  id: string;
  batch_id: string;
  action: string;
  previous_value?: string;
  new_value?: string;
  notes?: string;
  user?: User;
  created_at: string;
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
  compliance_min?: number;
  compliance_max?: number;
  department?: string;
}

export interface DocumentFilters extends PaginationParams {
  search?: string;
  type?: string;
  status?: string;
  product_id?: string;
  expiry_within_days?: number;
  department?: string;
}

export interface BatchFilters extends PaginationParams {
  search?: string;
  status?: string;
  quality_status?: string;
  product_id?: string;
  department?: string;
  production_date_from?: string;
  production_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
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
  department: string; // Changed from department_code to department
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
  code: string;
  name: string;
  brand?: string;
  description?: string;
  detailed_description?: string;
  specifications?: string;
  ingredients?: string;
  usage?: string;
  instructions?: string;
  storage?: string;
  development_reason?: string;
  similar_products?: string;
  usp?: string;
  primary_owner_department: string;
  secondary_access_departments: string[];
  status: string;
  metadata?: Record<string, any>;
}

export interface DocumentFormData {
  product_id?: string;
  type: string;
  title: string;
  description?: string;
  version: string;
  issued_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  certificate_number?: string;
  compliance_standards?: string[];
  primary_owner_department: string;
  secondary_access_departments: string[];
  status: string;
  metadata?: Record<string, any>;
}

export interface BatchFormData {
  batch_number: string;
  product_id: string;
  quantity: number;
  production_date: string;
  expiry_date?: string;
  status: string;
  quality_status: string;
  primary_owner_department: string;
  secondary_access_departments: string[];
  metadata?: Record<string, any>;
}

export interface DepartmentFilters {
  search?: string;
  status?: 'active' | 'inactive';
  has_users?: boolean;
  created_from?: string;
  created_to?: string;
}

export interface DepartmentFormData {
  code: string;
  name: string;
  description?: string;
  manager_id?: string;
  parent_department?: string;
  status?: 'active' | 'inactive';
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
  'active',
  'inactive', 
  'pending'
] as const;

export const DOCUMENT_STATUSES = [
  'active',
  'inactive',
  'expired'
] as const;

export const DOCUMENT_TYPES = [
  'certificate',
  'specification',
  'safety_sheet',
  'test_report',
  'compliance',
  'regulatory',
  'manual',
  'other'
] as const;

export const BATCH_STATUSES = [
  'planning',
  'in_production',
  'quality_control',
  'approved',
  'released',
  'recalled'
] as const;

export const QUALITY_STATUSES = [
  'pending',
  'passed',
  'failed',
  'conditional'
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