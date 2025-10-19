# TỔNG HỢP THÔNG TIN VÀ PLAN THỰC HIỆN HỆ THỐNG PIM

## 📋 TỔNG QUAN DỰ ÁN

### Hệ thống: Product Information Management (PIM) + Lark Base Integration
**Tech Stack:** Laravel 10+ Backend + React 18+ Frontend + Lark Base Integration

### Mục đích chính:
- **Quản lý thông tin sản phẩm tập trung** (KHÔNG phải quản lý kho)
- **Quản lý tài liệu đa dạng** với phân quyền theo phòng ban
- **Tự động kiểm tra và cảnh báo** tài liệu thiếu/hết hạn
- **Tích hợp Lark Base** cho báo cáo real-time và collaboration
- **Primary Owner + Secondary Access model** cho cross-department workflow

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Backend: Laravel 10+
```
├── API Layer (RESTful APIs)
├── Business Logic (Services)
├── Queue System (Jobs + Scheduling)
├── Authentication & Authorization
├── File Storage Management
├── Lark Base Integration
└── Database Layer (MySQL)
```

### Frontend: React 18+ với Ant Design
```
├── Dashboard Components
├── Document Management UI
├── Department-aware Views
├── Real-time Updates (Pusher)
├── Lark Base Integration Dashboard
└── Mobile-responsive Design
```

### Database Design:
```
├── Departments (7 phòng ban: RND, MKT, ECOM, PUR, LEG, WH, COM)
├── Products (với department ownership)
├── Batches (lô hàng với warehouse info)
├── Documents (với Primary/Secondary access)
├── Alerts System
├── Lark Sync Status
└── User Management
```

---

## 📊 CÁC MODULE CHÍNH

### 1. **Department Management** (Quản lý phòng ban)
- 7 phòng ban cố định: RND, MKT, ECOM, PUR, LEG, WH, COM
- Quản lý nhân viên theo phòng ban
- Primary Owner + Secondary Access permissions

### 2. **Product Information Management**
- Thông tin sản phẩm đầy đủ (SKU, mô tả, thành phần, công dụng, etc.)
- **Automatic completeness checking** với validation rules
- Department ownership và collaboration
- Version control cho thông tin

### 3. **Document Management với Cross-Department Access**
- 9 loại tài liệu chính với phòng ban chủ quản
- **Primary Owner**: Full CRUD permissions
- **Secondary Access**: Read/Comment/Edit theo config
- File upload đa định dạng (PDF, DOC, images, videos)
- Version control tự động

### 4. **Automated Compliance System**
- **Tự động kiểm tra** tài liệu thiếu/hết hạn
- **Smart alerts** với department routing
- **Configurable rules** cho từng loại tài liệu
- **Multi-channel notifications** (Email, SMS, Lark Bot)

### 5. **Lark Base Integration**
- **Real-time data sync** từ PIM sang Lark Base
- **Executive dashboards** với interactive reports
- **Department performance tracking**
- **Collaborative workflow** trên Lark platform

---

## 🎯 PHÂN TÍCH CHI TIẾT CÁC YÊU CẦU

### A. Business Requirements từ YeuCauHeThong_PIM.md:

#### 📋 **Quản lý thông tin sản phẩm:**
- Mã SKU, tên, thương hiệu, mô tả chi tiết
- Quy cách, thành phần, công dụng, HDSD, bảo quản
- Lý do phát triển, sản phẩm tương tự, USP
- **Automatic validation** với rules cụ thể cho từng trường

#### 📁 **Document Management với Department Matrix:**

**A. Danh mục loại tài liệu:**
| Loại tài liệu | Mô tả |
|---------------|-------|
| Thông tin sản phẩm | Mô tả chi tiết, thành phần, công dụng |
| Hình ảnh/Video gốc | Hình ảnh chất lượng cao, video gốc |
| Giấy tờ sản phẩm | Giấy công bố, phép quảng cáo, đăng ký lưu hành |
| Giấy tờ lô hàng | Hợp đồng, hóa đơn, biên bản nhập kho |
| Content Marketing | Ảnh thiết kế, video quảng cáo, nội dung MKT |
| Content E-commerce | Mô tả sản phẩm trên nền tảng, hình ảnh ECOM |
| Content Truyền thông | Ảnh/video cho PR, thông cáo báo chí |
| Tài liệu pháp lý | Hợp đồng, giấy tờ pháp lý |
| Tài liệu kho bãi | Biên bản xuất/nhập kho, báo cáo tồn kho |

**B. Chi tiết Document Requirements Matrix (43 tài liệu cụ thể):**
| Loại tài liệu | Tên tài liệu cụ thể | Định dạng | Chủ quản | Quyền truy cập | Bắt buộc | Thời hạn | Mô tả |
|---------------|---------------------|-----------|----------|---------------|----------|---------|-------|
| **Thông tin sản phẩm** |
| Thông tin sản phẩm | Mô tả sản phẩm chi tiết | Văn bản | RND | MKT, ECOM | ✓ | Ngay khi tạo | Thông tin chung, thành phần, công dụng, HDSD |
| Thông tin sản phẩm | Thông số kỹ thuật | Văn bản | RND | MKT, ECOM, WH | ✓ | 24h | Quy cách, khối lượng, kích thước |
| **Hình ảnh/Video gốc** |
| Hình ảnh/Video gốc | Ảnh sản phẩm gốc | File | RND | MKT, ECOM, COM | ✓ | 24h | Hình ảnh chất lượng cao |
| Hình ảnh/Video gốc | Video giới thiệu | File | RND | MKT, ECOM, COM | | 72h | Video demo sản phẩm |
| **Giấy tờ sản phẩm** |
| Giấy tờ sản phẩm | Giấy công bố | File | RND | LEG | | 30 ngày | Giấy công bố sản phẩm |
| Giấy tờ sản phẩm | Giấy phép quảng cáo | File | RND | LEG, MKT | | 30 ngày | Giấy phép quảng cáo |
| Giấy tờ sản phẩm | Đăng ký lưu hành | File | RND | LEG | | 60 ngày | Giấy đăng ký lưu hành |
| **Giấy tờ về lô hàng** |
| Giấy tờ về lô hàng | Hợp đồng mua bán | File | PUR | WH, LEG | ✓ | 3 ngày | Hợp đồng với NCC |
| Giấy tờ về lô hàng | Hóa đơn | File | PUR | WH, LEG | ✓ | 5 ngày | Hóa đơn mua hàng |
| Giấy tờ về lô hàng | Đơn đặt hàng | File | PUR | WH | ✓ | Ngay khi tạo | Purchase Order |
| Giấy tờ về lô hàng | Biên bản nhập kho | File | WH | PUR | ✓ | 7 ngày | Biên bản nhập kho |
| Giấy tờ về lô hàng | Packing list | File | PUR | WH | | 5 ngày | Danh sách đóng gói |
| Giấy tờ về lô hàng | Vận đơn | File | PUR | WH | | 7 ngày | Vận đơn vận chuyển |
| **Content Marketing** |
| Content Marketing | Ảnh chụp sản phẩm | File | MKT | ECOM, COM | ✓ | 48h | Ảnh chụp chuyên nghiệp |
| Content Marketing | Ảnh thiết kế | File | MKT | ECOM, COM | ✓ | 72h | Ảnh thiết kế đồ họa |
| Content Marketing | Video quảng cáo | File | MKT | ECOM, COM | | 7 ngày | Video marketing |
| Content Marketing | Script quảng cáo | Văn bản | MKT | ECOM, COM | ✓ | 48h | Nội dung quảng cáo |
| **Content E-commerce** |
| Content E-commerce | Mô tả sản phẩm web | Văn bản | ECOM | MKT | ✓ | 48h | Mô tả cho website |
| Content E-commerce | Hình ảnh ECOM | File | ECOM | MKT | ✓ | 72h | Ảnh cho nền tảng bán hàng |
| **Content Truyền thông** |
| Content Truyền thông | Ảnh PR | File | COM | MKT | | 48h | Ảnh cho quan hệ công chúng |
| Content Truyền thông | Video PR | File | COM | MKT | | 72h | Video cho truyền thông |
| Content Truyền thông | Thông cáo báo chí | Văn bản | COM | MKT, LEG | | 24h | Press release |

#### 🔐 **Permission Matrix:**
- **Super Admin**: Toàn quyền hệ thống
- **Department Admin**: Quản lý phòng ban, full access tài liệu Primary
- **Department User**: CRUD tài liệu Primary, Read/Comment/Edit Secondary
- **Cross-Department User**: Read/Comment/Edit theo config
- **View Only**: Read-only access

### B. Technical Requirements từ TECH_STACK_SPECIFICATION.md:

#### 🔧 **Backend (Laravel):**
- **Laravel 10+** với Filament Admin Panel
- **Queue Jobs** cho background processing
- **Laravel Scheduler** cho automated checks
- **Spatie Packages**: Permissions, Activity Log
- **File Storage**: Local + S3 compatible
- **API Layer**: RESTful với proper authentication

#### ⚛️ **Frontend (React):**
- **React 18+** với functional components + hooks
- **Ant Design** cho UI components
- **React Query/TanStack Query** cho data fetching
- **Zustand** cho state management
- **Real-time updates** với Laravel Echo + Pusher
- **TypeScript** cho type safety

