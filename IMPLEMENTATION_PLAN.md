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
| Loại tài liệu | Primary Owner | Secondary Access | Bắt buộc | Thời hạn |
|---------------|---------------|------------------|----------|---------|
| Thông tin sản phẩm | RND | MKT, ECOM | ✓ | Ngay khi tạo |
| Hình ảnh/Video gốc | RND | MKT, ECOM, COM | ✓ | 24h |
| Giấy tờ sản phẩm | RND | LEG | | 30-60 ngày |
| Giấy tờ lô hàng | PUR | WH, LEG | ✓ | 3-7 ngày |
| Content Marketing | MKT | ECOM, COM | ✓ | 48-72h |
| Content E-commerce | ECOM | MKT | ✓ | 48-72h |
| Content Truyền thông | COM | MKT | | 24-72h |
| Tài liệu pháp lý | LEG | RND, PUR | | Variable |
| Tài liệu kho bãi | WH | PUR | ✓ | 7 ngày |

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
-- Departments (Fixed 7 departments)
CREATE TABLE departments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products với department ownership
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    description TEXT,
    primary_owner_department VARCHAR(10),
    secondary_access_departments JSON,
    status ENUM('development', 'active', 'discontinued') DEFAULT 'development',
    compliance_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_department) REFERENCES departments(code)
);

-- Documents với Primary/Secondary access
CREATE TABLE documents (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('text', 'file', 'image', 'video') NOT NULL,
    category VARCHAR(100) NOT NULL,
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
    status ENUM('draft', 'active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_department) REFERENCES departments(code),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_product_documents (product_id),
    INDEX idx_department_documents (primary_owner_department)
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
        'code', 'name', 'brand', 'description',
        'primary_owner_department', 'secondary_access_departments',
        'status', 'compliance_percentage'
    ];
    
    protected $casts = [
        'secondary_access_departments' => 'array',
        'compliance_percentage' => 'decimal:2'
    ];
    
    public function documents() {
        return $this->hasMany(Document::class);
    }
    
    public function alerts() {
        return $this->hasMany(Alert::class);
    }
}

// app/Models/Document.php  
class Document extends Model
{
    use HasFactory, LogsActivity;
    
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'name', 'type', 'category', 'primary_owner_department',
        'secondary_access_departments', 'access_level', 'product_id',
        'file_path', 'is_required', 'deadline'
    ];
    
    protected $casts = [
        'secondary_access_departments' => 'array',
        'is_required' => 'boolean',
        'deadline' => 'datetime'
    ];
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
            // ... more metrics
        ];
    }
}

// app/Services/DocumentService.php
class DocumentService
{
    public function checkDocumentCompliance(Product $product): array
    {
        $requiredDocs = $this->getRequiredDocuments($product);
        $existingDocs = $product->documents()->where('is_required', true)->get();
        
        return [
            'required_count' => $requiredDocs->count(),
            'completed_count' => $existingDocs->count(),
            'missing_documents' => $this->getMissingDocuments($requiredDocs, $existingDocs),
            'compliance_percentage' => $this->calculateCompliancePercentage($requiredDocs, $existingDocs)
        ];
    }
}
```

#### Deliverables:
- [ ] DepartmentService với metrics calculation
- [ ] DocumentService với compliance checking
- [ ] ProductService với validation logic
- [ ] FileUploadService với S3 integration

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
}
```

#### Deliverables:
- [ ] RESTful APIs cho Products, Documents, Departments
- [ ] Authentication với Laravel Sanctum
- [ ] Permission-based access control
- [ ] API documentation với Postman/Swagger

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
    </div>
  );
};
```

#### Deliverables:
- [ ] Department-specific dashboards
- [ ] Analytics widgets
- [ ] Alert management UI
- [ ] Task management interface

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

### Business KPIs:
- **Document Compliance Rate**: Từ hiện tại lên > 95%
- **Alert Response Time**: < 4 hours average
- **Cross-department Collaboration**: Measurable increase
- **User Adoption Rate**: > 90% trong 3 tháng
- **Executive Dashboard Usage**: Daily access by leadership

### User Experience:
- **Training Time**: < 2 hours cho new users  
- **User Satisfaction**: > 4.5/5 rating
- **Support Tickets**: < 5% của total transactions
- **Mobile Usage**: > 30% của total access

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

**Tổng thời gian ước tính**: **20 tuần (5 tháng)**
**Team size khuyến nghị**: **3-4 developers** (1 senior, 2-3 mid-level)
**Budget estimate**: Tùy thuộc vào infrastructure và team cost

Đây là một plan chi tiết và thực tế để implement hệ thống PIM với đầy đủ tính năng theo yêu cầu từ các file specification.