#### 🗄️ **Database & Storage:**
- **MySQL 8.0** cho primary database
- **Redis** cho caching và queue
- **File storage** local/S3 với CDN
- **Backup strategy** automated

### C. Integration Requirements từ LarkBase_Integration_Specification.md:

#### 🔗 **Lark Base API Integration:**
- **Authentication**: OAuth 2.0 với Lark credentials
- **Data Sync**: Real-time + scheduled sync
- **Tables**: Products, Alerts, Department Performance, Document Expiry
- **Rate limiting** và retry logic
- **Error handling** comprehensive

#### 📊 **Dashboard & Reporting:**
- **Executive Dashboard**: Compliance scores, trends, heat maps
- **Department Dashboard**: Performance tracking, workload management
- **Real-time Alerts**: Smart routing theo department responsibilities
- **Mobile Access**: Lark mobile app integration

---

## 🚀 IMPLEMENTATION PLAN CHI TIẾT

## **PHASE 1: FOUNDATION SETUP (Tuần 1-4)**

### Tuần 1: Project Setup & Core Infrastructure
#### Backend Setup:
```bash
# 1. Laravel Project Setup
composer create-project laravel/laravel pim-backend
cd pim-backend

# 2. Install Core Dependencies
composer require filament/filament:"^3.0"
composer require spatie/laravel-permission
composer require spatie/laravel-activitylog
composer require league/flysystem-aws-s3-v3
composer require pusher/pusher-php-server

# 3. Database Setup
php artisan make:migration create_departments_table
php artisan make:migration create_products_table
php artisan make:migration create_batches_table
php artisan make:migration create_documents_table
php artisan make:migration create_alerts_table
php artisan make:migration create_lark_sync_status_table
```

#### Frontend Setup:
```bash
# 1. React Project Setup
npm create vite@latest pim-frontend -- --template react-ts
cd pim-frontend

# 2. Install Dependencies
npm install antd @ant-design/icons
npm install axios react-router-dom
npm install @tanstack/react-query
npm install zustand dayjs
npm install laravel-echo pusher-js
```

#### Deliverables:
- [ ] Laravel project với basic structure
- [ ] React project với routing setup
- [ ] Database migrations cho core tables
- [ ] Docker setup cho development
- [ ] Basic authentication system

### Tuần 2: Database Design & Models
#### Database Implementation:
```sql
-- Products với detailed product information fields
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    
    -- Basic Product Information (Required immediately)
    thuong_hieu VARCHAR(255),
    mo_ta_san_pham TEXT,
    
    -- Basic Info (Required within hours)
    thong_tin_chung TEXT,           -- Required within 2h
    quy_cach VARCHAR(500),          -- Required within 4h  
    thanh_phan TEXT,                -- Required within 6h
    cong_dung TEXT,                 -- Required within 8h
    hdsd TEXT,                      -- Required within 12h
    bao_quan TEXT,                  -- Required within 12h
    
    -- Extended Info (Required within days)
    ly_do_phat_trien TEXT,          -- Required within 24h
    san_pham_tuong_tu TEXT,         -- Required within 48h
    usp_canh_tranh TEXT,            -- Required within 72h
    
    -- System fields
    primary_owner_department VARCHAR(10),
    secondary_access_departments JSON,
    status ENUM('development', 'active', 'discontinued') DEFAULT 'development',
    completeness_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_department) REFERENCES departments(code)
);

-- Product Information Validation Rules
CREATE TABLE product_validation_rules (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    field_name VARCHAR(100) NOT NULL,
    category ENUM('basic_info', 'extended_info') NOT NULL,
    required BOOLEAN DEFAULT TRUE,
    check_after_hours INT DEFAULT 0,
    reminder_intervals JSON,
    validation_rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents với Primary/Secondary access
CREATE TABLE documents (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('text', 'file', 'image', 'video') NOT NULL,
    category VARCHAR(100) NOT NULL,
    specific_document_type VARCHAR(150) NOT NULL, -- e.g., "hop_dong_mua_ban", "anh_san_pham_goc"
    primary_owner_department VARCHAR(10) NOT NULL,
    secondary_access_departments JSON,
    access_level ENUM('read', 'read_comment', 'read_edit') DEFAULT 'read',
    product_id CHAR(36),
    batch_id CHAR(36),
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    deadline TIMESTAMP NULL,
    deadline_hours INT NULL, -- Deadline in hours from creation
    status ENUM('draft', 'active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_department) REFERENCES departments(code),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_product_documents (product_id),
    INDEX idx_department_documents (primary_owner_department),
    INDEX idx_document_type (specific_document_type)
);

-- Document Requirements Configuration
CREATE TABLE document_requirements (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    document_type VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    primary_owner_department VARCHAR(10) NOT NULL,
    secondary_access_departments JSON,
    is_required BOOLEAN DEFAULT FALSE,
    deadline_hours INT NULL,
    file_types JSON, -- Allowed file types
    validation_rules JSON,
    applies_to ENUM('product', 'batch', 'both') DEFAULT 'product',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_department) REFERENCES departments(code)
);
```

#### Laravel Models:
```php
// app/Models/Product.php
class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'code', 'name', 'brand', 
        // Basic product info
        'thuong_hieu', 'mo_ta_san_pham', 'thong_tin_chung',
        'quy_cach', 'thanh_phan', 'cong_dung', 'hdsd', 'bao_quan',
        // Extended info
        'ly_do_phat_trien', 'san_pham_tuong_tu', 'usp_canh_tranh',
        // System fields
        'primary_owner_department', 'secondary_access_departments',
        'status', 'completeness_percentage'
    ];
    
    protected $casts = [
        'secondary_access_departments' => 'array',
        'completeness_percentage' => 'decimal:2'
    ];
    
    // Validation rules configuration
    public static function getValidationConfig(): array
    {
        return [
            'basic_info' => [
                'thuong_hieu' => [
                    'required' => true,
                    'check_after_hours' => 0,
                    'validation_rules' => ['not_empty', 'min_length:2']
                ],
                'mo_ta_san_pham' => [
                    'required' => true,
                    'check_after_hours' => 0,
                    'validation_rules' => ['not_empty', 'min_length:10']
                ],
                'thong_tin_chung' => [
                    'required' => true,
                    'check_after_hours' => 2,
                    'validation_rules' => ['not_empty', 'min_length:20']
                ],
                'quy_cach' => [
                    'required' => true,
                    'check_after_hours' => 4,
                    'validation_rules' => ['not_empty', 'contains_unit']
                ],
                'thanh_phan' => [
                    'required' => true,
                    'check_after_hours' => 6,
                    'validation_rules' => ['not_empty', 'min_length:15']
                ],
                'cong_dung' => [
                    'required' => true,
                    'check_after_hours' => 8,
                    'validation_rules' => ['not_empty', 'min_length:20']
                ],
                'hdsd' => [
                    'required' => true,
                    'check_after_hours' => 12,
                    'validation_rules' => ['not_empty', 'contains_steps']
                ],
                'bao_quan' => [
                    'required' => true,
                    'check_after_hours' => 12,
                    'validation_rules' => ['not_empty', 'contains_conditions']
                ]
            ],
            'extended_info' => [
                'ly_do_phat_trien' => [
                    'required' => true,
                    'check_after_hours' => 24,
                    'validation_rules' => ['not_empty', 'min_length:50']
                ],
                'san_pham_tuong_tu' => [
                    'required' => true,
                    'check_after_hours' => 48,
                    'validation_rules' => ['not_empty', 'has_comparison']
                ],
                'usp_canh_tranh' => [
                    'required' => true,
                    'check_after_hours' => 72,
                    'validation_rules' => ['not_empty', 'min_length:30', 'has_unique_points']
                ]
            ]
        ];
    }
    
    public function documents() {
        return $this->hasMany(Document::class);
    }
    
    public function alerts() {
        return $this->hasMany(Alert::class);
    }
    
    public function getCreatedHoursAgoAttribute(): int
    {
        return $this->created_at->diffInHours(now());
    }
}

// app/Models/Document.php  
class Document extends Model
{
    use HasFactory, LogsActivity;
    
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'name', 'type', 'category', 'specific_document_type',
        'primary_owner_department', 'secondary_access_departments', 
        'access_level', 'product_id', 'file_path', 'is_required', 
        'deadline', 'deadline_hours'
    ];
    
    protected $casts = [
        'secondary_access_departments' => 'array',
        'is_required' => 'boolean',
        'deadline' => 'datetime'
    ];
    
    public function product() {
        return $this->belongsTo(Product::class);
    }
    
    public function getIsOverdueAttribute(): bool
    {
        return $this->deadline && $this->deadline->isPast();
    }
    
    public function getDaysOverdueAttribute(): ?int
    {
        if (!$this->deadline || !$this->deadline->isPast()) {
            return null;
        }
        return $this->deadline->diffInDays(now());
    }
}

// app/Models/DocumentRequirement.php
class DocumentRequirement extends Model
{
    protected $fillable = [
        'document_type', 'category', 'primary_owner_department',
        'secondary_access_departments', 'is_required', 'deadline_hours',
        'file_types', 'validation_rules', 'applies_to'
    ];
    
    protected $casts = [
        'secondary_access_departments' => 'array',
        'file_types' => 'array',
        'validation_rules' => 'array',
        'is_required' => 'boolean'
    ];
    
    public static function getRequirementsForProduct(): Collection
    {
        return self::where('applies_to', 'product')
                   ->orWhere('applies_to', 'both')
                   ->get();
    }
    
    public static function getRequirementsForBatch(): Collection
    {
        return self::where('applies_to', 'batch')
                   ->orWhere('applies_to', 'both')
                   ->get();
    }
}
```

#### Deliverables:
- [ ] Complete database schema
- [ ] Laravel models với relationships
- [ ] Seeders cho departments và test data
- [ ] Model factories cho testing

### Tuần 3: Core Services & Business Logic
#### Service Classes:
```php
// app/Services/ProductInformationValidator.php
class ProductInformationValidator
{
    public function validateProductCompleteness(Product $product): array
    {
        $rules = Product::getValidationConfig();
        $errors = [];
        $warnings = [];
        $completeness_score = 0;
        $total_fields = 0;
        
        // Check basic info fields
        foreach ($rules['basic_info'] as $field => $config) {
            $total_fields++;
            $value = $product->{$field} ?? '';
            $fieldErrors = $this->validateField($field, $value, $config['validation_rules']);
            
            if (empty($fieldErrors)) {
                $completeness_score++;
            } elseif ($product->created_hours_ago > $config['check_after_hours']) {
                $errors = array_merge($errors, $fieldErrors);
            } else {
                $warnings = array_merge($warnings, $fieldErrors);
            }
        }
        
        // Check extended info fields
        foreach ($rules['extended_info'] as $field => $config) {
            $total_fields++;
            $value = $product->{$field} ?? '';
            $fieldErrors = $this->validateField($field, $value, $config['validation_rules']);
            
            if (empty($fieldErrors)) {
                $completeness_score++;
            } elseif ($product->created_hours_ago > $config['check_after_hours']) {
                $errors = array_merge($errors, $fieldErrors);
            } else {
                $warnings = array_merge($warnings, $fieldErrors);
            }
        }
        
        $completeness_percentage = ($completeness_score / $total_fields) * 100;
        
        return [
            'product_id' => $product->id,
            'errors' => $errors,
            'warnings' => $warnings,
            'completeness_score' => $completeness_percentage,
            'missing_fields' => $this->getMissingFields($product, $rules),
            'next_check' => $this->calculateNextCheckTime($product, $rules)
        ];
    }
    
    private function validateField(string $field, $value, array $rules): array
    {
        $errors = [];
        
        // Check not_empty
        if (in_array('not_empty', $rules) && (empty($value) || trim($value) === '')) {
            $errors[] = "{$field} không được để trống";
        }
        
        // Check min_length
        foreach ($rules as $rule) {
            if (str_starts_with($rule, 'min_length:')) {
                $min_len = (int) substr($rule, 11);
                if (strlen(trim($value)) < $min_len) {
                    $errors[] = "{$field} phải có tối thiểu {$min_len} ký tự";
                }
            }
        }
        
        // Check specific rules
        if (in_array('contains_unit', $rules)) {
            $units = ['ml', 'g', 'kg', 'l', 'mg', 'gam', 'lít', 'viên', 'gói', 'hộp'];
            if (!$this->containsAny(strtolower($value), $units)) {
                $errors[] = "{$field} phải có đơn vị đo (ml, g, kg, etc.)";
            }
        }
        
        if (in_array('contains_steps', $rules)) {
            $step_indicators = ['bước', 'step', '1.', '2.', 'đầu tiên', 'sau đó', 'cuối cùng'];
            if (!$this->containsAny(strtolower($value), $step_indicators)) {
                $errors[] = "{$field} phải có các bước hướng dẫn rõ ràng";
            }
        }
        
        if (in_array('contains_conditions', $rules)) {
            $conditions = ['nhiệt độ', 'độ ẩm', 'tránh', 'nơi', '°c', 'khô', 'ẩm', 'mát'];
            if (!$this->containsAny(strtolower($value), $conditions)) {
                $errors[] = "{$field} phải có điều kiện bảo quản cụ thể";
            }
        }
        
        if (in_array('has_comparison', $rules)) {
            $comparison_indicators = ['so với', 'khác với', 'tương tự', 'giá', 'chất lượng', 'brand'];
            if (!$this->containsAny(strtolower($value), $comparison_indicators)) {
                $errors[] = "{$field} phải có so sánh với sản phẩm khác";
            }
        }
        
        if (in_array('has_unique_points', $rules)) {
            $unique_indicators = ['độc quyền', 'duy nhất', 'chỉ có', 'khác biệt', 'đặc biệt'];
            if (!$this->containsAny(strtolower($value), $unique_indicators)) {
                $errors[] = "{$field} phải có điểm khác biệt/độc đáo";
            }
        }
        
        return $errors;
    }
    
    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle)) {
                return true;
            }
        }
        return false;
    }
    
    private function getMissingFields(Product $product, array $rules): array
    {
        $missing = [];
        foreach ($rules as $category => $fields) {
            foreach ($fields as $field => $config) {
                $value = $product->{$field} ?? '';
                if (empty($value) || trim($value) === '') {
                    $missing[] = [
                        'field' => $field,
                        'category' => $category,
                        'deadline_hours' => $config['check_after_hours']
                    ];
                }
            }
        }
        return $missing;
    }
}

// app/Services/DepartmentService.php
class DepartmentService
{
    public function calculateDepartmentMetricsWithRoles(string $departmentCode): array
    {
        $primaryProducts = Product::where('primary_owner_department', $departmentCode)->get();
        $secondaryProducts = Product::whereJsonContains('secondary_access_departments', $departmentCode)->get();
        
        return [
            'department' => $departmentCode,
            'primary_owner_products' => $primaryProducts->count(),
            'secondary_access_products' => $secondaryProducts->count(),
            'overall_compliance_score' => $this->calculateOverallCompliance($primaryProducts, $secondaryProducts),
            'critical_alerts' => $this->getCriticalAlerts($departmentCode),
            'warning_alerts' => $this->getWarningAlerts($departmentCode),
            'avg_response_time' => $this->getAverageResponseTime($departmentCode),
            'trend' => $this->calculateTrend($departmentCode)
        ];
    }
    
    private function calculateOverallCompliance($primaryProducts, $secondaryProducts): float
    {
        $totalProducts = $primaryProducts->count() + $secondaryProducts->count();
        if ($totalProducts === 0) return 100.0;
        
        $totalCompliance = $primaryProducts->sum('completeness_percentage') + 
                          $secondaryProducts->sum('completeness_percentage');
        
        return round($totalCompliance / $totalProducts, 2);
    }
}

// app/Services/DocumentService.php
class DocumentService
{
    public function checkDocumentCompliance(Product $product): array
    {
        $requiredDocs = DocumentRequirement::getRequirementsForProduct();
        $existingDocs = $product->documents()->get();
        
        $missing = [];
        $overdue = [];
        
        foreach ($requiredDocs as $requirement) {
            if (!$requirement->is_required) continue;
            
            $exists = $existingDocs->where('specific_document_type', $requirement->document_type)->first();
            
            if (!$exists) {
                $deadline = $product->created_at->addHours($requirement->deadline_hours);
                $missing[] = [
                    'document_type' => $requirement->document_type,
                    'primary_owner' => $requirement->primary_owner_department,
                    'deadline' => $deadline,
                    'hours_overdue' => max(0, now()->diffInHours($deadline))
                ];
            } elseif ($exists->is_overdue) {
                $overdue[] = [
                    'document' => $exists,
                    'days_overdue' => $exists->days_overdue
                ];
            }
        }
        
        $compliance_percentage = $this->calculateCompliancePercentage($requiredDocs, $existingDocs);
        
        return [
            'required_count' => $requiredDocs->where('is_required', true)->count(),
            'completed_count' => $existingDocs->count(),
            'missing_documents' => $missing,
            'overdue_documents' => $overdue,
            'compliance_percentage' => $compliance_percentage
        ];
    }
    
    private function calculateCompliancePercentage($requiredDocs, $existingDocs): float
    {
        $requiredCount = $requiredDocs->where('is_required', true)->count();
        if ($requiredCount === 0) return 100.0;
        
        $completedCount = $existingDocs->count();
        return round(($completedCount / $requiredCount) * 100, 2);
    }
}
```

#### Deliverables:
- [ ] DepartmentService với metrics calculation
- [ ] DocumentService với compliance checking
- [ ] ProductService với validation logic
- [ ] FileUploadService với S3 integration
- [ ] **ProductInformationValidator với detailed rules**
- [ ] **Document requirements configuration system**
- [ ] **Automated completeness scoring**

### Tuần 4: Basic APIs & Authentication
#### API Controllers:
```php
// app/Http/Controllers/Api/ProductController.php
class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::with(['documents', 'alerts'])
            ->when($request->department, function($query, $dept) {
                $query->where('primary_owner_department', $dept)
                      ->orWhereJsonContains('secondary_access_departments', $dept);
            })
            ->when($request->completeness_filter, function($query, $filter) {
                switch ($filter) {
                    case 'low': // 0-50%
                        $query->where('completeness_percentage', '<=', 50);
                        break;
                    case 'medium': // 51-80%
                        $query->whereBetween('completeness_percentage', [51, 80]);
                        break;
                    case 'high': // 81-100%
                        $query->where('completeness_percentage', '>=', 81);
                        break;
                }
            })
            ->paginate(15);
            
        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'total' => $products->total()
            ]
        ]);
    }
    
    public function completenessStatistics(): JsonResponse
    {
        $validator = app(ProductInformationValidator::class);
        
        $products = Product::all();
        $overall_stats = [
            'total_products' => $products->count(),
            'complete_100' => $products->where('completeness_percentage', 100)->count(),
            'incomplete' => $products->where('completeness_percentage', '<', 100)->count(),
            'draft' => $products->where('completeness_percentage', 0)->count(),
        ];
        
        $missing_fields = [];
        $upcoming_deadlines = [];
        
        foreach ($products->where('completeness_percentage', '<', 100) as $product) {
            $validation = $validator->validateProductCompleteness($product);
            
            foreach ($validation['missing_fields'] as $missing) {
                $field_name = $missing['field'];
                if (!isset($missing_fields[$field_name])) {
                    $missing_fields[$field_name] = 0;
                }
                $missing_fields[$field_name]++;
            }
            
            if (!empty($validation['warnings'])) {
                $upcoming_deadlines[] = [
                    'sku' => $product->code,
                    'missing_fields' => $validation['warnings'],
                    'hours_remaining' => $validation['next_check']
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'overall_stats' => $overall_stats,
                'missing_fields' => $missing_fields,
                'upcoming_deadlines' => $upcoming_deadlines
            ]
        ]);
    }
}

// app/Http/Controllers/Api/DocumentController.php
class DocumentController extends Controller
{
    public function getDocumentRequirements(Request $request): JsonResponse
    {
        $requirements = DocumentRequirement::when($request->applies_to, function($query, $type) {
                $query->where('applies_to', $type)->orWhere('applies_to', 'both');
            })
            ->when($request->department, function($query, $dept) {
                $query->where('primary_owner_department', $dept)
                      ->orWhereJsonContains('secondary_access_departments', $dept);
            })
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $requirements
        ]);
    }
    
    public function checkCompliance(Product $product): JsonResponse
    {
        $documentService = app(DocumentService::class);
        $compliance = $documentService->checkDocumentCompliance($product);
        
        return response()->json([
            'success' => true,
            'data' => $compliance
        ]);
    }
}
```

#### Deliverables:
- [ ] RESTful APIs cho Products, Documents, Departments
- [ ] Authentication với Laravel Sanctum
- [ ] Permission-based access control
- [ ] API documentation với Postman/Swagger
- [ ] **Product completeness APIs**
- [ ] **Document requirements management APIs**
- [ ] **Advanced filtering và search APIs**

---

## **PHASE 1.5: PRODUCT INFORMATION VALIDATION (Tuần 4.5)**

### Advanced Validation System Implementation
#### Product Information Validation:
```php
// config/product_validation.php
return [
    'validation_rules' => [
        'basic_info' => [
            'thuong_hieu' => [
                'required' => true,
                'check_after_hours' => 0,
                'reminder_intervals' => [0, 1, 2],
                'validation_rules' => ['not_empty', 'min_length:2']
            ],
            'mo_ta_san_pham' => [
                'required' => true,
                'check_after_hours' => 0,
                'reminder_intervals' => [0, 1, 2],
                'validation_rules' => ['not_empty', 'min_length:10']
            ],
            'thong_tin_chung' => [
                'required' => true,
                'check_after_hours' => 2,
                'reminder_intervals' => [2, 4, 8],
                'validation_rules' => ['not_empty', 'min_length:20']
            ],
            'quy_cach' => [
                'required' => true,
                'check_after_hours' => 4,
                'reminder_intervals' => [4, 8, 12],
                'validation_rules' => ['not_empty', 'contains_unit']
            ],
            'thanh_phan' => [
                'required' => true,
                'check_after_hours' => 6,
                'reminder_intervals' => [6, 12, 18],
                'validation_rules' => ['not_empty', 'min_length:15']
            ],
            'cong_dung' => [
                'required' => true,
                'check_after_hours' => 8,
                'reminder_intervals' => [8, 16, 24],
                'validation_rules' => ['not_empty', 'min_length:20']
            ],
            'hdsd' => [
                'required' => true,
                'check_after_hours' => 12,
                'reminder_intervals' => [12, 24, 36],
                'validation_rules' => ['not_empty', 'contains_steps']
            ],
            'bao_quan' => [
                'required' => true,
                'check_after_hours' => 12,
                'reminder_intervals' => [12, 24, 36],
                'validation_rules' => ['not_empty', 'contains_conditions']
            ]
        ],
        'extended_info' => [
            'ly_do_phat_trien' => [
                'required' => true,
                'check_after_hours' => 24,
                'reminder_intervals' => [24, 48, 72],
                'validation_rules' => ['not_empty', 'min_length:50']
            ],
            'san_pham_tuong_tu' => [
                'required' => true,
                'check_after_hours' => 48,
                'reminder_intervals' => [48, 96, 144],
                'validation_rules' => ['not_empty', 'has_comparison']
            ],
            'usp_canh_tranh' => [
                'required' => true,
                'check_after_hours' => 72,
                'reminder_intervals' => [72, 144, 216],
                'validation_rules' => ['not_empty', 'min_length:30', 'has_unique_points']
            ]
        ]
    ]
];

// app/Jobs/CheckProductInformationCompleteness.php
class CheckProductInformationCompleteness implements ShouldQueue
{
    public function handle(ProductInformationValidator $validator): void
    {
        $products = Product::where('status', '!=', 'discontinued')
                          ->where('completeness_percentage', '<', 100)
                          ->get();
        
        foreach ($products as $product) {
            $validation = $validator->validateProductCompleteness($product);
            
            // Update completeness percentage
            $product->update([
                'completeness_percentage' => $validation['completeness_score']
            ]);
            
            // Create alerts for errors (overdue fields)
            if (!empty($validation['errors'])) {
                $this->createProductInfoAlerts($product, $validation['errors'], 'critical');
            }
            
            // Create warnings for upcoming deadlines
            if (!empty($validation['warnings'])) {
                $this->createProductInfoAlerts($product, $validation['warnings'], 'warning');
            }
        }
    }
    
    private function createProductInfoAlerts(Product $product, array $issues, string $priority): void
    {
        foreach ($issues as $issue) {
            Alert::create([
                'product_id' => $product->id,
                'type' => 'product_information_missing',
                'priority' => $priority,
                'primary_responsible_department' => $product->primary_owner_department,
                'secondary_involved_departments' => $product->secondary_access_departments,
                'message' => "Product Info: {$issue}",
                'due_date' => now()->addHours(2), // Give 2 hours to fix
                'status' => 'open'
            ]);
        }
    }
}
```

#### Deliverables:
- [ ] Product information validation service
- [ ] Configurable validation rules system
- [ ] Completeness scoring algorithm
- [ ] Automatic compliance checking jobs
- [ ] Product information alert generation

---

## **PHASE 2.5: DOCUMENT REQUIREMENTS MATRIX (Tuần 6.5)**

### Detailed Document Configuration System
#### Document Requirements Implementation:
```php
// database/seeders/DocumentRequirementsSeeder.php
class DocumentRequirementsSeeder extends Seeder
{
    public function run(): void
    {
        $requirements = [
            // Thông tin sản phẩm
            ['document_type' => 'mo_ta_san_pham_chi_tiet', 'category' => 'thong_tin_san_pham', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['MKT', 'ECOM'], 'is_required' => true, 'deadline_hours' => 0, 'applies_to' => 'product'],
            ['document_type' => 'thong_so_ky_thuat', 'category' => 'thong_tin_san_pham', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['MKT', 'ECOM', 'WH'], 'is_required' => true, 'deadline_hours' => 24, 'applies_to' => 'product'],
            
            // Hình ảnh/Video gốc
            ['document_type' => 'anh_san_pham_goc', 'category' => 'hinh_anh_video_goc', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['MKT', 'ECOM', 'COM'], 'is_required' => true, 'deadline_hours' => 24, 'file_types' => ['jpg', 'png', 'tiff'], 'applies_to' => 'product'],
            ['document_type' => 'video_gioi_thieu', 'category' => 'hinh_anh_video_goc', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['MKT', 'ECOM', 'COM'], 'is_required' => false, 'deadline_hours' => 72, 'file_types' => ['mp4', 'avi', 'mov'], 'applies_to' => 'product'],
            
            // Giấy tờ sản phẩm
            ['document_type' => 'giay_cong_bo', 'category' => 'giay_to_san_pham', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['LEG'], 'is_required' => false, 'deadline_hours' => 720, 'file_types' => ['pdf'], 'applies_to' => 'product'], // 30 days
            ['document_type' => 'giay_phep_quang_cao', 'category' => 'giay_to_san_pham', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['LEG', 'MKT'], 'is_required' => false, 'deadline_hours' => 720, 'file_types' => ['pdf'], 'applies_to' => 'product'],
            ['document_type' => 'dang_ky_luu_hanh', 'category' => 'giay_to_san_pham', 'primary_owner_department' => 'RND', 'secondary_access_departments' => ['LEG'], 'is_required' => false, 'deadline_hours' => 1440, 'file_types' => ['pdf'], 'applies_to' => 'product'], // 60 days
            
            // Giấy tờ về lô hàng
            ['document_type' => 'hop_dong_mua_ban', 'category' => 'giay_to_lo_hang', 'primary_owner_department' => 'PUR', 'secondary_access_departments' => ['WH', 'LEG'], 'is_required' => true, 'deadline_hours' => 72, 'file_types' => ['pdf', 'doc', 'docx'], 'applies_to' => 'batch'],
            ['document_type' => 'hoa_don', 'category' => 'giay_to_lo_hang', 'primary_owner_department' => 'PUR', 'secondary_access_departments' => ['WH', 'LEG'], 'is_required' => true, 'deadline_hours' => 120, 'file_types' => ['pdf'], 'applies_to' => 'batch'], // 5 days
            ['document_type' => 'don_dat_hang', 'category' => 'giay_to_lo_hang', 'primary_owner_department' => 'PUR', 'secondary_access_departments' => ['WH'], 'is_required' => true, 'deadline_hours' => 0, 'file_types' => ['pdf', 'doc'], 'applies_to' => 'batch'],
            ['document_type' => 'bien_ban_nhap_kho', 'category' => 'giay_to_lo_hang', 'primary_owner_department' => 'WH', 'secondary_access_departments' => ['PUR'], 'is_required' => true, 'deadline_hours' => 168, 'file_types' => ['pdf'], 'applies_to' => 'batch'], // 7 days
            ['document_type' => 'packing_list', 'category' => 'giay_to_lo_hang', 'primary_owner_department' => 'PUR', 'secondary_access_departments' => ['WH'], 'is_required' => false, 'deadline_hours' => 120, 'file_types' => ['pdf', 'xlsx'], 'applies_to' => 'batch'],
            ['document_type' => 'van_don', 'category' => 'giay_to_lo_hang', 'primary_owner_department' => 'PUR', 'secondary_access_departments' => ['WH'], 'is_required' => false, 'deadline_hours' => 168, 'file_types' => ['pdf'], 'applies_to' => 'batch'],
            
            // Content Marketing
            ['document_type' => 'anh_chup_san_pham', 'category' => 'content_marketing', 'primary_owner_department' => 'MKT', 'secondary_access_departments' => ['ECOM', 'COM'], 'is_required' => true, 'deadline_hours' => 48, 'file_types' => ['jpg', 'png'], 'applies_to' => 'product'],
            ['document_type' => 'anh_thiet_ke', 'category' => 'content_marketing', 'primary_owner_department' => 'MKT', 'secondary_access_departments' => ['ECOM', 'COM'], 'is_required' => true, 'deadline_hours' => 72, 'file_types' => ['jpg', 'png', 'ai', 'psd'], 'applies_to' => 'product'],
            ['document_type' => 'video_quang_cao', 'category' => 'content_marketing', 'primary_owner_department' => 'MKT', 'secondary_access_departments' => ['ECOM', 'COM'], 'is_required' => false, 'deadline_hours' => 168, 'file_types' => ['mp4', 'mov'], 'applies_to' => 'product'], // 7 days
            ['document_type' => 'script_quang_cao', 'category' => 'content_marketing', 'primary_owner_department' => 'MKT', 'secondary_access_departments' => ['ECOM', 'COM'], 'is_required' => true, 'deadline_hours' => 48, 'applies_to' => 'product'],
            
            // Content E-commerce
            ['document_type' => 'mo_ta_san_pham_web', 'category' => 'content_ecommerce', 'primary_owner_department' => 'ECOM', 'secondary_access_departments' => ['MKT'], 'is_required' => true, 'deadline_hours' => 48, 'applies_to' => 'product'],
            ['document_type' => 'hinh_anh_ecom', 'category' => 'content_ecommerce', 'primary_owner_department' => 'ECOM', 'secondary_access_departments' => ['MKT'], 'is_required' => true, 'deadline_hours' => 72, 'file_types' => ['jpg', 'png'], 'applies_to' => 'product'],
            
            // Content Truyền thông
            ['document_type' => 'anh_pr', 'category' => 'content_truyen_thong', 'primary_owner_department' => 'COM', 'secondary_access_departments' => ['MKT'], 'is_required' => false, 'deadline_hours' => 48, 'file_types' => ['jpg', 'png'], 'applies_to' => 'product'],
            ['document_type' => 'video_pr', 'category' => 'content_truyen_thong', 'primary_owner_department' => 'COM', 'secondary_access_departments' => ['MKT'], 'is_required' => false, 'deadline_hours' => 72, 'file_types' => ['mp4', 'mov'], 'applies_to' => 'product'],
            ['document_type' => 'thong_cao_bao_chi', 'category' => 'content_truyen_thong', 'primary_owner_department' => 'COM', 'secondary_access_departments' => ['MKT', 'LEG'], 'is_required' => false, 'deadline_hours' => 24, 'applies_to' => 'product']
        ];
        
        foreach ($requirements as $requirement) {
            DocumentRequirement::create($requirement);
        }
    }
}
```

#### Deliverables:
- [ ] Complete document requirements configuration (43 documents)
- [ ] Department-specific document rules
- [ ] Deadline management system  
- [ ] File type validation service
- [ ] Document requirements seeder

---

## **PHASE 2: DOCUMENT MANAGEMENT & COMPLIANCE (Tuần 5-8)**

### Tuần 5: Document Upload & Management
#### File Upload System:
```php
// app/Services/FileUploadService.php
class FileUploadService
{
    public function uploadDocument(UploadedFile $file, array $metadata): array
    {
        $filename = Str::uuid() . '_' . $file->getClientOriginalName();
        $path = "documents/{$metadata['department']}/{$metadata['product_code']}/{$filename}";
        
        // Upload to S3 or local storage
        Storage::disk('public')->putFileAs(
            dirname($path),
            $file,
            basename($path)
        );
        
        // Create document record
        $document = Document::create([
            'name' => $metadata['name'],
            'type' => $this->detectFileType($file),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            // ... other metadata
        ]);
        
        return [
            'document' => $document,
            'url' => Storage::url($path)
        ];
    }
}
```

#### Version Control System:
```php
// app/Models/DocumentVersion.php
class DocumentVersion extends Model
{
    protected $fillable = [
        'document_id', 'version_number', 'file_path',
        'changes_summary', 'created_by', 'is_current'
    ];
    
    public function document() {
        return $this->belongsTo(Document::class);
    }
}
```

#### Deliverables:
- [ ] File upload system với validation
- [ ] Document version control
- [ ] File preview functionality
- [ ] Bulk upload capabilities

### Tuần 6: Automated Compliance System
#### Compliance Checking Jobs:
```php
// app/Jobs/CheckProductComplianceJob.php
class CheckProductComplianceJob implements ShouldQueue
{
    public function handle(DocumentService $documentService): void
    {
        $products = Product::where('status', '!=', 'archived')->get();
        
        foreach ($products as $product) {
            $compliance = $documentService->checkDocumentCompliance($product);
            
            // Update compliance percentage
            $product->update([
                'compliance_percentage' => $compliance['compliance_percentage']
            ]);
            
            // Create alerts for missing documents
            $this->createAlertsForMissingDocuments($product, $compliance['missing_documents']);
        }
    }
}

// app/Jobs/CheckDocumentExpiryJob.php
class CheckDocumentExpiryJob implements ShouldQueue
{
    public function handle(): void
    {
        $expiringDocs = Document::where('deadline', '<=', now()->addDays(30))
            ->where('deadline', '>', now())
            ->where('status', 'active')
            ->get();
            
        foreach ($expiringDocs as $doc) {
            $this->createExpiryAlert($doc);
        }
    }
}
```

#### Alert System:
```php
// app/Models/Alert.php
class Alert extends Model
{
    protected $fillable = [
        'product_id', 'document_id', 'type', 'priority',
        'primary_responsible_department', 'secondary_involved_departments',
        'message', 'due_date', 'status', 'response_time_hours'
    ];
    
    protected $casts = [
        'secondary_involved_departments' => 'array',
        'due_date' => 'datetime'
    ];
}
```

#### Deliverables:
- [ ] Automated compliance checking system
- [ ] Alert generation và routing
- [ ] Configurable validation rules
- [ ] Scheduled jobs với Laravel Scheduler

### Tuần 7: Notification System
#### Multi-channel Notifications:
```php
// app/Services/NotificationService.php
class NotificationService
{
    public function sendDepartmentAlert(Alert $alert): void
    {
        $primaryDept = $alert->primary_responsible_department;
        $secondaryDepts = $alert->secondary_involved_departments ?? [];
        
        // Send to primary department (full responsibility)
        $this->sendPrimaryNotification($primaryDept, $alert);
        
        // Send to secondary departments (FYI/support)
        foreach ($secondaryDepts as $dept) {
            $this->sendSecondaryNotification($dept, $alert);
        }
    }
    
    private function sendPrimaryNotification(string $department, Alert $alert): void
    {
        // Email notification
        $users = User::where('department', $department)->get();
        foreach ($users as $user) {
            Mail::to($user)->send(new PrimaryAlertMail($alert));
        }
        
        // In-app notification
        Notification::send($users, new PrimaryAlertNotification($alert));
    }
}
```

#### Deliverables:
- [ ] Email notification system
- [ ] In-app notifications
- [ ] SMS notifications (optional)
- [ ] Department-based routing

### Tuần 8: Dashboard & Reporting Foundation
#### Basic Analytics:
```php
// app/Services/AnalyticsService.php
class AnalyticsService
{
    public function getDepartmentDashboardData(string $department): array
    {
        return [
            'total_products' => $this->getTotalProducts($department),
            'compliance_score' => $this->getComplianceScore($department),
            'recent_alerts' => $this->getRecentAlerts($department),
            'pending_tasks' => $this->getPendingTasks($department),
            'performance_trend' => $this->getPerformanceTrend($department)
        ];
    }
}
```

#### Deliverables:
- [ ] Basic dashboard APIs
- [ ] Department performance metrics
- [ ] Alert analytics
- [ ] Compliance tracking

---

## **PHASE 3: FRONTEND DEVELOPMENT (Tuần 9-12)**

### Tuần 9: React Foundation & Routing
#### Project Structure:
```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   └── dashboard/       # Dashboard components
├── pages/
│   ├── products/        # Product management
│   ├── documents/       # Document management
│   ├── departments/     # Department views
│   └── dashboard/       # Dashboard pages
├── services/            # API services
├── stores/              # Zustand stores
├── types/               # TypeScript definitions
├── hooks/               # Custom hooks
└── utils/               # Utility functions
```

#### Core Components:
```tsx
// src/components/layouts/MainLayout.tsx
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible theme="light" width={250}>
        <NavigationMenu />
      </Sider>
      <Layout>
        <Header>
          <UserProfile />
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
```

#### Deliverables:
- [ ] React routing với protected routes
- [ ] Main layout với Ant Design
- [ ] Authentication components
- [ ] Basic navigation menu

### Tuần 10: Product & Document Management UI
#### Product Management:
```tsx
// src/pages/products/ProductList.tsx
const ProductList: React.FC = () => {
  const { data: products, isLoading } = useProducts();
  
  const columns = [
    { title: 'SKU', dataIndex: 'code', key: 'code' },
    { title: 'Product Name', dataIndex: 'name', key: 'name' },
    { title: 'Department', dataIndex: 'primary_owner_department', key: 'department' },
    { title: 'Compliance', dataIndex: 'compliance_percentage', key: 'compliance' },
    { title: 'Actions', key: 'actions', render: (_, record) => <ActionButtons record={record} /> }
  ];
  
  return (
    <DataTable
      title="Products Management"
      columns={columns}
      dataSource={products}
      loading={isLoading}
      onAdd={() => navigate('/products/create')}
    />
  );
};
```

#### Document Library:
```tsx
// src/components/documents/DocumentLibrary.tsx
const DocumentLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'department' | 'category' | 'permission'>('department');
  
  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
          <Radio.Button value="department">By Department</Radio.Button>
          <Radio.Button value="category">By Category</Radio.Button>
          <Radio.Button value="permission">By Permission</Radio.Button>
        </Radio.Group>
      </div>
      
      <DocumentTree viewMode={viewMode} />
    </Card>
  );
};
```

#### Deliverables:
- [ ] Product CRUD interfaces
- [ ] Document management UI
- [ ] File upload với progress
- [ ] Permission-based UI elements

### Tuần 11: Dashboard & Analytics UI
#### Department Dashboard:
```tsx
// src/pages/dashboard/DepartmentDashboard.tsx
const DepartmentDashboard: React.FC<{ department: string }> = ({ department }) => {
  const { data: dashboardData } = useDepartmentDashboard(department);
  
  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Compliance Score"
              value={dashboardData?.compliance_score}
              suffix="%"
              valueStyle={{ color: dashboardData?.compliance_score >= 90 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        {/* More stat cards */}
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <AlertsWidget alerts={dashboardData?.recent_alerts} />
        </Col>
        <Col span={12}>
          <TasksWidget tasks={dashboardData?.pending_tasks} />
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <ProductCompletenessWidget department={department} />
        </Col>
      </Row>
    </div>
  );
};

// src/components/dashboard/ProductCompletenessWidget.tsx
const ProductCompletenessWidget: React.FC<{ department: string }> = ({ department }) => {
  const { data: completenessData } = useProductCompleteness(department);
  
  return (
    <Card title="Product Information Completeness">
      <Row gutter={16}>
        <Col span={8}>
          <div className="completeness-overview">
            <Progress 
              type="circle" 
              percent={completenessData?.overall_completion || 0}
              format={(percent) => `${percent}%`}
              size={120}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text strong>Overall Completion</Text>
            </div>
          </div>
        </Col>
        
        <Col span={8}>
          <div className="completeness-breakdown">
            <Title level={5}>Completion Breakdown:</Title>
            <div>
              <Tag color="green">Complete (100%): {completenessData?.complete_count || 0}</Tag>
            </div>
            <div>
              <Tag color="orange">Incomplete: {completenessData?.incomplete_count || 0}</Tag>
            </div>
            <div>
              <Tag color="red">Draft (0%): {completenessData?.draft_count || 0}</Tag>
            </div>
          </div>
        </Col>
        
        <Col span={8}>
          <div className="missing-fields">
            <Title level={5}>Most Missing Fields:</Title>
            {completenessData?.missing_fields?.slice(0, 5).map(field => (
              <div key={field.name} style={{ marginBottom: 8 }}>
                <Tag color="red">{field.display_name}</Tag>
                <Text type="secondary">{field.count} products</Text>
              </div>
            ))}
          </div>
        </Col>
      </Row>
      
      <Divider />
      
      <div className="upcoming-deadlines">
        <Title level={5}>Upcoming Deadlines:</Title>
        <List
          size="small"
          dataSource={completenessData?.upcoming_deadlines?.slice(0, 3) || []}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{item.sku}</Text>}
                description={
                  <div>
                    <Text type="warning">Missing: {item.missing_fields.join(', ')}</Text>
                    <br />
                    <Text type="secondary">{item.hours_remaining}h remaining</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};

// src/components/dashboard/CrossDepartmentActivityWidget.tsx
const CrossDepartmentActivityWidget: React.FC = () => {
  const { data: activityData } = useCrossDepartmentActivity();
  
  return (
    <Card title="Cross-Department Activity">
      <Tabs defaultActiveKey="documents_i_can_edit">
        <TabPane tab="Documents I Can Edit" key="documents_i_can_edit">
          <List
            dataSource={activityData?.editable_documents || []}
            renderItem={(doc: any) => (
              <List.Item
                actions={[
                  <Button type="link" size="small">Edit</Button>,
                  <Button type="link" size="small">View</Button>
                ]}
              >
                <List.Item.Meta
                  title={doc.name}
                  description={
                    <div>
                      <Tag color="blue">{doc.primary_owner} → [{doc.access_level}]</Tag>
                      <Text type="secondary">{doc.product_sku}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        
        <TabPane tab="Recent Views" key="recent_views">
          <List
            dataSource={activityData?.recently_viewed || []}
            renderItem={(doc: any) => (
              <List.Item>
                <List.Item.Meta
                  title={doc.name}
                  description={
                    <div>
                      <Text type="secondary">From {doc.department} • {doc.viewed_at}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        
        <TabPane tab="Comments & Discussions" key="comments">
          <List
            dataSource={activityData?.recent_comments || []}
            renderItem={(comment: any) => (
              <List.Item>
                <List.Item.Meta
                  title={comment.document_name}
                  description={
                    <div>
                      <Text>{comment.comment_preview}</Text>
                      <br />
                      <Text type="secondary">by {comment.author} • {comment.created_at}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};
```

#### Advanced Dashboard Features:
```tsx
// src/components/charts/ComplianceHeatmap.tsx
const ComplianceHeatmap: React.FC = () => {
  const { data: heatmapData } = useComplianceHeatmap();
  
  const config = {
    data: heatmapData || [],
    xField: 'department',
    yField: 'document_category',
    colorField: 'compliance_rate',
    color: ['#red', '#orange', '#yellow', '#green'],
    label: {
      style: {
        fill: '#fff',
        fontSize: 12,
      },
    },
  };
  
  return (
    <Card title="Compliance Rate Heatmap">
      <Heatmap {...config} />
    </Card>
  );
};

// src/components/charts/ProductCompletenessChart.tsx
const ProductCompletenessChart: React.FC = () => {
  const { data: chartData } = useProductCompletenessChart();
  
  const config = {
    data: chartData || [],
    xField: 'date',
    yField: 'completeness_percentage',
    seriesField: 'department',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };
  
  return (
    <Card title="Product Completeness Trend">
      <Line {...config} />
    </Card>
  );
};
```

#### Deliverables:
- [ ] Department-specific dashboards
- [ ] Analytics widgets
- [ ] Alert management UI
- [ ] Task management interface
- [ ] **Product completeness dashboard widgets**
- [ ] **Cross-department activity tracking**
- [ ] **Compliance heatmap visualization**
- [ ] **Advanced filtering và search components**

---

## **PHASE 3.5: ADVANCED DASHBOARD FEATURES (Tuần 11.5)**

### Enhanced Dashboard Implementation
#### Advanced Dashboard Components:
```tsx
// src/components/dashboard/EnhancedTaskManager.tsx
const EnhancedTaskManager: React.FC<{ department: string }> = ({ department }) => {
  const { data: tasks } = useEnhancedTasks(department);
  
  return (
    <Card title="My Tasks - Enhanced">
      <Tabs defaultActiveKey="urgent">
        <TabPane tab={<Badge count={tasks?.urgent?.length} color="red">Urgent Tasks</Badge>} key="urgent">
          <div className="task-section">
            <Text strong>🔥 Primary Owner Responsibilities ({tasks?.urgent?.primary?.length || 0}):</Text>
            <List
              dataSource={tasks?.urgent?.primary || []}
              renderItem={(task: any) => (
                <List.Item
                  actions={[
                    <Button type="primary" danger size="small">Fix Now</Button>,
                    <Button type="link" size="small">Details</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        <Tag color="red">[{task.department}→{task.involved_departments?.join(',')}]</Tag>
                        {task.product_sku}: {task.title}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="danger">Overdue: {task.days_overdue} days</Text>
                        <br />
                        <Text type="secondary">Assigned to: {task.assigned_to}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            
            <Divider />
            
            <Text strong>👁️ Secondary Access Tasks ({tasks?.urgent?.secondary?.length || 0}):</Text>
            <List
              dataSource={tasks?.urgent?.secondary || []}
              renderItem={(task: any) => (
                <List.Item
                  actions={[
                    <Button type="default" size="small">Review</Button>,
                    <Button type="link" size="small">Comment</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        <Tag color="orange">[{task.primary_owner}→{department}]</Tag>
                        {task.product_sku}: {task.title}
                      </div>
                    }
                    description={
                      <Text type="secondary">({task.primary_owner} owns, {department} has {task.access_level})</Text>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </TabPane>
        
        <TabPane tab={<Badge count={tasks?.this_week?.length}>This Week</Badge>} key="week">
          <TaskCalendarView tasks={tasks?.this_week || []} />
        </TabPane>
        
        <TabPane tab="Collaboration" key="collaboration">
          <CrossDepartmentCollaboration department={department} />
        </TabPane>
      </Tabs>
    </Card>
  );
};

// src/components/dashboard/ProductCompletenessHeatmap.tsx
const ProductCompletenessHeatmap: React.FC = () => {
  const { data: heatmapData } = useProductCompletenessHeatmap();
  
  return (
    <Card title="Product Information Completeness Heatmap">
      <div className="heatmap-container">
        <Row>
          <Col span={4}>
            <div className="heatmap-legend">
              <Title level={5}>Fields:</Title>
              {heatmapData?.fields?.map(field => (
                <div key={field} className="field-label">{field}</div>
              ))}
            </div>
          </Col>
          <Col span={20}>
            <div className="heatmap-grid">
              {heatmapData?.departments?.map(dept => (
                <div key={dept} className="dept-column">
                  <div className="dept-header">{dept}</div>
                  {heatmapData?.fields?.map(field => {
                    const completion = heatmapData?.data?.[dept]?.[field] || 0;
                    return (
                      <div 
                        key={`${dept}-${field}`}
                        className={`heatmap-cell ${this.getCompletionLevel(completion)}`}
                        title={`${dept} - ${field}: ${completion}% complete`}
                      >
                        {completion}%
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

// src/components/dashboard/DepartmentComparisonChart.tsx
const DepartmentComparisonChart: React.FC = () => {
  const { data: comparisonData } = useDepartmentComparison();
  
  const config = {
    data: comparisonData || [],
    xField: 'department',
    yField: 'score',
    seriesField: 'metric',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      score: {
        alias: 'Score (%)',
      },
    },
  };
  
  return (
    <Card title="Department Performance Comparison">
      <Column {...config} />
      
      <div className="comparison-insights" style={{ marginTop: 16 }}>
        <Alert
          message="Performance Insights"
          description={
            <div>
              <Text>🥇 Top Performer: {comparisonData?.top_performer?.department} ({comparisonData?.top_performer?.score}%)</Text>
              <br />
              <Text type="warning">⚠️ Needs Attention: {comparisonData?.needs_attention?.map(d => d.department).join(', ')}</Text>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
    </Card>
  );
};

// src/hooks/useProductCompleteness.ts
export const useProductCompleteness = (department?: string) => {
  return useQuery({
    queryKey: ['product-completeness', department],
    queryFn: async () => {
      const response = await api.get('/api/products/completeness/statistics', {
        params: { department }
      });
      return response.data.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// src/hooks/useEnhancedTasks.ts
export const useEnhancedTasks = (department: string) => {
  return useQuery({
    queryKey: ['enhanced-tasks', department],
    queryFn: async () => {
      const response = await api.get(`/api/tasks/enhanced/${department}`);
      return response.data.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
```

#### Mobile-Optimized Components:
```tsx
// src/components/mobile/MobileDashboard.tsx
const MobileDashboard: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!isMobile) return <DesktopDashboard />;
  
  return (
    <div className="mobile-dashboard">
      <div className="mobile-stats-cards">
        <SwipeableViews>
          <ComplianceScoreCard />
          <TaskSummaryCard />
          <AlertsCard />
          <CompletenessCard />
        </SwipeableViews>
      </div>
      
      <div className="mobile-quick-actions">
        <Row gutter={8}>
          <Col span={12}>
            <Button block type="primary" icon={<PlusOutlined />}>
              Add Document
            </Button>
          </Col>
          <Col span={12}>
            <Button block icon={<SearchOutlined />}>
              Quick Search
            </Button>
          </Col>
        </Row>
      </div>
      
      <div className="mobile-task-list">
        <TaskList mobile />
      </div>
    </div>
  );
};
```

#### Deliverables:
- [ ] Enhanced task management with Primary/Secondary role distinction
- [ ] Product completeness heatmap visualization
- [ ] Department performance comparison charts
- [ ] Cross-department collaboration tracking
- [ ] Mobile-optimized dashboard components
- [ ] Real-time data refresh mechanisms
- [ ] Advanced filtering và search interfaces

### Tuần 12: Real-time Features & Polish
#### Real-time Updates:
```tsx
// src/hooks/useRealTimeUpdates.ts
export const useRealTimeUpdates = (department: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const echo = new Echo({
      broadcaster: 'pusher',
      key: process.env.REACT_APP_PUSHER_KEY,
    });
    
    const channel = echo.private(`department.${department}`);
    
    channel.listen('.alert.created', (event: any) => {
      queryClient.invalidateQueries(['alerts', department]);
    });
    
    channel.listen('.document.updated', (event: any) => {
      queryClient.invalidateQueries(['documents', department]);
    });
    
    return () => {
      echo.leave(`department.${department}`);
    };
  }, [department, queryClient]);
};
```

#### Deliverables:
- [ ] Real-time notifications
- [ ] Live dashboard updates
- [ ] WebSocket integration
- [ ] UI polish và optimization

---

## **PHASE 4: LARK BASE INTEGRATION (Tuần 13-16)**

### Tuần 13: Lark Base API Setup
#### Authentication & Configuration:
```php
// config/lark.php
return [
    'app_id' => env('LARK_APP_ID'),
    'app_secret' => env('LARK_APP_SECRET'),
    'base_token' => env('LARK_BASE_TOKEN'),
    'api_endpoints' => [
        'base_api' => 'https://open.larksuite.com/open-apis/bitable/v1',
        'bot_api' => 'https://open.larksuite.com/open-apis/im/v1'
    ],
    'tables' => [
        'products_overview' => 'tbl_products_overview',
        'dept_alert_monitor' => 'tbl_dept_alert_monitor',
        'dept_performance' => 'tbl_dept_performance'
    ]
];

// app/Services/LarkBaseService.php
class LarkBaseService
{
    public function getAccessToken(): string
    {
        return Cache::remember('lark_access_token', 7000, function () {
            $response = Http::post(config('lark.api_endpoints.auth_api') . '/tenant_access_token/internal', [
                'app_id' => config('lark.app_id'),
                'app_secret' => config('lark.app_secret')
            ]);
            
            return $response->json()['tenant_access_token'];
        });
    }
}
```

#### Deliverables:
- [ ] Lark API authentication
- [ ] Base table structure setup
- [ ] API wrapper classes
- [ ] Error handling & retry logic

### Tuần 14: Data Synchronization
#### Sync Jobs:
```php
// app/Jobs/SyncProductsToLarkJob.php
class SyncProductsToLarkJob implements ShouldQueue
{
    public function handle(LarkBaseService $larkService): void
    {
        $products = Product::with(['documents', 'alerts'])->get();
        
        $larkRecords = $products->map(function ($product) {
            return [
                'fields' => [
                    'fld_sku' => $product->code,
                    'fld_product_name' => $product->name,
                    'fld_primary_dept' => $product->primary_owner_department,
                    'fld_compliance_pct' => $product->compliance_percentage,
                    'fld_critical_alerts' => $product->alerts()->where('priority', 'critical')->count(),
                    'fld_last_updated' => $product->updated_at->toISOString()
                ]
            ];
        });
        
        $larkService->batchUpdateTable('products_overview', $larkRecords->toArray());
    }
}
```

#### Deliverables:
- [ ] Scheduled sync jobs
- [ ] Real-time sync triggers
- [ ] Data transformation logic
- [ ] Sync status monitoring

### Tuần 15: Lark Base Dashboard
#### Dashboard Configuration:
```markdown
## Lark Base Tables Structure:

### 1. Products Overview (tbl_products_overview)
- SKU (Text)
- Product Name (Text) 
- Primary Department (Select)
- Secondary Departments (Multi-Select)
- Compliance % (Number)
- Critical Alerts (Number)
- Last Updated (DateTime)

### 2. Department Alert Monitor (tbl_dept_alert_monitor)
- Alert ID (Text)
- Priority (Select: Critical/Warning/Info)
- Responsible Department (Select)
- Involved Departments (Multi-Select)
- Product SKU (Link to Products)
- Message (Long Text)
- Due Date (Date)
- Status (Select)

### 3. Department Performance (tbl_dept_performance)
- Department (Select)
- Report Date (Date)
- Primary Products (Number)
- Secondary Products (Number)
- Overall Compliance (Number)
- Critical Alerts (Number)
- Response Time Avg (Number)
- Trend (Select: Improving/Stable/Declining)
```

#### Deliverables:
- [ ] Lark Base table setup
- [ ] Dashboard views configuration
- [ ] Interactive charts
- [ ] Mobile-friendly layout

### Tuần 16: Lark Bot Integration
#### Bot Notifications:
```php
// app/Services/LarkBotService.php
class LarkBotService
{
    public function sendDepartmentAlert(Alert $alert): void
    {
        $message = [
            'msg_type' => 'interactive',
            'card' => [
                'header' => [
                    'title' => [
                        'tag' => 'plain_text',
                        'content' => "🚨 [{$alert->primary_responsible_department}] ALERT"
                    ],
                    'template' => $alert->priority === 'critical' ? 'red' : 'orange'
                ],
                'elements' => [
                    [
                        'tag' => 'div',
                        'text' => [
                            'tag' => 'lark_md',
                            'content' => "**Product:** {$alert->product->code}\n**Issue:** {$alert->message}"
                        ]
                    ]
                ]
            ]
        ];
        
        $this->sendToGroup(config("lark.department_groups.{$alert->primary_responsible_department}"), $message);
    }
}
```

#### Deliverables:
- [ ] Lark Bot setup
- [ ] Department group notifications
- [ ] Interactive message cards
- [ ] Bot command handlers

---

## **PHASE 5: TESTING & DEPLOYMENT (Tuần 17-20)**

### Tuần 17: Backend Testing
#### Test Coverage:
```php
// tests/Feature/DepartmentServiceTest.php
class DepartmentServiceTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_calculate_department_metrics_with_roles(): void
    {
        // Create test data
        $product = Product::factory()->create([
            'primary_owner_department' => 'RND',
            'secondary_access_departments' => ['MKT', 'ECOM']
        ]);
        
        $service = app(DepartmentService::class);
        $metrics = $service->calculateDepartmentMetricsWithRoles('RND');
        
        $this->assertEquals(1, $metrics['primary_owner_products']);
        $this->assertArrayHasKey('overall_compliance_score', $metrics);
    }
}

// tests/Feature/LarkBaseIntegrationTest.php
class LarkBaseIntegrationTest extends TestCase
{
    public function test_sync_products_to_lark_base(): void
    {
        Http::fake([
            'open.larksuite.com/*' => Http::response(['code' => 0])
        ]);
        
        Product::factory()->count(5)->create();
        
        $job = new SyncProductsToLarkJob();
        $job->handle(app(LarkBaseService::class));
        
        Http::assertSentCount(2); // Auth + Sync call
    }
}
```

#### Deliverables:
- [ ] Unit tests cho Services
- [ ] Feature tests cho APIs
- [ ] Integration tests cho Lark Base
- [ ] Performance testing

### Tuần 18: Frontend Testing
#### Component Testing:
```tsx
// src/components/__tests__/ProductForm.test.tsx
describe('ProductForm', () => {
  it('should validate required fields', async () => {
    render(<ProductForm onSubmit={jest.fn()} />);
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter product name')).toBeInTheDocument();
    });
  });
  
  it('should submit form with correct data', async () => {
    const mockSubmit = jest.fn();
    render(<ProductForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Product'
      });
    });
  });
});
```

#### Deliverables:
- [ ] Component unit tests
- [ ] Integration tests
- [ ] E2E testing với Cypress
- [ ] Accessibility testing

### Tuần 19: Security & Performance
#### Security Measures:
```php
// Security Checklist:
- [ ] API rate limiting
- [ ] Input validation & sanitization  
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] File upload security
- [ ] Authentication & authorization
- [ ] Data encryption at rest
```

#### Performance Optimization:
```php
// Performance Checklist:
- [ ] Database indexing
- [ ] Query optimization
- [ ] Caching strategy (Redis)
- [ ] File compression
- [ ] CDN setup
- [ ] API response optimization
- [ ] Frontend bundle optimization
- [ ] Image optimization
```

#### Deliverables:
- [ ] Security audit report
- [ ] Performance benchmarks
- [ ] Load testing results
- [ ] Security patches

### Tuần 20: Production Deployment
#### Deployment Setup:
```yaml
# docker-compose.production.yml
version: '3.8'
services:
  pim_backend:
    image: pim-backend:latest
    environment:
      - APP_ENV=production
      - LARK_APP_ID=${LARK_APP_ID}
    volumes:
      - ./storage:/var/www/storage
    depends_on:
      - mysql
      - redis

  pim_frontend:
    image: pim-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - pim_backend

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
```

#### Monitoring Setup:
```php
// Monitoring Checklist:
- [ ] Application monitoring (Sentry)
- [ ] Database monitoring
- [ ] Server monitoring  
- [ ] Log aggregation (ELK stack)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Lark Base sync monitoring
- [ ] Alert notifications
```

#### Deliverables:
- [ ] Production environment setup
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Backup & recovery procedures
- [ ] Documentation
- [ ] User training materials
- [ ] Go-live checklist

---

## 📝 DELIVERABLES SUMMARY

### Technical Documentation:
- [ ] **API Documentation** (Swagger/Postman)
- [ ] **Database Schema** documentation
- [ ] **Deployment Guide** với Docker
- [ ] **User Manual** cho end users
- [ ] **Admin Guide** cho system administrators
- [ ] **Integration Guide** cho Lark Base

### Code Deliverables:
- [ ] **Laravel Backend** với complete functionality
- [ ] **React Frontend** với responsive design
- [ ] **Lark Base Integration** với real-time sync
- [ ] **Test Suite** với adequate coverage
- [ ] **Docker Configuration** cho development và production
- [ ] **CI/CD Pipeline** setup

### Business Deliverables:
- [ ] **Working PIM System** với 9 loại tài liệu
- [ ] **Automated Compliance** checking
- [ ] **Department-based** workflow
- [ ] **Real-time Dashboards** trên Lark Base
- [ ] **Cross-department Collaboration** tools
- [ ] **Mobile-friendly** interface

---

## 🎯 SUCCESS METRICS

### Technical KPIs:
- **System Uptime**: > 99.5%
- **API Response Time**: < 200ms average
- **Page Load Time**: < 3 seconds
- **File Upload Success Rate**: > 98%
- **Lark Base Sync Success**: > 99%
- **Product Information Completeness**: > 95% within deadlines

### Business KPIs:
- **Document Compliance Rate**: Từ hiện tại lên > 95%
- **Alert Response Time**: < 4 hours average  
- **Cross-department Collaboration**: Measurable increase in cross-access usage
- **User Adoption Rate**: > 90% trong 3 tháng
- **Executive Dashboard Usage**: Daily access by leadership
- **Product Information Quality**: > 90% products với completeness score > 95%

### User Experience:
- **Training Time**: < 2 hours cho new users  
- **User Satisfaction**: > 4.5/5 rating
- **Support Tickets**: < 5% của total transactions
- **Mobile Usage**: > 30% của total access
- **Cross-Department Activity**: > 60% users accessing secondary documents monthly

### Compliance & Quality:
- **Critical Alerts Resolution**: < 24 hours average
- **Document Upload Timeliness**: > 90% within deadlines
- **Information Accuracy**: > 95% validation pass rate
- **Department Performance Variance**: < 15% difference between top and bottom performers

---

## 🚀 NEXT STEPS

### Immediate Actions:
1. **Setup Development Environment** (Tuần 1)
2. **Create Project Repositories** (GitHub)
3. **Setup CI/CD Pipeline** (GitHub Actions)
4. **Lark Base Account Setup** và app registration
5. **Team Onboarding** và role assignments

### Key Decisions Needed:
1. **Hosting Platform** (AWS/GCP/Azure/VPS)
2. **Domain & SSL** setup
3. **Backup Strategy** và retention policy
4. **User Training Schedule**
5. **Go-live Timeline** và rollout strategy

### Risk Mitigation:
1. **Regular Code Reviews** và quality checks
2. **Continuous Testing** throughout development
3. **Staging Environment** cho thorough testing
4. **Data Migration Strategy** từ hệ thống hiện tại
5. **Rollback Plan** trong trường hợp issues

---

**Tổng thời gian ước tính**: **23 tuần (5.75 tháng)**
**Team size khuyến nghị**: **3-4 developers** (1 senior full-stack, 1 backend specialist, 1 frontend specialist, 1 mid-level)
**Budget estimate**: Tùy thuộc vào infrastructure và team cost

### Enhanced Timeline Breakdown:
- **Phase 1**: Foundation (4 tuần)
- **Phase 1.5**: Product Validation (0.5 tuần) 
- **Phase 2**: Document Management (4 tuần)
- **Phase 2.5**: Document Requirements (0.5 tuần)
- **Phase 3**: Frontend Development (4 tuần) 
- **Phase 3.5**: Advanced Dashboard (0.5 tuần)
- **Phase 4**: Lark Base Integration (4 tuần)
- **Phase 5**: Testing & Deployment (4 tuần)
- **Buffer**: Quality Assurance & Polish (1.5 tuần)

Đây là một implementation plan **toàn diện và chi tiết** để xây dựng hệ thống PIM với đầy đủ tính năng theo yêu cầu, bao gồm cả những phần bổ sung quan trọng cho **Product Information Validation**, **Document Requirements Matrix**, và **Advanced Dashboard Features**.