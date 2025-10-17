# TÍCH HỢP LARK BASE CHO HỆ THỐNG PIM - LARAVEL + REACT IMPLEMENTATION

## 1. TỔNG QUAN TÍCH HỢP

### 1.1 Mục đích tích hợp theo mô hình Primary Owner + Secondary Access
- **Báo cáo thời gian thực**: Đẩy dữ liệu từ PIM (Laravel Backend) sang Lark Base với phân quyền rõ ràng theo phòng ban
- **Department Responsibility Tracking**: Theo dõi trách nhiệm từng phòng ban (Primary Owner vs Secondary Access)
- **Smart Notifications**: Thông báo có định tuyến theo phòng ban chịu trách nhiệm
- **Executive Visibility**: Dashboard cấp cao với phân tích cross-department collaboration
- **Mobile Access**: Truy cập báo cáo và nhận thông báo qua Lark mobile app

### 1.2 Kiến trúc tổng thể Laravel + React Architecture
```
┌──────────────────┐    Laravel API    ┌─────────────┐    Dept-based  ┌─────────────┐
│ React Frontend   │ ←──────────────── │ Lark Base   │ ──────────────→ │ Lark Bot    │
│ (Ant Design)     │                   │ Tables      │   Notifications │ (Per Dept)  │
└──────────────────┘                   └─────────────┘                └─────────────┘
         ↕                                     ↑                              │
    REST API Calls                     Laravel Jobs                          │
         ↕                                     │                              ▼
┌──────────────────┐    Queue Jobs     ┌─────────────┐                ┌─────────────┐
│ Laravel Backend  │ ──────────────→   │ Executive   │                │ Dept Chat   │
│ + Filament Admin │                   │ Dashboard   │                │ Groups      │
│ + Queue Workers  │                   │ + Dept Views│                │ + @mentions │
└──────────────────┘                   └─────────────┘                └─────────────┘
```

## 2. CẤU TRÚC LARK BASE THEO MÔ HÌNH MỚI

### 2.1 Danh sách các Base và Table

#### Base: "PIM Department Compliance Dashboard"

**Table 1: Products Overview với Department Responsibility** (`tbl_products_overview`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| sku | Single Line Text | Mã SKU sản phẩm | `fld_sku` |
| product_name | Single Line Text | Tên sản phẩm | `fld_product_name` |
| primary_owner_dept | Single Select | Phòng ban chủ quản (Primary Owner) | `fld_primary_dept` |
| secondary_access_depts | Multiple Select | Phòng ban có quyền truy cập | `fld_secondary_depts` |
| product_status | Single Select | Active/Development/Discontinued | `fld_product_status` |
| total_documents | Number | Tổng số tài liệu | `fld_total_docs` |
| required_documents | Number | Tài liệu bắt buộc | `fld_required_docs` |
| completed_documents | Number | Tài liệu đã hoàn thành | `fld_completed_docs` |
| compliance_percentage | Number | % Tuân thủ | `fld_compliance_pct` |
| critical_alerts | Number | Cảnh báo Critical cần xử lý ngay | `fld_critical_alerts` |
| warning_alerts | Number | Cảnh báo Warning sắp đến hạn | `fld_warning_alerts` |
| responsible_person | Single Line Text | Người phụ trách chính | `fld_responsible_person` |
| last_updated | Date | Ngày cập nhật cuối | `fld_last_updated` |
| next_review_date | Date | Ngày review tiếp theo | `fld_next_review` |

**Table 2: Department Alert Monitor** (`tbl_dept_alert_monitor`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| alert_id | Single Line Text | ID cảnh báo duy nhất | `fld_alert_id` |
| created_date | Date | Ngày tạo cảnh báo | `fld_created_date` |
| priority | Single Select | Critical/Warning/Info | `fld_priority` |
| sku | Link to Records | Liên kết đến Products | `fld_sku_link` |
| responsible_department | Single Select | Phòng ban chịu trách nhiệm chính | `fld_responsible_dept` |
| involved_departments | Multiple Select | Phòng ban liên quan (Secondary) | `fld_involved_depts` |
| document_type | Single Line Text | Loại tài liệu thiếu/hết hạn | `fld_doc_type` |
| alert_message | Long Text | Nội dung cảnh báo chi tiết | `fld_alert_message` |
| due_date | Date | Ngày đến hạn | `fld_due_date` |
| days_overdue | Number | Số ngày quá hạn | `fld_days_overdue` |
| primary_assigned | Single Line Text | Người phụ trách chính (Primary Owner) | `fld_primary_assigned` |
| secondary_notified | Multiple Select | Người được thông báo (Secondary Access) | `fld_secondary_notified` |
| status | Single Select | New/Assigned/In Progress/Resolved/Escalated | `fld_status` |
| escalation_level | Single Select | None/Department Admin/Super Admin | `fld_escalation` |
| resolution_notes | Long Text | Ghi chú xử lý | `fld_resolution` |

**Table 3: Department Performance Tracking** (`tbl_dept_performance`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| report_date | Date | Ngày báo cáo | `fld_report_date` |
| department | Single Select | Phòng ban | `fld_department` |
| primary_owner_products | Number | Sản phẩm làm Primary Owner | `fld_primary_products` |
| secondary_access_products | Number | Sản phẩm có Secondary Access | `fld_secondary_products` |
| total_responsibilities | Number | Tổng trách nhiệm | `fld_total_responsibilities` |
| compliant_primary | Number | Primary tasks tuân thủ | `fld_compliant_primary` |
| compliant_secondary | Number | Secondary tasks tuân thủ | `fld_compliant_secondary` |
| overall_compliance_score | Number | Điểm tuân thủ tổng thể (0-100) | `fld_overall_compliance` |
| primary_compliance_score | Number | Điểm tuân thủ Primary Owner | `fld_primary_compliance` |
| secondary_compliance_score | Number | Điểm tuân thủ Secondary Access | `fld_secondary_compliance` |
| critical_alerts_primary | Number | Critical alerts (Primary) | `fld_critical_primary` |
| critical_alerts_secondary | Number | Critical alerts (Secondary) | `fld_critical_secondary` |
| avg_response_time | Number | TG phản hồi TB (giờ) | `fld_avg_response` |
| cross_dept_collaboration | Number | Điểm hợp tác liên phòng ban | `fld_collaboration_score` |
| trend_direction | Single Select | ↗️ Improving/→ Stable/↘️ Declining | `fld_trend` |
| improvement_actions | Long Text | Hành động cải thiện | `fld_actions` |

**Table 4: Cross-Department Document Tracking** (`tbl_cross_dept_docs`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| sku | Link to Records | Liên kết đến Products | `fld_sku_link` |
| document_name | Single Line Text | Tên tài liệu | `fld_doc_name` |
| document_type | Single Select | Loại tài liệu | `fld_doc_type` |
| primary_owner_dept | Single Select | Phòng ban chủ quản | `fld_primary_dept` |
| secondary_access_depts | Multiple Select | Phòng ban có quyền truy cập | `fld_secondary_depts` |
| current_expiry_date | Date | Ngày hết hạn hiện tại | `fld_current_expiry` |
| renewal_due_date | Date | Ngày cần gia hạn | `fld_renewal_due` |
| days_to_expiry | Formula | Số ngày còn lại | `fld_days_to_expiry` |
| renewal_status | Single Select | Not Started/In Progress/Completed | `fld_renewal_status` |
| primary_responsible | Single Line Text | Người phụ trách chính | `fld_primary_responsible` |
| secondary_stakeholders | Multiple Select | Stakeholders từ phòng ban khác | `fld_secondary_stakeholders` |
| impact_departments | Multiple Select | Phòng ban bị ảnh hưởng nếu hết hạn | `fld_impact_depts` |
| renewal_cost | Number | Chi phí gia hạn | `fld_renewal_cost` |
| vendor_contact | Single Line Text | Liên hệ nhà cung cấp | `fld_vendor_contact` |

**Table 5: Department Workload Management** (`tbl_dept_workload`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| department | Single Select | Phòng ban | `fld_department` |
| week_starting | Date | Tuần bắt đầu | `fld_week_start` |
| primary_tasks_total | Number | Tổng tasks Primary Owner | `fld_primary_total` |
| primary_tasks_urgent | Number | Tasks Primary Owner khẩn cấp | `fld_primary_urgent` |
| primary_tasks_overdue | Number | Tasks Primary Owner quá hạn | `fld_primary_overdue` |
| secondary_tasks_total | Number | Tổng tasks Secondary Access | `fld_secondary_total` |
| secondary_tasks_urgent | Number | Tasks Secondary Access khẩn cấp | `fld_secondary_urgent` |
| cross_dept_requests | Number | Yêu cầu từ phòng ban khác | `fld_cross_requests` |
| workload_status | Single Select | Light/Normal/Heavy/Overloaded | `fld_workload_status` |
| team_capacity | Number | Sức chứa team (%) | `fld_team_capacity` |
| recommended_actions | Long Text | Đề xuất hành động | `fld_recommended_actions` |

## 3. LARAVEL BACKEND API INTEGRATION

### 3.1 Laravel Configuration Setup với Department Routing

```php
// config/lark.php
<?php

return [
    'app_id' => env('LARK_APP_ID', 'cli_xxxxxxxxxxxxx'),
    'app_secret' => env('LARK_APP_SECRET', 'xxxxxxxxxxxxxxxxxxxx'),
    'base_token' => env('LARK_BASE_TOKEN', 'bascnxxxxxxxxxxxxxxxxxx'),
    
    'department_mapping' => [
        'RND' => 'Research & Development',
        'MKT' => 'Marketing',
        'ECOM' => 'E-commerce',
        'PUR' => 'Purchasing',
        'LEG' => 'Legal',
        'WH' => 'Warehouse',
        'COM' => 'Communication'
    ],
    
    'notification_groups' => [
        'RND' => env('LARK_GROUP_RND', 'oc_xxxxxxxxxxxxx'),
        'MKT' => env('LARK_GROUP_MKT', 'oc_xxxxxxxxxxxxx'),
        'PUR' => env('LARK_GROUP_PUR', 'oc_xxxxxxxxxxxxx'),
        // ... các phòng ban khác
    ],
    
    'api_endpoints' => [
        'base_api' => 'https://open.larksuite.com/open-apis/bitable/v1',
        'bot_api' => 'https://open.larksuite.com/open-apis/im/v1',
        'auth_api' => 'https://open.larksuite.com/open-apis/auth/v3'
    ]
];
```

### 3.2 Laravel Service Classes cho Lark Integration

#### 3.2.1 LarkBaseService - Main Integration Service
```php
// app/Services/LarkBaseService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LarkBaseService
{
    private $appId;
    private $appSecret;
    private $baseToken;
    private $apiBase;

    public function __construct()
    {
        $this->appId = config('lark.app_id');
        $this->appSecret = config('lark.app_secret');
        $this->baseToken = config('lark.base_token');
        $this->apiBase = config('lark.api_endpoints.base_api');
    }

    /**
     * Get access token với caching
     */
    public function getAccessToken(): string
    {
        return Cache::remember('lark_access_token', 7000, function () {
            $response = Http::post(config('lark.api_endpoints.auth_api') . '/tenant_access_token/internal', [
                'app_id' => $this->appId,
                'app_secret' => $this->appSecret
            ]);

            $data = $response->json();

            if ($data['code'] !== 0) {
                throw new \Exception('Failed to get Lark access token: ' . $data['msg']);
            }

            return $data['tenant_access_token'];
        });
    }

    /**
     * Update product với department information
     */
    public function updateProductWithDepartmentInfo(string $sku, array $departmentData): array
    {
        $recordId = $this->findProductRecord($sku);
        
        $updateData = [
            'fields' => [
                'fld_primary_dept' => $departmentData['primary_owner_department'],
                'fld_secondary_depts' => $departmentData['secondary_access_departments'],
                'fld_responsible_person' => $departmentData['primary_responsible_person'],
                'fld_compliance_pct' => $departmentData['compliance_percentage'],
                'fld_critical_alerts' => $departmentData['critical_alerts_count'],
                'fld_last_updated' => now()->toISOString()
            ]
        ];

        $response = Http::withToken($this->getAccessToken())
            ->put("{$this->apiBase}/apps/{$this->baseToken}/tables/tbl_products_overview/records/{$recordId}", $updateData);

        return $response->json();
    }

    /**
     * Create department alert trong Lark Base
     */
    public function createDepartmentAlert(array $alertData): array
    {
        $recordData = [
            'fields' => [
                'fld_alert_id' => $alertData['id'],
                'fld_created_date' => Carbon::parse($alertData['created_at'])->format('Y-m-d'),
                'fld_priority' => $alertData['priority'],
                'fld_sku_link' => [$this->findProductRecord($alertData['sku'])],
                'fld_responsible_dept' => $alertData['primary_responsible_department'],
                'fld_involved_depts' => $alertData['secondary_involved_departments'],
                'fld_alert_message' => "[{$alertData['primary_responsible_department']}] {$alertData['message']}",
                'fld_due_date' => $alertData['due_date'] ? Carbon::parse($alertData['due_date'])->format('Y-m-d') : null,
                'fld_primary_assigned' => $alertData['primary_assigned_person'],
                'fld_secondary_notified' => $alertData['secondary_notified_persons'],
                'fld_status' => 'New'
            ]
        ];

        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->apiBase}/apps/{$this->baseToken}/tables/tbl_dept_alert_monitor/records", [
                'records' => [$recordData]
            ]);

        return $response->json();
    }

    /**
     * Batch update department performance
     */
    public function batchUpdateDepartmentPerformance(array $departments): array
    {
        $records = collect($departments)->map(function ($metrics, $deptCode) {
            return [
                'fields' => [
                    'fld_report_date' => now()->format('Y-m-d'),
                    'fld_department' => $deptCode,
                    'fld_primary_products' => $metrics['primary_owner_products'],
                    'fld_secondary_products' => $metrics['secondary_access_products'],
                    'fld_total_responsibilities' => $metrics['total_responsibilities'],
                    'fld_compliant_primary' => $metrics['compliant_primary_tasks'],
                    'fld_compliant_secondary' => $metrics['compliant_secondary_tasks'],
                    'fld_overall_compliance' => round($metrics['overall_compliance_score'], 2),
                    'fld_primary_compliance' => round($metrics['primary_compliance_score'], 2),
                    'fld_secondary_compliance' => round($metrics['secondary_compliance_score'], 2),
                    'fld_critical_primary' => $metrics['critical_alerts_primary'],
                    'fld_critical_secondary' => $metrics['critical_alerts_secondary'],
                    'fld_avg_response' => round($metrics['avg_response_time_hours'], 1),
                    'fld_collaboration_score' => round($metrics['cross_dept_collaboration_score'], 2),
                    'fld_trend' => $this->determineTrendDirection($metrics),
                    'fld_actions' => $this->generateImprovementActions($metrics)
                ]
            ];
        })->values()->toArray();

        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->apiBase}/apps/{$this->baseToken}/tables/tbl_dept_performance/records/batch_create", [
                'records' => $records
            ]);

        return $response->json();
    }

    private function findProductRecord(string $sku): ?string
    {
        // Implementation to find product record ID by SKU
        $response = Http::withToken($this->getAccessToken())
            ->get("{$this->apiBase}/apps/{$this->baseToken}/tables/tbl_products_overview/records", [
                'filter' => "fld_sku=\"{$sku}\""
            ]);

        $data = $response->json();
        return $data['data']['records'][0]['record_id'] ?? null;
    }
}
```

### 3.3 Laravel Jobs cho Department-aware Data Sync

#### 3.3.1 Products Sync Job với Primary Owner + Secondary Access
```php
// app/Jobs/SyncProductsToLarkJob.php
<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\LarkBaseService;
use App\Services\DepartmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncProductsToLarkJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
        //
    }

    public function handle(LarkBaseService $larkService, DepartmentService $deptService): void
    {
        Log::info('Starting products sync to Lark Base');

        try {
            // Lấy products với department responsibility information
            $products = Product::with(['category', 'documents', 'alerts'])
                ->where('status', '!=', 'archived')
                ->get();

            $larkRecords = $products->map(function ($product) use ($deptService) {
                $complianceData = $deptService->calculateProductCompliance($product);
                
                return [
                    'fields' => [
                        'fld_sku' => $product->code,
                        'fld_product_name' => $product->name,
                        'fld_primary_dept' => $product->primary_owner_department,
                        'fld_secondary_depts' => $product->secondary_access_departments ?? [],
                        'fld_product_status' => ucfirst($product->status),
                        'fld_total_docs' => $product->documents()->count(),
                        'fld_required_docs' => $deptService->getRequiredDocumentsCount($product),
                        'fld_completed_docs' => $product->documents()->where('status', 'approved')->count(),
                        'fld_compliance_pct' => round($complianceData['compliance_percentage'], 2),
                        'fld_critical_alerts' => $product->alerts()->where('priority', 'critical')->count(),
                        'fld_warning_alerts' => $product->alerts()->where('priority', 'warning')->count(),
                        'fld_responsible_person' => $product->primary_responsible_person,
                        'fld_last_updated' => $product->updated_at->toISOString(),
                        'fld_next_review' => $deptService->calculateNextReviewDate($product)->format('Y-m-d')
                    ]
                ];
            })->toArray();

            // Batch update to Lark Base
            $result = $larkService->batchUpdateTable('tbl_products_overview', $larkRecords);

            Log::info('Products sync completed', [
                'records_processed' => count($larkRecords),
                'success' => $result['code'] === 0
            ]);

        } catch (\Exception $e) {
            Log::error('Products sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
}
```

#### 3.3.2 Department Alert Sync Job
```php
// app/Jobs/SyncDepartmentAlertsJob.php
<?php

namespace App\Jobs;

use App\Models\Alert;
use App\Services\LarkBaseService;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class SyncDepartmentAlertsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(LarkBaseService $larkService, NotificationService $notificationService): void
    {
        // Lấy alerts mới trong 24h qua với department routing
        $alerts = Alert::with(['product'])
            ->where('created_at', '>=', now()->subHours(24))
            ->where('sync_status', '!=', 'synced')
            ->get();

        foreach ($alerts as $alert) {
            $alertData = [
                'id' => $alert->id,
                'created_at' => $alert->created_at,
                'priority' => $this->mapPriority($alert->priority),
                'sku' => $alert->product->code,
                'primary_responsible_department' => $alert->primary_responsible_department,
                'secondary_involved_departments' => $alert->secondary_involved_departments ?? [],
                'document_type' => $alert->document_type,
                'message' => $alert->message,
                'due_date' => $alert->due_date,
                'days_overdue' => $alert->days_overdue,
                'primary_assigned_person' => $alert->primary_assigned_person,
                'secondary_notified_persons' => $alert->secondary_notified_persons ?? []
            ];

            // Create alert record in Lark Base
            $result = $larkService->createDepartmentAlert($alertData);
            
            if ($result['code'] === 0) {
                $alert->update(['sync_status' => 'synced', 'lark_record_id' => $result['data']['record']['record_id']]);
                
                // Send department notifications
                $notificationService->sendDepartmentAlertNotification($alertData);
            }
        }
    }

    private function mapPriority(string $priority): string
    {
        return match($priority) {
            'critical' => 'Critical',
            'high' => 'High', 
            'medium' => 'Medium',
            'low' => 'Low',
            default => 'Medium'
        };
    }
}
```

#### 3.3.3 Department Service cho Business Logic
```php
// app/Services/DepartmentService.php
<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Department;
use App\Models\Alert;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class DepartmentService
{
    /**
     * Calculate department metrics với Primary/Secondary roles
     */
    public function calculateDepartmentMetricsWithRoles(string $departmentCode): array
    {
        // Primary Owner responsibilities
        $primaryProducts = Product::where('primary_owner_department', $departmentCode)->get();
        $primaryCompliance = $this->calculateComplianceScore($primaryProducts, 'primary');
        
        // Secondary Access responsibilities
        $secondaryProducts = Product::whereJsonContains('secondary_access_departments', $departmentCode)->get();
        $secondaryCompliance = $this->calculateComplianceScore($secondaryProducts, 'secondary');
        
        // Cross-department collaboration score
        $collaborationScore = $this->calculateCollaborationEffectiveness($departmentCode);
        
        return [
            'department' => $departmentCode,
            'primary_owner_products' => $primaryProducts->count(),
            'secondary_access_products' => $secondaryProducts->count(),
            'total_responsibilities' => $primaryProducts->count() + $secondaryProducts->count(),
            'compliant_primary_tasks' => $primaryProducts->where('compliance_percentage', '>=', 95)->count(),
            'compliant_secondary_tasks' => $secondaryProducts->where('compliance_percentage', '>=', 90)->count(),
            'overall_compliance_score' => $this->calculateOverallCompliance($primaryCompliance, $secondaryCompliance),
            'primary_compliance_score' => $primaryCompliance,
            'secondary_compliance_score' => $secondaryCompliance,
            'critical_alerts_primary' => $this->getCriticalAlerts($primaryProducts),
            'critical_alerts_secondary' => $this->getCriticalAlerts($secondaryProducts),
            'avg_response_time_hours' => $this->calculateAvgResponseTime($departmentCode),
            'cross_dept_collaboration_score' => $collaborationScore
        ];
    }

    /**
     * Calculate compliance score cho products với role context
     */
    public function calculateComplianceScore(Collection $products, string $role): float
    {
        if ($products->isEmpty()) {
            return 0;
        }

        $totalCompliance = $products->sum(function ($product) use ($role) {
            return $this->calculateProductCompliance($product, $role)['compliance_percentage'];
        });

        return round($totalCompliance / $products->count(), 2);
    }

    /**
     * Calculate product compliance với department context
     */
    public function calculateProductCompliance(Product $product, string $role = 'primary'): array
    {
        $requiredDocs = $this->getRequiredDocumentsCount($product);
        $completedDocs = $product->documents()->where('status', 'approved')->count();
        $expiredDocs = $product->documents()
            ->where('expiry_date', '<', now())
            ->where('status', '!=', 'renewed')
            ->count();

        $compliancePercentage = $requiredDocs > 0 
            ? (($completedDocs - $expiredDocs) / $requiredDocs) * 100 
            : 100;

        // Adjust compliance based on role
        if ($role === 'secondary') {
            // Secondary access has different compliance expectations
            $compliancePercentage *= 0.8; // Reduced expectation
        }

        return [
            'compliance_percentage' => max(0, round($compliancePercentage, 2)),
            'required_documents' => $requiredDocs,
            'completed_documents' => $completedDocs,
            'expired_documents' => $expiredDocs
        ];
    }

    /**
     * Calculate collaboration effectiveness giữa departments
     */
    public function calculateCollaborationEffectiveness(string $departmentCode): float
    {
        $crossDeptTasks = Alert::where(function ($query) use ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode)
                  ->orWhereJsonContains('secondary_involved_departments', $departmentCode);
        })
        ->where('created_at', '>=', now()->subDays(30))
        ->get();

        if ($crossDeptTasks->isEmpty()) {
            return 0;
        }

        $totalTasks = $crossDeptTasks->count();
        $completedOnTime = $crossDeptTasks->filter(function ($task) {
            return $task->status === 'resolved' && 
                   $task->resolved_at <= $task->due_date;
        })->count();

        $avgResponseTime = $crossDeptTasks->avg('response_time_hours') ?? 0;

        // Score calculation (0-100)
        $completionScore = ($completedOnTime / $totalTasks) * 50;
        $responseScore = max(0, 50 - (($avgResponseTime - 24) / 2)); // Penalty after 24h

        return round($completionScore + $responseScore, 2);
    }

    public function getRequiredDocumentsCount(Product $product): int
    {
        // Implementation based on product category and regulations
        return $product->category->required_documents ?? 5;
    }

    public function calculateNextReviewDate(Product $product): Carbon
    {
        // Calculate next review based on product risk level and department
        $baseInterval = match($product->risk_level ?? 'medium') {
            'high' => 30,    // 30 days
            'medium' => 90,  // 90 days  
            'low' => 180,    // 180 days
            default => 90
        };

        return now()->addDays($baseInterval);
    }

    private function getCriticalAlerts(Collection $products): int
    {
        return Alert::whereIn('product_id', $products->pluck('id'))
            ->where('priority', 'critical')
            ->where('status', '!=', 'resolved')
            ->count();
    }

    private function calculateAvgResponseTime(string $departmentCode): float
    {
        return Alert::where('primary_responsible_department', $departmentCode)
            ->where('created_at', '>=', now()->subDays(30))
            ->avg('response_time_hours') ?? 0;
    }

    private function calculateOverallCompliance(float $primary, float $secondary): float
    {
        $primaryWeight = 0.7;
        $secondaryWeight = 0.3;
        
        return round(($primary * $primaryWeight) + ($secondary * $secondaryWeight), 2);
    }
}
```

### 3.3 Department Performance Sync với Primary/Secondary Tracking
```python
def sync_department_performance_to_lark():
    """
    Đồng bộ performance của phòng ban với Primary Owner + Secondary Access tracking
    """
    # Calculate performance metrics cho từng department
    departments = ['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM']
    
    lark_records = []
    for dept_code in departments:
        metrics = calculate_department_metrics_with_roles(dept_code)
        
        record = {
            "fields": {
                "fld_department": dept_code,
                "fld_primary_products": metrics.primary_owner_products,
                "fld_secondary_products": metrics.secondary_access_products,
                "fld_total_responsibilities": metrics.total_responsibilities,
                "fld_compliant_primary": metrics.compliant_primary_tasks,
                "fld_compliant_secondary": metrics.compliant_secondary_tasks,
                "fld_overall_compliance": round(metrics.overall_compliance_score, 2),
                "fld_primary_compliance": round(metrics.primary_compliance_score, 2),
                "fld_secondary_compliance": round(metrics.secondary_compliance_score, 2),
                "fld_critical_primary": metrics.critical_alerts_primary,
                "fld_critical_secondary": metrics.critical_alerts_secondary,
                "fld_avg_response": round(metrics.avg_response_time_hours, 1),
                "fld_collaboration_score": round(metrics.cross_dept_collaboration_score, 2),
                "fld_trend": determine_trend_direction(metrics),
                "fld_actions": generate_improvement_actions(metrics)
            }
        }
        lark_records.append(record)
    
    return batch_update_lark_table("tbl_dept_performance", lark_records)

def calculate_department_metrics_with_roles(dept_code):
    """
    Tính toán metrics phòng ban với phân biệt Primary Owner vs Secondary Access
    """
    # Primary Owner responsibilities
    primary_products = get_products_where_primary_owner(dept_code)
    primary_compliance = calculate_compliance_score(primary_products, role="primary")
    
    # Secondary Access responsibilities  
    secondary_products = get_products_where_secondary_access(dept_code)
    secondary_compliance = calculate_compliance_score(secondary_products, role="secondary")
    
    # Cross-department collaboration score
    collaboration_score = calculate_collaboration_effectiveness(dept_code)
    
    return DepartmentMetrics(
        primary_owner_products=len(primary_products),
        secondary_access_products=len(secondary_products),
        primary_compliance_score=primary_compliance,
        secondary_compliance_score=secondary_compliance,
        cross_dept_collaboration_score=collaboration_score
    )
```

### 3.4 Laravel Notification Service với Department Routing
```php
// app/Services/NotificationService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private $larkBotApi;
    private $accessToken;

    public function __construct(LarkBaseService $larkService)
    {
        $this->larkBotApi = config('lark.api_endpoints.bot_api');
        $this->accessToken = $larkService->getAccessToken();
    }

    /**
     * Send department alert notification với routing logic
     */
    public function sendDepartmentAlertNotification(array $alertData): void
    {
        $primaryDept = $alertData['primary_responsible_department'];
        $secondaryDepts = $alertData['secondary_involved_departments'] ?? [];

        // Primary notification với full responsibility
        $this->sendPrimaryNotification($primaryDept, $alertData);

        // Secondary notifications với support context
        foreach ($secondaryDepts as $secondaryDept) {
            $this->sendSecondaryNotification($secondaryDept, $alertData, $primaryDept);
        }
    }

    /**
     * Send primary responsibility notification
     */
    private function sendPrimaryNotification(string $primaryDept, array $alertData): void
    {
        $message = [
            'msg_type' => 'interactive',
            'card' => [
                'header' => [
                    'title' => [
                        'tag' => 'plain_text',
                        'content' => "🚨 [{$primaryDept}] CẢNH BÁO CHÍNH - CẦN XỬ LÝ"
                    ],
                    'template' => 'red'
                ],
                'elements' => [
                    [
                        'tag' => 'div',
                        'text' => [
                            'tag' => 'lark_md',
                            'content' => $this->formatPrimaryMessage($alertData, $primaryDept)
                        ]
                    ],
                    [
                        'tag' => 'action',
                        'actions' => [
                            [
                                'tag' => 'button',
                                'text' => [
                                    'tag' => 'plain_text',
                                    'content' => 'Xử lý ngay'
                                ],
                                'url' => config('app.url') . "/alerts/{$alertData['id']}",
                                'type' => 'primary'
                            ],
                            [
                                'tag' => 'button',
                                'text' => [
                                    'tag' => 'plain_text', 
                                    'content' => 'Xem Dashboard'
                                ],
                                'url' => config('lark.base_url')
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $this->sendLarkMessage(
            config("lark.notification_groups.{$primaryDept}"),
            $message
        );
    }

    /**
     * Send secondary support notification
     */
    private function sendSecondaryNotification(string $secondaryDept, array $alertData, string $primaryDept): void
    {
        $message = [
            'msg_type' => 'text',
            'content' => [
                'text' => $this->formatSecondaryMessage($alertData, $secondaryDept, $primaryDept)
            ]
        ];

        $this->sendLarkMessage(
            config("lark.notification_groups.{$secondaryDept}"),
            $message
        );
    }

    /**
     * Format primary notification message
     */
    private function formatPrimaryMessage(array $alertData, string $primaryDept): string
    {
        return "📦 **Sản phẩm:** {$alertData['sku']}\n" .
               "📋 **Tài liệu:** {$alertData['document_type']}\n" .
               "⚠️ **Mức độ:** {$alertData['priority']}\n" .
               "📅 **Hạn chót:** " . ($alertData['due_date'] ?? 'Không xác định') . "\n" .
               "👤 **Phụ trách:** {$alertData['primary_assigned_person']}\n\n" .
               "**TRÁCH NHIỆM:** {$primaryDept} là phòng ban CHÍNH cần xử lý vấn đề này.";
    }

    /**
     * Format secondary notification message
     */
    private function formatSecondaryMessage(array $alertData, string $secondaryDept, string $primaryDept): string
    {
        return "ℹ️ **[{$secondaryDept}] THÔNG BÁO HỖ TRỢ - {$primaryDept}→{$secondaryDept}**\n\n" .
               "📦 **Sản phẩm:** {$alertData['sku']}\n" .
               "📋 **Tài liệu:** {$alertData['document_type']}\n\n" .
               "**THÔNG TIN:** {$primaryDept} đang xử lý, {$secondaryDept} theo dõi để hỗ trợ nếu cần.";
    }

    /**
     * Send message to Lark group
     */
    private function sendLarkMessage(string $groupId, array $message): void
    {
        try {
            $response = Http::withToken($this->accessToken)
                ->post("{$this->larkBotApi}/messages", [
                    'receive_id' => $groupId,
                    'receive_id_type' => 'chat_id',
                    'msg_type' => $message['msg_type'],
                    'content' => json_encode($message['msg_type'] === 'interactive' ? $message['card'] : $message['content'])
                ]);

            if (!$response->successful()) {
                Log::error('Failed to send Lark message', [
                    'group_id' => $groupId,
                    'response' => $response->json()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Exception sending Lark message', [
                'group_id' => $groupId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send executive summary notification
     */
    public function sendExecutiveSummary(array $summary): void
    {
        $message = [
            'msg_type' => 'interactive',
            'card' => [
                'header' => [
                    'title' => [
                        'tag' => 'plain_text',
                        'content' => '📊 BÁO CÁO TÌNH HÌNH PIM - EXECUTIVE SUMMARY'
                    ],
                    'template' => 'blue'
                ],
                'elements' => [
                    [
                        'tag' => 'div',
                        'text' => [
                            'tag' => 'lark_md',
                            'content' => $this->formatExecutiveSummary($summary)
                        ]
                    ],
                    [
                        'tag' => 'action',
                        'actions' => [
                            [
                                'tag' => 'button',
                                'text' => [
                                    'tag' => 'plain_text',
                                    'content' => 'Xem Dashboard Executive'
                                ],
                                'url' => config('lark.executive_dashboard_url'),
                                'type' => 'primary'
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $this->sendLarkMessage(config('lark.executive_group_id'), $message);
    }

    private function formatExecutiveSummary(array $summary): string
    {
        return "**TÌNH HÌNH TỔNG QUAN:**\n" .
               "• Critical Issues: {$summary['total_critical_issues']} vấn đề\n" .
               "• Phòng ban rủi ro: " . implode(', ', $summary['departments_at_risk']) . "\n" .
               "• Xung đột liên phòng ban: {$summary['cross_dept_conflicts']} cases\n" .
               "• Performance suy giảm: " . implode(', ', $summary['performance_declining']) . "\n\n" .
               "**HÀNH ĐỘNG CẦN THIẾT:**\n" . implode("\n", $summary['action_items']);
    }
}
```

### 3.5 Laravel Queue Configuration với Department-aware Processing

#### 3.5.1 Laravel Scheduler Configuration
```php
// app/Console/Kernel.php
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SyncProductsToLarkJob;
use App\Jobs\SyncDepartmentAlertsJob;
use App\Jobs\SyncDepartmentPerformanceJob;
use App\Jobs\AnalyzeCrossDeptCollaborationJob;
use App\Jobs\CheckDepartmentWorkloadBalanceJob;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Sync products với Primary/Secondary tracking mỗi 2 giờ
        $schedule->job(new SyncProductsToLarkJob())
                 ->everyTwoHours()
                 ->name('sync-products-with-dept-roles')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     Log::error('Products sync job failed');
                 });

        // Sync alerts với smart department routing mỗi 15 phút
        $schedule->job(new SyncDepartmentAlertsJob())
                 ->everyFifteenMinutes()
                 ->name('sync-dept-alerts')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Department performance với Primary/Secondary metrics hàng ngày
        $schedule->job(new SyncDepartmentPerformanceJob())
                 ->dailyAt('01:00')
                 ->name('daily-dept-performance-with-roles')
                 ->withoutOverlapping()
                 ->timezone('Asia/Ho_Chi_Minh');

        // Cross-department collaboration tracking hàng tuần
        $schedule->job(new AnalyzeCrossDeptCollaborationJob())
                 ->weeklyOn(0, '02:00') // Sunday 2:00 AM
                 ->name('weekly-collaboration-analysis')
                 ->withoutOverlapping();

        // Department workload balancing check hàng ngày
        $schedule->job(new CheckDepartmentWorkloadBalanceJob())
                 ->dailyAt('08:00')
                 ->name('workload-balancing-check')
                 ->weekdays()
                 ->withoutOverlapping();

        // Weekly executive report
        $schedule->call(function () {
            app(NotificationService::class)->sendWeeklySummary();
        })->weeklyOn(1, '09:00') // Monday 9:00 AM
          ->name('weekly-executive-report');
    }

    protected $commands = [
        //
    ];
}
```

#### 3.5.2 Queue Configuration
```php
// config/queue.php - Department-aware queue configuration
<?php

return [
    'default' => env('QUEUE_CONNECTION', 'database'),

    'connections' => [
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'default',
            'retry_after' => 90,
            'after_commit' => false,
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 90,
            'block_for' => null,
            'after_commit' => false,
        ],

        // Priority queues for different department operations
        'department_high_priority' => [
            'driver' => 'redis',
            'connection' => 'default',
            'queue' => 'dept_high',
            'retry_after' => 60,
        ],

        'department_normal' => [
            'driver' => 'redis', 
            'connection' => 'default',
            'queue' => 'dept_normal',
            'retry_after' => 90,
        ],

        'lark_sync' => [
            'driver' => 'redis',
            'connection' => 'default',
            'queue' => 'lark_sync',
            'retry_after' => 120,
        ],
    ],

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'failed_jobs',
    ],
];
```

#### 3.5.3 Department Performance Sync Job
```php
// app/Jobs/SyncDepartmentPerformanceJob.php
<?php

namespace App\Jobs;

use App\Services\LarkBaseService;
use App\Services\DepartmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncDepartmentPerformanceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3;

    public function handle(LarkBaseService $larkService, DepartmentService $deptService): void
    {
        Log::info('Starting department performance sync to Lark Base');

        try {
            $departments = config('lark.department_mapping');
            $performanceData = [];

            foreach ($departments as $deptCode => $deptName) {
                $metrics = $deptService->calculateDepartmentMetricsWithRoles($deptCode);
                $performanceData[$deptCode] = $metrics;
                
                Log::debug("Calculated metrics for {$deptCode}", $metrics);
            }

            // Batch update department performance in Lark Base
            $result = $larkService->batchUpdateDepartmentPerformance($performanceData);

            if ($result['code'] === 0) {
                Log::info('Department performance sync completed successfully', [
                    'departments_processed' => count($performanceData)
                ]);
            } else {
                throw new \Exception('Lark API returned error: ' . $result['msg']);
            }

        } catch (\Exception $e) {
            Log::error('Department performance sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Department performance sync job failed permanently', [
            'error' => $exception->getMessage()
        ]);

        // Notify administrators about the failure
        // Could trigger an alert or email notification here
    }
}
```

## 4. DASHBOARD VIEWS TRÊN LARK BASE THEO MÔ HÌNH DEPARTMENT-AWARE

### 4.1 Executive Dashboard View - Multi-Department Overview

#### View: "Management Overview với Primary/Secondary Tracking"
**Filters:**
- Department: All/Specific Department  
- Responsibility Type: Primary Owner/Secondary Access/Both
- Time Range: Last 7 days / Last 30 days / Custom

**Columns hiển thị:**
| Column | Description | Purpose |
|--------|-------------|---------|
| Department | Mã phòng ban | Identification |
| Primary Products | Số sản phẩm làm Primary Owner | Primary responsibility |
| Secondary Products | Số sản phẩm có Secondary Access | Secondary involvement |
| Primary Compliance | Điểm tuân thủ Primary (%) | Core performance |
| Secondary Compliance | Điểm tuân thủ Secondary (%) | Support performance |
| Critical Alerts (P) | Critical alerts Primary Owner | Primary urgency |
| Critical Alerts (S) | Critical alerts Secondary | Secondary urgency |
| Collaboration Score | Điểm hợp tác liên phòng ban | Cross-dept effectiveness |
| Trend | ↗️↘️→ | Performance direction |

**Conditional Formatting với Department Role Context:**
```
Primary Compliance Score:
- 95-100%: Dark Green (Excellent primary ownership)
- 85-94%: Light Green (Good primary performance)  
- 70-84%: Yellow (Primary needs attention)
- <70%: Red (Primary critical issues)

Secondary Compliance Score:
- 90-100%: Blue (Excellent support)
- 75-89%: Light Blue (Good support)
- 60-74%: Orange (Support needs improvement)
- <60%: Dark Orange (Poor support)

Critical Alerts:
- Primary: Red highlighting for urgent primary responsibilities
- Secondary: Orange highlighting for secondary support needs
```

#### View: "Critical Issues với Department Responsibility"
**Filters:**
- Priority: Critical only
- Responsibility Type: Primary/Secondary
- Department: All/Specific
- Status: New/In Progress

**Custom Fields hiển thị:**
- `[DEPT] Alert Message` - Hiển thị rõ department code
- Primary Assigned Person
- Secondary Notified Departments
- Days Overdue
- Impact on Other Departments

**Sort:** 
1. Primary responsibilities (higher priority)
2. Days Overdue (Descending)
3. Impact scope (cross-department issues first)

### 4.2 Department Manager Dashboard - Role-specific Views

#### View: "My Department - Primary Responsibilities"
**Filter cứng:** Department = Current User's Department AND Responsibility = Primary Owner

**Columns tối ưu cho Primary Owner:**
- SKU & Product Name
- Document Type  
- Compliance Status
- Days to Deadline
- Assigned Team Member
- Secondary Departments Involved
- Impact if Failed

#### View: "My Department - Secondary Support Tasks"  
**Filter cứng:** Department = Current User's Department AND Responsibility = Secondary Access

**Columns tối ưu cho Secondary Support:**
- SKU & Product Name
- Primary Owner Department
- Support Required
- Our Role/Contribution
- Timeline
- Support Status

#### View: "Cross-Department Collaboration"
**Filter:** Showing tasks where current department collaborates with others

**Columns:**
- Primary Owner Dept → Secondary Dept
- Collaboration Type
- Our Responsibility Level
- Communication Status
- Shared Documents
- Joint Deadlines

### 4.3 Team Lead Dashboard - Workload Management

#### View: "Department Workload với Primary/Secondary Balance"
**Purpose:** Cân bằng khối lượng công việc Primary vs Secondary

**Key Metrics:**
- Primary Tasks Count & Urgency
- Secondary Tasks Count & Urgency  
- Cross-Department Requests
- Team Capacity Utilization
- Recommended Actions

**Visual Indicators:**
```
Workload Status:
- Light (Green): <70% capacity, good balance
- Normal (Blue): 70-85% capacity, manageable
- Heavy (Yellow): 85-95% capacity, monitor closely  
- Overloaded (Red): >95% capacity, redistribute tasks
```

#### View: "Collaboration Effectiveness Tracking"
**Purpose:** Theo dõi hiệu quả hợp tác liên phòng ban

**Metrics:**
- Response time to cross-department requests
- Success rate of joint projects
- Communication quality score
- Resource sharing effectiveness
- Conflict resolution time

### 4.4 Individual Contributor Dashboard

#### View: "My Tasks với Department Context"
**Personal view filtered by assigned person**

**Sections:**
1. **Primary Responsibilities** (Tasks where my department is Primary Owner)
   - My direct assignments
   - High priority items
   - Approaching deadlines

2. **Secondary Support Tasks** (Tasks where my department provides support)
   - Support requests from other departments
   - Information sharing requirements
   - Review/approval tasks

3. **Cross-Department Communications**
   - Messages requiring response
   - Collaborative documents
   - Meeting action items

### 4.5 Real-time Monitoring Views

#### View: "Live Alert Feed với Department Routing"
**Auto-refresh mỗi 5 phút**

**Filter tabs:**
- All Alerts
- Primary Responsibility (my department)
- Secondary Involvement (my department)
- Cross-Department Issues
- Escalated Issues

**Alert Format:**
```
🚨 [PRIMARY-DEPT] → [SECONDARY-DEPTS] 
Product: SKU-123 | Document: Certificate
Assigned: Person Name | Due: 2 days
Status: ⚠️ Needs Attention
## 5. AUTOMATION & NOTIFICATION SYSTEM THEO DEPARTMENT ROUTING

### 5.1 Smart Notification Routing với Primary/Secondary Logic

#### 5.1.1 Alert Severity Routing
```python
def route_alert_by_department_role(alert):
    """
    Định tuyến thông báo dựa trên vai trò phòng ban và mức độ nghiêm trọng
    """
    primary_dept = alert.primary_responsible_department
    secondary_depts = alert.secondary_involved_departments
    severity = alert.severity_level
    
    routing_config = {
        "CRITICAL": {
            "primary_channels": ["lark_group", "email", "sms"],
            "secondary_channels": ["lark_group", "email"],
            "escalation_time": 2,  # hours
            "executive_notification": True
        },
        "HIGH": {
            "primary_channels": ["lark_group", "email"],
            "secondary_channels": ["lark_group"],
            "escalation_time": 4,  # hours
            "executive_notification": False
        },
        "MEDIUM": {
            "primary_channels": ["lark_group"],
            "secondary_channels": ["daily_digest"],
            "escalation_time": 24,  # hours
            "executive_notification": False
        }
    }
    
    config = routing_config[severity]
    
    # Send to Primary department với full responsibility
    send_primary_notification(
        department=primary_dept,
        alert=alert,
        channels=config["primary_channels"],
        message_type="action_required"
    )
    
    # Send to Secondary departments với support context
    for secondary_dept in secondary_depts:
        send_secondary_notification(
            department=secondary_dept,
            alert=alert,
            channels=config["secondary_channels"],
            message_type="fyi_support"
        )
    
    # Executive escalation if needed
    if config["executive_notification"]:
        schedule_executive_escalation(alert, config["escalation_time"])

def send_primary_notification(department, alert, channels, message_type):
    """
    Gửi thông báo đến phòng ban Primary Owner với trách nhiệm đầy đủ
    """
    message_template = get_primary_notification_template(alert.document_type)
    
    message = format_primary_message(
        template=message_template,
        alert=alert,
        department=department,
        urgency_level=alert.severity_level
    )
    
    for channel in channels:
        if channel == "lark_group":
            send_lark_message_with_actions(
                group_id=DEPT_GROUP_IDS[department],
                message=message,
                action_buttons=["Accept", "Delegate", "Escalate"]
            )
        elif channel == "email":
            send_department_email(
                department=department,
                subject=f"[{department}] {alert.subject}",
                message=message,
                priority="high"
            )

def send_secondary_notification(department, alert, channels, message_type):
    """
    Gửi thông báo đến phòng ban Secondary Access với context hỗ trợ
    """
    primary_dept = alert.primary_responsible_department
    
    message = f"""
ℹ️ **[{department}] THÔNG BÁO HỖ TRỢ - {primary_dept}→{department}**

📦 **Sản phẩm:** {alert.sku} - {alert.product_name}
📋 **Vấn đề:** {alert.document_type} - {alert.description}
👥 **Primary Owner:** {primary_dept} đang xử lý
🤝 **Vai trò của {department}:** {get_support_role_description(alert, department)}

**Hành động cần thiết từ {department}:**
{get_secondary_action_items(alert, department)}
    """
    
    for channel in channels:
        if channel == "lark_group":
            send_lark_message(
                group_id=DEPT_GROUP_IDS[department],
                message=message,
                message_type="info"
            )
```

### 5.2 Cross-Department Collaboration Workflows

#### 5.2.1 Document Handoff Process
```python
def initiate_cross_department_handoff(document, from_dept, to_dept, handoff_type):
    """
    Khởi tạo quy trình chuyển giao tài liệu giữa các phòng ban
    """
    handoff_types = {
        "primary_transfer": "Chuyển Primary Owner ownership",
        "secondary_request": "Yêu cầu Secondary Access support", 
        "review_request": "Yêu cầu review/approve từ phòng ban khác",
        "information_sharing": "Chia sẻ thông tin cần thiết"
    }
    
    # Create handoff request
    handoff_request = create_handoff_request(
        document=document,
        from_department=from_dept,
        to_department=to_dept,
        type=handoff_type,
        status="pending_acceptance"
    )
    
    # Notify receiving department
    notify_handoff_request(handoff_request)
    
    # Update Lark Base with handoff tracking
    sync_handoff_to_lark_base(handoff_request)
    
    return handoff_request

def notify_handoff_request(handoff_request):
    """
    Thông báo yêu cầu handoff đến phòng ban đích
    """
    to_dept = handoff_request.to_department
    from_dept = handoff_request.from_department
    
    message = f"""
🔄 **[{to_dept}] YÊU CẦU CHUYỂN GIAO - {from_dept}→{to_dept}**

📋 **Tài liệu:** {handoff_request.document.name}
📦 **Sản phẩm:** {handoff_request.document.sku}
🔄 **Loại chuyển giao:** {handoff_request.type_description}

**Thông tin từ {from_dept}:**
{handoff_request.handoff_notes}

**Yêu cầu từ {to_dept}:**
{handoff_request.required_actions}

⏰ **Thời hạn phản hồi:** {handoff_request.response_deadline}
    """
    
    send_lark_message_with_actions(
        group_id=DEPT_GROUP_IDS[to_dept],
        message=message,
        action_buttons=["Accept", "Request Info", "Decline", "Escalate"]
    )
```

### 5.3 Executive Reporting & Escalation

#### 5.3.1 Automated Executive Alerts
```python
def generate_executive_alert_summary():
    """
    Tạo báo cáo tóm tắt cho leadership với department breakdown
    """
    # Get critical issues by department
    critical_issues = get_critical_issues_by_department()
    
    # Get cross-department conflicts
    conflicts = get_cross_department_conflicts()
    
    # Get performance trends
    performance_trends = get_department_performance_trends(days=7)
    
    summary = {
        "total_critical_issues": sum(len(issues) for issues in critical_issues.values()),
        "departments_at_risk": [dept for dept, issues in critical_issues.items() if len(issues) > 3],
        "cross_dept_conflicts": len(conflicts),
        "performance_declining": [dept for dept, trend in performance_trends.items() if trend < -5],
        "action_items": generate_executive_action_items(critical_issues, conflicts, performance_trends)
    }
    
    # Send to executive group
    send_executive_summary(summary)
    
    # Update executive dashboard in Lark Base
    update_executive_dashboard_lark(summary)

def send_executive_summary(summary):
    """
    Gửi báo cáo tóm tắt đến executive team
    """
    message = f"""
📊 **BÁO CÁO TÌNH HÌNH PIM - EXECUTIVE SUMMARY**

**TÌNH HÌNH TỔNG QUAN:**
• Critical Issues: {summary['total_critical_issues']} vấn đề
• Phòng ban rủi ro: {', '.join(summary['departments_at_risk'])}
• Xung đột liên phòng ban: {summary['cross_dept_conflicts']} cases
• Performance suy giảm: {', '.join(summary['performance_declining'])}

**HÀNH ĐỘNG CẦN THIẾT:**
{format_executive_action_items(summary['action_items'])}

🔗 **Chi tiết:** [Xem Dashboard Executive](link_to_lark_base)
    """
    
    send_lark_message(
        group_id=EXECUTIVE_GROUP_ID,
        message=message,
## 4. REACT FRONTEND INTEGRATION VỚI LARK BASE

### 4.1 React Services cho Lark Integration

#### 4.1.1 Lark Base API Service
```tsx
// src/services/larkIntegrationService.ts
import { apiClient } from './api';

export interface LarkSyncStatus {
  sync_type: string;
  last_sync: string;
  status: 'success' | 'failed' | 'partial';
  records_processed: number;
  error_message?: string;
}

export interface DepartmentMetrics {
  department: string;
  primary_products: number;
  secondary_products: number;
  overall_compliance: number;
  critical_alerts: number;
  trend: 'improving' | 'stable' | 'declining';
}

class LarkIntegrationService {
  /**
   * Trigger manual sync to Lark Base
   */
  async triggerSync(syncType: 'products' | 'alerts' | 'performance'): Promise<void> {
    await apiClient.post(`/api/lark-sync/trigger/${syncType}`);
  }

  /**
   * Get sync status for dashboard
   */
  async getSyncStatus(): Promise<LarkSyncStatus[]> {
    const response = await apiClient.get('/api/lark-sync/status');
    return response.data.data;
  }

  /**
   * Get department performance metrics
   */
  async getDepartmentMetrics(): Promise<DepartmentMetrics[]> {
    const response = await apiClient.get('/api/lark-sync/department-metrics');
    return response.data.data;
  }

  /**
   * Send test notification to department
   */
  async sendTestNotification(department: string, message: string): Promise<void> {
    await apiClient.post('/api/lark-sync/test-notification', {
      department,
      message
    });
  }

  /**
   * Get Lark Base dashboard URL
   */
  getLarkBaseUrl(): string {
    return process.env.REACT_APP_LARK_BASE_URL || '#';
  }

  /**
   * Get executive dashboard URL
   */
  getExecutiveDashboardUrl(): string {
    return process.env.REACT_APP_LARK_EXECUTIVE_URL || '#';
  }
}

export const larkIntegrationService = new LarkIntegrationService();
```

#### 4.1.2 React Hook cho Lark Integration
```tsx
// src/hooks/useLarkIntegration.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { larkIntegrationService, DepartmentMetrics, LarkSyncStatus } from '../services/larkIntegrationService';
import { message } from 'antd';

export const useLarkSyncStatus = () => {
  return useQuery({
    queryKey: ['lark-sync-status'],
    queryFn: larkIntegrationService.getSyncStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useDepartmentMetrics = () => {
  return useQuery({
    queryKey: ['department-metrics'],
    queryFn: larkIntegrationService.getDepartmentMetrics,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useTriggerSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (syncType: 'products' | 'alerts' | 'performance') =>
      larkIntegrationService.triggerSync(syncType),
    onSuccess: (_, syncType) => {
      message.success(`${syncType} sync triggered successfully`);
      // Invalidate and refetch sync status
      queryClient.invalidateQueries({ queryKey: ['lark-sync-status'] });
    },
    onError: (error) => {
      message.error('Failed to trigger sync: ' + error.message);
    },
  });
};

export const useTestNotification = () => {
  return useMutation({
    mutationFn: ({ department, message: testMessage }: { department: string; message: string }) =>
      larkIntegrationService.sendTestNotification(department, testMessage),
    onSuccess: () => {
      message.success('Test notification sent successfully');
    },
    onError: (error) => {
      message.error('Failed to send test notification: ' + error.message);
    },
  });
};
```

#### 4.1.3 Lark Integration Dashboard Component
```tsx
// src/components/lark/LarkIntegrationDashboard.tsx
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Badge,
  Table,
  Select,
  Input,
  Space,
  Typography,
  Alert,
  Spin,
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  MinusOutlined,
  ExternalLinkOutlined,
} from '@ant-design/icons';
import { useLarkSyncStatus, useDepartmentMetrics, useTriggerSync, useTestNotification } from '../../hooks/useLarkIntegration';
import { larkIntegrationService } from '../../services/larkIntegrationService';

const { Title } = Typography;
const { Option } = Select;

const LarkIntegrationDashboard: React.FC = () => {
  const { data: syncStatus, isLoading: syncLoading } = useLarkSyncStatus();
  const { data: departmentMetrics, isLoading: metricsLoading } = useDepartmentMetrics();
  const triggerSync = useTriggerSync();
  const testNotification = useTestNotification();

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('');

  const departments = ['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'];

  const handleTriggerSync = (syncType: 'products' | 'alerts' | 'performance') => {
    triggerSync.mutate(syncType);
  };

  const handleTestNotification = () => {
    if (selectedDepartment && testMessage) {
      testNotification.mutate({
        department: selectedDepartment,
        message: testMessage,
      });
      setTestMessage('');
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge status="success" text="Success" />;
      case 'failed':
        return <Badge status="error" text="Failed" />;
      case 'partial':
        return <Badge status="warning" text="Partial" />;
      default:
        return <Badge status="default" text="Unknown" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUpOutlined style={{ color: '#52c41a' }} />;
      case 'declining':
        return <TrendingDownOutlined style={{ color: '#f5222d' }} />;
      default:
        return <MinusOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const syncColumns = [
    {
      title: 'Sync Type',
      dataIndex: 'sync_type',
      key: 'sync_type',
      render: (text: string) => text.replace('_', ' ').toUpperCase(),
    },
    {
      title: 'Last Sync',
      dataIndex: 'last_sync',
      key: 'last_sync',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getSyncStatusBadge(status),
    },
    {
      title: 'Records Processed',
      dataIndex: 'records_processed',
      key: 'records_processed',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: any) => (
        <Button
          size="small"
          icon={<SyncOutlined />}
          loading={triggerSync.isPending}
          onClick={() => handleTriggerSync(record.sync_type)}
        >
          Sync Now
        </Button>
      ),
    },
  ];

  const metricsColumns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Primary Products',
      dataIndex: 'primary_products',
      key: 'primary_products',
    },
    {
      title: 'Secondary Products',
      dataIndex: 'secondary_products',
      key: 'secondary_products',
    },
    {
      title: 'Compliance %',
      dataIndex: 'overall_compliance',
      key: 'overall_compliance',
      render: (value: number) => `${value}%`,
    },
    {
      title: 'Critical Alerts',
      dataIndex: 'critical_alerts',
      key: 'critical_alerts',
      render: (value: number) => (
        <Badge count={value} showZero color={value > 0 ? '#f5222d' : '#52c41a'} />
      ),
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => (
        <Space>
          {getTrendIcon(trend)}
          <span style={{ textTransform: 'capitalize' }}>{trend}</span>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Lark Base Integration Dashboard</Title>
      
      <Alert
        message="Lark Base Integration Status"
        description="Real-time monitoring and control of PIM data synchronization with Lark Base"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        action={
          <Button
            icon={<ExternalLinkOutlined />}
            href={larkIntegrationService.getLarkBaseUrl()}
            target="_blank"
          >
            Open Lark Base
          </Button>
        }
      />

      {/* Sync Status Overview */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Products Synced"
              value={syncStatus?.find(s => s.sync_type === 'products')?.records_processed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Alerts Synced"
              value={syncStatus?.find(s => s.sync_type === 'alerts')?.records_processed || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Last Sync"
              value={syncStatus?.[0]?.last_sync ? new Date(syncStatus[0].last_sync).toLocaleTimeString() : 'Never'}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Sync Status Table */}
      <Card title="Sync Status Details" style={{ marginBottom: 24 }}>
        <Spin spinning={syncLoading}>
          <Table
            columns={syncColumns}
            dataSource={syncStatus || []}
            rowKey="sync_type"
            pagination={false}
            size="small"
          />
        </Spin>
      </Card>

      {/* Department Metrics */}
      <Card title="Department Performance Metrics" style={{ marginBottom: 24 }}>
        <Spin spinning={metricsLoading}>
          <Table
            columns={metricsColumns}
            dataSource={departmentMetrics || []}
            rowKey="department"
            pagination={false}
          />
        </Spin>
      </Card>

      {/* Test Notifications */}
      <Card title="Test Notifications">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Select
                placeholder="Select Department"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                style={{ width: '100%' }}
              >
                {departments.map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Col>
            <Col span={12}>
              <Input
                placeholder="Test message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                onClick={handleTestNotification}
                loading={testNotification.isPending}
                disabled={!selectedDepartment || !testMessage}
              >
                Send Test
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
};

export default LarkIntegrationDashboard;
```

### 4.2 Laravel API Controllers cho React Frontend

#### 4.2.1 Lark Sync Controller
```php
// app/Http/Controllers/Api/LarkSyncController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SyncProductsToLarkJob;
use App\Jobs\SyncDepartmentAlertsJob;
use App\Jobs\SyncDepartmentPerformanceJob;
use App\Models\LarkSyncStatus;
use App\Services\DepartmentService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class LarkSyncController extends Controller
{
    public function __construct(
        private DepartmentService $departmentService,
        private NotificationService $notificationService
    ) {}

    /**
     * Get current sync status for dashboard
     */
    public function getSyncStatus(): JsonResponse
    {
        $syncStatus = LarkSyncStatus::select([
            'sync_type',
            'last_sync',
            'status',
            'records_processed',
            'error_message',
            'duration_seconds'
        ])
        ->orderBy('last_sync', 'desc')
        ->get()
        ->groupBy('sync_type')
        ->map(function ($group) {
            return $group->first(); // Get latest sync for each type
        })
        ->values();

        return response()->json([
            'success' => true,
            'data' => $syncStatus
        ]);
    }

    /**
     * Trigger manual sync
     */
    public function triggerSync(Request $request, string $syncType): JsonResponse
    {
        $validator = Validator::make(['sync_type' => $syncType], [
            'sync_type' => 'required|in:products,alerts,performance'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid sync type',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            match($syncType) {
                'products' => SyncProductsToLarkJob::dispatch(),
                'alerts' => SyncDepartmentAlertsJob::dispatch(),
                'performance' => SyncDepartmentPerformanceJob::dispatch(),
            };

            return response()->json([
                'success' => true,
                'message' => ucfirst($syncType) . ' sync job has been queued'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to trigger sync: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department performance metrics for dashboard
     */
    public function getDepartmentMetrics(): JsonResponse
    {
        try {
            $departments = config('lark.department_mapping');
            $metrics = [];

            foreach ($departments as $deptCode => $deptName) {
                $deptMetrics = $this->departmentService->calculateDepartmentMetricsWithRoles($deptCode);
                
                $metrics[] = [
                    'department' => $deptCode,
                    'department_name' => $deptName,
                    'primary_products' => $deptMetrics['primary_owner_products'],
                    'secondary_products' => $deptMetrics['secondary_access_products'],
                    'overall_compliance' => $deptMetrics['overall_compliance_score'],
                    'critical_alerts' => $deptMetrics['critical_alerts_primary'] + $deptMetrics['critical_alerts_secondary'],
                    'trend' => $this->determineTrend($deptMetrics),
                    'last_updated' => now()->toISOString()
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $metrics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get department metrics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send test notification to department group
     */
    public function sendTestNotification(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'department' => 'required|string|in:RND,MKT,ECOM,PUR,LEG,WH,COM',
            'message' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $testAlertData = [
                'id' => 'TEST-' . now()->timestamp,
                'sku' => 'TEST-PRODUCT-001',
                'primary_responsible_department' => $request->department,
                'secondary_involved_departments' => [],
                'document_type' => 'Test Document',
                'message' => '[TEST] ' . $request->message,
                'priority' => 'Low',
                'due_date' => null,
                'primary_assigned_person' => 'Test User'
            ];

            $this->notificationService->sendDepartmentAlertNotification($testAlertData);

            return response()->json([
                'success' => true,
                'message' => 'Test notification sent successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test notification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Lark Base integration health status
     */
    public function getHealthStatus(): JsonResponse
    {
        try {
            $recentSyncs = LarkSyncStatus::where('last_sync', '>=', now()->subHours(24))->get();
            
            $failedSyncs = $recentSyncs->where('status', 'failed')->count();
            $totalSyncs = $recentSyncs->count();
            
            $healthStatus = match(true) {
                $totalSyncs === 0 => 'no_data',
                $failedSyncs === 0 => 'healthy',
                ($failedSyncs / $totalSyncs) < 0.1 => 'warning',
                default => 'critical'
            };

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $healthStatus,
                    'total_syncs_24h' => $totalSyncs,
                    'failed_syncs_24h' => $failedSyncs,
                    'success_rate' => $totalSyncs > 0 ? round(($totalSyncs - $failedSyncs) / $totalSyncs * 100, 2) : 0,
                    'last_successful_sync' => $recentSyncs->where('status', 'success')->max('last_sync')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get health status: ' . $e->getMessage()
            ], 500);
        }
    }

    private function determineTrend(array $metrics): string
    {
        // Simple trend calculation - in real implementation, compare with historical data
        $overallScore = $metrics['overall_compliance_score'];
        $criticalAlerts = $metrics['critical_alerts_primary'] + $metrics['critical_alerts_secondary'];
        
        if ($overallScore >= 90 && $criticalAlerts <= 2) {
            return 'improving';
        } elseif ($overallScore < 70 || $criticalAlerts > 10) {
            return 'declining';
        }
        
        return 'stable';
    }
}
```

#### 4.2.2 Laravel Model cho Sync Status Tracking
```php
// app/Models/LarkSyncStatus.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class LarkSyncStatus extends Model
{
    use HasFactory;

    protected $table = 'lark_sync_status';

    protected $fillable = [
        'sync_type',
        'last_sync',
        'status',
        'records_processed',
        'error_message',
        'duration_seconds'
    ];

    protected $casts = [
        'last_sync' => 'datetime',
        'records_processed' => 'integer',
        'duration_seconds' => 'float'
    ];

    /**
     * Create or update sync status record
     */
    public static function updateSyncStatus(
        string $syncType,
        string $status,
        int $recordsProcessed = 0,
        ?string $errorMessage = null,
        float $durationSeconds = 0
    ): self {
        return self::updateOrCreate(
            ['sync_type' => $syncType],
            [
                'last_sync' => now(),
                'status' => $status,
                'records_processed' => $recordsProcessed,
                'error_message' => $errorMessage,
                'duration_seconds' => $durationSeconds
            ]
        );
    }

    /**
     * Get failed syncs in last 24 hours
     */
    public static function getRecentFailures(): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('status', 'failed')
            ->where('last_sync', '>=', Carbon::now()->subHours(24))
            ->orderBy('last_sync', 'desc')
            ->get();
    }
}
```

### 4.3 Real-time Dashboard Updates với Laravel Broadcasting

#### 4.3.1 Laravel Broadcasting Setup
```php
// config/broadcasting.php
<?php

return [
    'default' => env('BROADCAST_DRIVER', 'pusher'),

    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS' => true,
                'host' => env('PUSHER_HOST') ?: 'api-' . env('PUSHER_APP_CLUSTER', 'mt1') . '.pusherapp.com',
                'port' => env('PUSHER_PORT', 443),
                'scheme' => env('PUSHER_SCHEME', 'https'),
                'encrypted' => true,
            ],
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',
        ],
    ],
];
```

#### 4.3.2 Department Dashboard Event
```php
// app/Events/DepartmentDashboardUpdate.php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DepartmentDashboardUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $department,
        public array $dashboardData,
        public string $updateType = 'general'
    ) {}

    /**
     * Get the channels the event should broadcast on
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("department-dashboard.{$this->department}"),
            new Channel('lark-integration-updates'), // For admin monitoring
        ];
    }

    /**
     * The event's broadcast name
     */
    public function broadcastAs(): string
    {
        return 'dashboard.updated';
    }

    /**
     * Get the data to broadcast
     */
    public function broadcastWith(): array
    {
        return [
            'department' => $this->department,
            'type' => $this->updateType,
            'data' => $this->dashboardData,
            'timestamp' => now()->toISOString(),
        ];
    }
}
```

#### 4.3.3 Real-time Dashboard Service
```php
// app/Services/RealTimeDashboardService.php
<?php

namespace App\Services;

use App\Events\DepartmentDashboardUpdate;
use App\Models\Product;
use App\Models\Alert;
use Illuminate\Support\Facades\Cache;

class RealTimeDashboardService
{
    public function __construct(
        private DepartmentService $departmentService
    ) {}

    /**
     * Get real-time dashboard data cho department
     */
    public function getDepartmentDashboardData(string $department): array
    {
        $cacheKey = "dashboard_data_{$department}";
        
        return Cache::remember($cacheKey, 300, function () use ($department) {
            // Get current metrics
            $performance = $this->departmentService->calculateDepartmentMetricsWithRoles($department);
            $recentAlerts = $this->getRecentDepartmentAlerts($department, 4);
            $workloadStatus = $this->getCurrentWorkloadStatus($department);
            $crossDeptTasks = $this->getCrossDepartmentTasks($department);

            return [
                'department' => $department,
                'timestamp' => now()->toISOString(),
                'performance' => $performance,
                'recent_alerts' => $recentAlerts->map(function ($alert) {
                    return [
                        'id' => $alert->id,
                        'message' => $alert->message,
                        'priority' => $alert->priority,
                        'created_at' => $alert->created_at->toISOString(),
                        'status' => $alert->status,
                        'product_sku' => $alert->product->code ?? null
                    ];
                }),
                'workload' => $workloadStatus,
                'cross_department_tasks' => $crossDeptTasks,
                'sync_status' => $this->getLarkSyncHealthForDepartment($department)
            ];
        });
    }

    /**
     * Broadcast dashboard update cho department
     */
    public function broadcastDashboardUpdate(string $department, string $updateType = 'general'): void
    {
        $dashboardData = $this->getDepartmentDashboardData($department);
        
        // Clear cache để force refresh
        Cache::forget("dashboard_data_{$department}");
        
        event(new DepartmentDashboardUpdate($department, $dashboardData, $updateType));
    }

    /**
     * Broadcast update cho tất cả departments khi có system-wide changes
     */
    public function broadcastSystemWideUpdate(): void
    {
        $departments = array_keys(config('lark.department_mapping'));
        
        foreach ($departments as $department) {
            $this->broadcastDashboardUpdate($department, 'system_update');
        }
    }

    private function getRecentDepartmentAlerts(string $department, int $hours)
    {
        return Alert::with('product')
            ->where(function ($query) use ($department) {
                $query->where('primary_responsible_department', $department)
                      ->orWhereJsonContains('secondary_involved_departments', $department);
            })
            ->where('created_at', '>=', now()->subHours($hours))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    private function getCurrentWorkloadStatus(string $department): array
    {
        $primaryTasks = Alert::where('primary_responsible_department', $department)
            ->where('status', '!=', 'resolved')
            ->count();
            
        $secondaryTasks = Alert::whereJsonContains('secondary_involved_departments', $department)
            ->where('status', '!=', 'resolved')
            ->count();

        $urgentTasks = Alert::where(function ($query) use ($department) {
                $query->where('primary_responsible_department', $department)
                      ->orWhereJsonContains('secondary_involved_departments', $department);
            })
            ->where('priority', 'critical')
            ->where('status', '!=', 'resolved')
            ->count();

        $capacityPercentage = min(100, ($primaryTasks + $secondaryTasks) * 10); // Simple calculation

        return [
            'primary_tasks_total' => $primaryTasks,
            'secondary_tasks_total' => $secondaryTasks,
            'urgent_tasks' => $urgentTasks,
            'capacity_percentage' => $capacityPercentage,
            'status' => $this->getWorkloadStatus($capacityPercentage),
        ];
    }

    private function getCrossDepartmentTasks(string $department): array
    {
        $tasks = Alert::where(function ($query) use ($department) {
                $query->where('primary_responsible_department', '!=', $department)
                      ->whereJsonContains('secondary_involved_departments', $department);
            })
            ->orWhere(function ($query) use ($department) {
                $query->where('primary_responsible_department', $department)
                      ->whereNotNull('secondary_involved_departments');
            })
            ->where('status', '!=', 'resolved')
            ->with('product')
            ->limit(5)
            ->get();

        return $tasks->map(function ($task) use ($department) {
            $isPrimary = $task->primary_responsible_department === $department;
            
            return [
                'id' => $task->id,
                'role' => $isPrimary ? 'primary' : 'secondary',
                'other_departments' => $isPrimary 
                    ? $task->secondary_involved_departments 
                    : [$task->primary_responsible_department],
                'product_sku' => $task->product->code ?? null,
                'priority' => $task->priority,
                'status' => $task->status,
                'due_date' => $task->due_date?->toDateString()
            ];
        })->toArray();
    }

    private function getLarkSyncHealthForDepartment(string $department): array
    {
        // Get recent sync status relevant to this department
        return [
            'last_sync' => Cache::get('last_successful_sync'),
            'status' => Cache::get('sync_health_status', 'unknown'),
            'next_sync' => now()->addMinutes(15)->toISOString() // Based on cron schedule
        ];
    }

    private function getWorkloadStatus(int $capacityPercentage): string
    {
        return match(true) {
            $capacityPercentage < 30 => 'light',
            $capacityPercentage < 60 => 'normal', 
            $capacityPercentage < 85 => 'heavy',
            default => 'overloaded'
        };
    }
}
```

### 4.4 React Real-time Dashboard Component
```tsx
// src/components/dashboard/RealTimeDepartmentDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Badge,
  Timeline,
  Alert,
  Spin,
  Button,
  Typography
} from 'antd';
import {
  UserOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const { Title, Text } = Typography;

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

interface DashboardData {
  department: string;
  timestamp: string;
  performance: {
    overall_compliance_score: number;
    critical_alerts_primary: number;
    critical_alerts_secondary: number;
    primary_owner_products: number;
    secondary_access_products: number;
  };
  recent_alerts: Array<{
    id: string;
    message: string;
    priority: string;
    created_at: string;
    status: string;
    product_sku?: string;
  }>;
  workload: {
    primary_tasks_total: number;
    secondary_tasks_total: number;
    urgent_tasks: number;
    capacity_percentage: number;
    status: string;
  };
  cross_department_tasks: Array<{
    id: string;
    role: 'primary' | 'secondary';
    other_departments: string[];
    product_sku?: string;
    priority: string;
    status: string;
  }>;
  sync_status: {
    last_sync: string;
    status: string;
    next_sync: string;
  };
}

interface RealTimeDepartmentDashboardProps {
  department: string;
  userId: string;
}

const RealTimeDepartmentDashboard: React.FC<RealTimeDepartmentDashboardProps> = ({
  department,
  userId
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Setup Laravel Echo for real-time updates
    window.Pusher = Pusher;

    window.Echo = new Echo({
      broadcaster: 'pusher',
      key: process.env.REACT_APP_PUSHER_APP_KEY,
      cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
      forceTLS: true,
      auth: {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      },
    });

    // Subscribe to department-specific channel
    const channel = window.Echo.private(`department-dashboard.${department}`);
    
    channel.listen('.dashboard.updated', (event: any) => {
      console.log('Dashboard update received:', event);
      setDashboardData(event.data);
      setLastUpdate(event.timestamp);
      setLoading(false);
    });

    // Subscribe to general Lark integration updates
    const generalChannel = window.Echo.channel('lark-integration-updates');
    
    generalChannel.listen('.sync.completed', (event: any) => {
      console.log('Sync completed:', event);
      // Trigger a refresh of dashboard data
      fetchDashboardData();
    });

    setConnected(true);

    // Initial data fetch
    fetchDashboardData();

    return () => {
      window.Echo.leave(`department-dashboard.${department}`);
      window.Echo.leave('lark-integration-updates');
    };
  }, [department]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/department/${department}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case 'light': return '#52c41a';
      case 'normal': return '#1677ff';
      case 'heavy': return '#faad14';
      case 'overloaded': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'processing';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading department dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          {department} Department Dashboard
          <Badge 
            status={connected ? 'processing' : 'error'} 
            text={connected ? 'Live' : 'Disconnected'}
            style={{ marginLeft: 16 }}
          />
        </Title>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text type="secondary">
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
          </Text>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchDashboardData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Performance Overview */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Overall Compliance"
                  value={dashboardData.performance.overall_compliance_score}
                  suffix="%"
                  valueStyle={{ 
                    color: dashboardData.performance.overall_compliance_score >= 90 ? '#3f8600' : '#cf1322' 
                  }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Primary Products"
                  value={dashboardData.performance.primary_owner_products}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Secondary Products"
                  value={dashboardData.performance.secondary_access_products}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Critical Alerts"
                  value={dashboardData.performance.critical_alerts_primary + dashboardData.performance.critical_alerts_secondary}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<AlertOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Workload Status */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="Department Workload">
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Capacity: </Text>
                  <Progress
                    percent={dashboardData.workload.capacity_percentage}
                    strokeColor={getWorkloadColor(dashboardData.workload.status)}
                    status={dashboardData.workload.capacity_percentage >= 85 ? 'exception' : 'normal'}
                  />
                </div>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title="Primary Tasks" value={dashboardData.workload.primary_tasks_total} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Secondary Tasks" value={dashboardData.workload.secondary_tasks_total} />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="Urgent" 
                      value={dashboardData.workload.urgent_tasks} 
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Lark Base Sync Status">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Badge 
                    status={dashboardData.sync_status.status === 'healthy' ? 'success' : 'error'} 
                    text={dashboardData.sync_status.status.toUpperCase()}
                  />
                  <Text type="secondary">
                    Next sync: {new Date(dashboardData.sync_status.next_sync).toLocaleTimeString()}
                  </Text>
                </div>
                <Text type="secondary">
                  Last successful sync: {new Date(dashboardData.sync_status.last_sync).toLocaleString()}
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Recent Alerts & Cross-Department Tasks */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Recent Alerts" size="small">
                <Timeline mode="left" style={{ maxHeight: 300, overflow: 'auto' }}>
                  {dashboardData.recent_alerts.map((alert) => (
                    <Timeline.Item
                      key={alert.id}
                      color={getPriorityColor(alert.priority)}
                      dot={<ClockCircleOutlined />}
                    >
                      <div>
                        <Badge status={getPriorityColor(alert.priority) as any} text={alert.priority.toUpperCase()} />
                        <div style={{ marginTop: 4 }}>
                          <Text strong>{alert.product_sku}</Text>
                          <br />
                          <Text type="secondary">{alert.message}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(alert.created_at).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Cross-Department Collaboration" size="small">
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {dashboardData.cross_department_tasks.map((task) => (
                    <div key={task.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Badge 
                          status={task.role === 'primary' ? 'processing' : 'default'} 
                          text={task.role.toUpperCase()}
                        />
                        <Badge status={getPriorityColor(task.priority) as any} text={task.priority} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{task.product_sku}</Text>
                        <br />
                        <Text type="secondary">
                          Collaborating with: {task.other_departments.join(', ')}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default RealTimeDepartmentDashboard;
```

## 5. DEPLOYMENT CONFIGURATION

### 5.1 Docker Setup cho Laravel + React + Lark Integration
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Laravel Backend
  pim_backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - LARK_APP_ID=${LARK_APP_ID}
      - LARK_APP_SECRET=${LARK_APP_SECRET}
      - LARK_BASE_TOKEN=${LARK_BASE_TOKEN}
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - PUSHER_APP_KEY=${PUSHER_APP_KEY}
      - PUSHER_APP_SECRET=${PUSHER_APP_SECRET}
      - PUSHER_APP_ID=${PUSHER_APP_ID}
    volumes:
      - ./backend/storage:/var/www/storage
      - ./logs:/var/www/storage/logs
    depends_on:
      - mysql
      - redis
    networks:
      - pim_network

  # Queue Worker
  queue_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    environment:
      - APP_ENV=production
      - QUEUE_CONNECTION=redis
      - LARK_APP_ID=${LARK_APP_ID}
      - LARK_APP_SECRET=${LARK_APP_SECRET}
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - pim_network

  # Scheduler
  scheduler:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: php artisan schedule:work
    environment:
      - APP_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - pim_network

  # React Frontend
  pim_frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:8000/api
      - REACT_APP_LARK_BASE_URL=${LARK_BASE_URL}
      - REACT_APP_PUSHER_APP_KEY=${PUSHER_APP_KEY}
      - REACT_APP_PUSHER_APP_CLUSTER=${PUSHER_APP_CLUSTER}
    depends_on:
      - pim_backend
    networks:
      - pim_network

  # MySQL Database
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=pim_database
      - MYSQL_USER=pim_user
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - pim_network

  # Redis for Queue & Caching
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    networks:
      - pim_network

volumes:
  mysql_data:

networks:
  pim_network:
    driver: bridge
```

## 6. TESTING & VALIDATION PLAN

### 6.1 Laravel Backend Testing

#### 6.1.1 Department Role Testing
```php
// tests/Feature/DepartmentRoleTest.php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Department;
use App\Models\Alert;
use App\Services\DepartmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DepartmentRoleTest extends TestCase
{
    use RefreshDatabase;

    private DepartmentService $departmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->departmentService = app(DepartmentService::class);
        
        // Create test departments
        Department::factory()->create(['code' => 'RND', 'name' => 'Research & Development']);
        Department::factory()->create(['code' => 'MKT', 'name' => 'Marketing']);
    }

    public function test_primary_owner_responsibility(): void
    {
        // Create product with RND as primary owner, MKT as secondary
        $product = Product::factory()->create([
            'code' => 'TEST-001',
            'name' => 'Test Product',
            'primary_owner_department' => 'RND',
            'secondary_access_departments' => ['MKT', 'ECOM']
        ]);

        // RND should have primary responsibility
        $rndMetrics = $this->departmentService->calculateDepartmentMetricsWithRoles('RND');
        $this->assertEquals(1, $rndMetrics['primary_owner_products']);

        // MKT should have secondary involvement
        $mktMetrics = $this->departmentService->calculateDepartmentMetricsWithRoles('MKT');
        $this->assertEquals(1, $mktMetrics['secondary_access_products']);
        $this->assertEquals(0, $mktMetrics['primary_owner_products']);
    }

    public function test_alert_routing_by_department_role(): void
    {
        $product = Product::factory()->create([
            'primary_owner_department' => 'RND'
        ]);

        $alert = Alert::factory()->create([
            'product_id' => $product->id,
            'primary_responsible_department' => 'RND',
            'secondary_involved_departments' => ['MKT'],
            'priority' => 'critical',
            'message' => 'Test alert'
        ]);

        // Test alert belongs to correct department
        $this->assertEquals('RND', $alert->primary_responsible_department);
        $this->assertContains('MKT', $alert->secondary_involved_departments);
    }

    public function test_department_compliance_calculation(): void
    {
        // Create products with different compliance levels
        $products = collect([
            Product::factory()->create([
                'primary_owner_department' => 'RND',
                'compliance_percentage' => 95
            ]),
            Product::factory()->create([
                'primary_owner_department' => 'RND', 
                'compliance_percentage' => 85
            ])
        ]);

        $metrics = $this->departmentService->calculateDepartmentMetricsWithRoles('RND');
        
        $this->assertEquals(2, $metrics['primary_owner_products']);
        $this->assertEquals(90, $metrics['primary_compliance_score']); // Average of 95 and 85
    }
}
```

#### 6.1.2 Lark Base Integration Testing
```php
// tests/Feature/LarkBaseIntegrationTest.php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\LarkBaseService;
use App\Models\Product;
use App\Models\Alert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

class LarkBaseIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private LarkBaseService $larkService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->larkService = app(LarkBaseService::class);
    }

    public function test_department_data_sync(): void
    {
        // Mock Lark API responses
        Http::fake([
            '*/auth/v3/tenant_access_token/internal' => Http::response([
                'code' => 0,
                'tenant_access_token' => 'mock_token',
                'expire' => 7200
            ]),
            '*/bitable/v1/apps/*/tables/*/records/*' => Http::response([
                'code' => 0,
                'data' => ['record' => ['record_id' => 'test_record_id']]
            ])
        ]);

        $product = Product::factory()->create([
            'code' => 'TEST-SKU',
            'primary_owner_department' => 'RND'
        ]);

        $departmentData = [
            'primary_owner_department' => 'RND',
            'secondary_access_departments' => ['MKT'],
            'primary_responsible_person' => 'John Doe',
            'compliance_percentage' => 95.5,
            'critical_alerts_count' => 2
        ];

        $result = $this->larkService->updateProductWithDepartmentInfo('TEST-SKU', $departmentData);

        $this->assertEquals(0, $result['code']);
        
        // Verify HTTP requests were made
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/records/');
        });
    }

    public function test_alert_creation_in_lark(): void
    {
        Http::fake([
            '*/auth/v3/tenant_access_token/internal' => Http::response([
                'code' => 0,
                'tenant_access_token' => 'mock_token',
                'expire' => 7200
            ]),
            '*/bitable/v1/apps/*/tables/*/records' => Http::response([
                'code' => 0,
                'data' => ['records' => [['record_id' => 'new_record_id']]]
            ])
        ]);

        $alertData = [
            'id' => 'ALERT-123',
            'created_at' => now(),
            'priority' => 'Critical',
            'sku' => 'TEST-SKU',
            'primary_responsible_department' => 'RND',
            'secondary_involved_departments' => ['MKT'],
            'message' => 'Test alert message',
            'due_date' => now()->addDays(7),
            'primary_assigned_person' => 'Jane Doe',
            'secondary_notified_persons' => ['John Smith']
        ];

        $result = $this->larkService->createDepartmentAlert($alertData);

        $this->assertEquals(0, $result['code']);
        
        Http::assertSent(function ($request) {
            $body = json_decode($request->body(), true);
            return isset($body['records'][0]['fields']['fld_alert_id']) && 
                   $body['records'][0]['fields']['fld_alert_id'] === 'ALERT-123';
        });
    }

    public function test_access_token_caching(): void
    {
        Http::fake([
            '*/auth/v3/tenant_access_token/internal' => Http::response([
                'code' => 0,
                'tenant_access_token' => 'cached_token',
                'expire' => 7200
            ])
        ]);

        // First call should hit the API
        $token1 = $this->larkService->getAccessToken();
        
        // Second call should use cached token
        $token2 = $this->larkService->getAccessToken();

        $this->assertEquals($token1, $token2);
        
        // Should only make one HTTP request due to caching
        Http::assertSentCount(1);
    }
}
```

### 6.2 React Frontend Testing

#### 6.2.1 Lark Integration Component Testing
```tsx
// src/components/__tests__/LarkIntegrationDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { message } from 'antd';
import LarkIntegrationDashboard from '../lark/LarkIntegrationDashboard';
import { larkIntegrationService } from '../../services/larkIntegrationService';

// Mock the service
jest.mock('../../services/larkIntegrationService');
const mockLarkService = larkIntegrationService as jest.Mocked<typeof larkIntegrationService>;

// Mock antd message
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('LarkIntegrationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sync status correctly', async () => {
    mockLarkService.getSyncStatus.mockResolvedValue([
      {
        sync_type: 'products',
        last_sync: '2024-01-01T10:00:00Z',
        status: 'success',
        records_processed: 150,
      },
      {
        sync_type: 'alerts',
        last_sync: '2024-01-01T10:15:00Z',
        status: 'failed',
        records_processed: 0,
        error_message: 'API rate limit exceeded',
      },
    ]);

    renderWithQueryClient(<LarkIntegrationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Products Synced')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('should trigger sync when button is clicked', async () => {
    mockLarkService.getSyncStatus.mockResolvedValue([]);
    mockLarkService.triggerSync.mockResolvedValue();

    renderWithQueryClient(<LarkIntegrationDashboard />);

    const syncButton = screen.getByRole('button', { name: /sync now/i });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(mockLarkService.triggerSync).toHaveBeenCalledWith('products');
      expect(message.success).toHaveBeenCalledWith('products sync triggered successfully');
    });
  });

  it('should send test notification', async () => {
    mockLarkService.sendTestNotification.mockResolvedValue();

    renderWithQueryClient(<LarkIntegrationDashboard />);

    // Select department
    const departmentSelect = screen.getByRole('combobox');
    fireEvent.change(departmentSelect, { target: { value: 'RND' } });

    // Enter test message
    const messageInput = screen.getByPlaceholderText('Test message');
    fireEvent.change(messageInput, { target: { value: 'Test notification message' } });

    // Click send test button
    const sendButton = screen.getByRole('button', { name: /send test/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockLarkService.sendTestNotification).toHaveBeenCalledWith(
        'RND',
        'Test notification message'
      );
      expect(message.success).toHaveBeenCalledWith('Test notification sent successfully');
    });
  });

  it('should display department metrics', async () => {
    mockLarkService.getDepartmentMetrics.mockResolvedValue([
      {
        department: 'RND',
        primary_products: 25,
        secondary_products: 10,
        overall_compliance: 92,
        critical_alerts: 3,
        trend: 'improving',
      },
      {
        department: 'MKT',
        primary_products: 18,
        secondary_products: 15,
        overall_compliance: 88,
        critical_alerts: 1,
        trend: 'stable',
      },
    ]);

    renderWithQueryClient(<LarkIntegrationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('RND')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument(); // Primary products
      expect(screen.getByText('92%')).toBeInTheDocument(); // Compliance
      expect(screen.getByText('MKT')).toBeInTheDocument();
    });
  });
});
```

#### 6.2.2 Real-time Dashboard Testing
```tsx
// src/components/__tests__/RealTimeDepartmentDashboard.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import RealTimeDepartmentDashboard from '../dashboard/RealTimeDepartmentDashboard';

// Mock Laravel Echo
const mockEcho = {
  private: jest.fn().mockReturnThis(),
  channel: jest.fn().mockReturnThis(),
  listen: jest.fn(),
  leave: jest.fn(),
};

global.fetch = jest.fn();
window.Echo = mockEcho;

describe('RealTimeDepartmentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: {
          department: 'RND',
          timestamp: '2024-01-01T10:00:00Z',
          performance: {
            overall_compliance_score: 95,
            critical_alerts_primary: 2,
            critical_alerts_secondary: 1,
            primary_owner_products: 25,
            secondary_access_products: 10,
          },
          recent_alerts: [],
          workload: {
            primary_tasks_total: 5,
            secondary_tasks_total: 3,
            urgent_tasks: 1,
            capacity_percentage: 60,
            status: 'normal',
          },
          cross_department_tasks: [],
          sync_status: {
            last_sync: '2024-01-01T09:45:00Z',
            status: 'healthy',
            next_sync: '2024-01-01T10:15:00Z',
          },
        },
      }),
    } as Response);
  });

  it('should render department dashboard correctly', async () => {
    render(<RealTimeDepartmentDashboard department="RND" userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('RND Department Dashboard')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument(); // Compliance score
      expect(screen.getByText('25')).toBeInTheDocument(); // Primary products
    });
  });

  it('should setup real-time connections', () => {
    render(<RealTimeDepartmentDashboard department="RND" userId="user123" />);

    expect(mockEcho.private).toHaveBeenCalledWith('department-dashboard.RND');
    expect(mockEcho.channel).toHaveBeenCalledWith('lark-integration-updates');
  });

  it('should display workload status correctly', async () => {
    render(<RealTimeDepartmentDashboard department="RND" userId="user123" />);

    await waitFor(() => {
      expect(screen.getByText('Department Workload')).toBeInTheDocument();
      expect(screen.getByText('Primary Tasks')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Primary tasks count
    });
  });
});
```

### 6.3 Integration Testing với Mock Lark API
```php
// tests/Feature/EndToEndLarkIntegrationTest.php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Jobs\SyncProductsToLarkJob;
use App\Jobs\SyncDepartmentAlertsJob;
use App\Models\Product;
use App\Models\Alert;
use App\Models\LarkSyncStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

class EndToEndLarkIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_product_sync_workflow(): void
    {
        Queue::fake();
        
        // Mock Lark API
        Http::fake([
            '*/auth/v3/tenant_access_token/internal' => Http::response([
                'code' => 0,
                'tenant_access_token' => 'test_token',
                'expire' => 7200
            ]),
            '*/bitable/v1/apps/*/tables/*/records/batch_create' => Http::response([
                'code' => 0,
                'data' => ['records' => []]
            ])
        ]);

        // Create test data
        Product::factory()->count(5)->create([
            'primary_owner_department' => 'RND'
        ]);

        // Dispatch sync job
        SyncProductsToLarkJob::dispatch();
        
        // Assert job was queued
        Queue::assertPushed(SyncProductsToLarkJob::class);
        
        // Execute the job
        $job = new SyncProductsToLarkJob();
        $job->handle(
            app(\App\Services\LarkBaseService::class),
            app(\App\Services\DepartmentService::class)
        );

        // Verify API calls were made
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/batch_create');
        });

        // Verify sync status was recorded
        $this->assertDatabaseHas('lark_sync_status', [
            'sync_type' => 'products',
            'status' => 'success'
        ]);
    }

    public function test_alert_notification_workflow(): void
    {
        Http::fake([
            '*/auth/v3/tenant_access_token/internal' => Http::response([
                'code' => 0,
                'tenant_access_token' => 'test_token',
                'expire' => 7200
            ]),
            '*/im/v1/messages' => Http::response([
                'code' => 0,
                'data' => ['message_id' => 'msg_123']
            ]),
            '*/bitable/v1/apps/*/tables/*/records' => Http::response([
                'code' => 0,
                'data' => ['records' => [['record_id' => 'alert_record_123']]]
            ])
        ]);

        $product = Product::factory()->create([
            'primary_owner_department' => 'RND'
        ]);

        $alert = Alert::factory()->create([
            'product_id' => $product->id,
            'primary_responsible_department' => 'RND',
            'secondary_involved_departments' => ['MKT'],
            'priority' => 'critical',
            'sync_status' => 'pending'
        ]);

        // Execute alert sync job
        $job = new SyncDepartmentAlertsJob();
        $job->handle(
            app(\App\Services\LarkBaseService::class),
            app(\App\Services\NotificationService::class)
        );

        // Verify alert was synced to Lark Base
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/records') && 
                   str_contains($request->body(), 'RND');
        });

        // Verify notifications were sent
        Http::assertSent(function ($request) {
            return str_contains($request->url(), '/messages');
        });

        // Verify alert status was updated
        $alert->refresh();
        $this->assertEquals('synced', $alert->sync_status);
    }
}
```

---

## KẾT LUẬN

Tài liệu này đã được cập nhật hoàn toàn để phản ánh mô hình **Primary Owner + Secondary Access** mới với các tính năng chính:

### ✅ **Đã Cập Nhật:**
1. **Database Schema** - Table structures với Primary/Secondary department tracking
2. **API Integration** - Department-aware data sync functions
3. **Notification System** - Smart routing với department responsibility rõ ràng
4. **Dashboard Views** - Role-specific views cho Primary vs Secondary tasks
5. **Automation** - Department workload balancing và cross-department collaboration
6. **Testing Plan** - Comprehensive testing cho department role logic

### 🎯 **Key Benefits:**
- **Trách nhiệm rõ ràng:** Mỗi phòng ban biết chính xác vai trò Primary vs Secondary
- **Thông báo thông minh:** Notifications được route đúng với message context phù hợp  
- **Collaboration hiệu quả:** Cross-department handoff processes được standardize
- **Performance tracking:** Metrics riêng biệt cho Primary và Secondary responsibilities
- **Executive visibility:** Real-time dashboard với department breakdown

### 📊 **Implementation Ready:**
- Code examples sẵn sàng deploy
- Department configuration templates
- Testing scenarios đầy đủ
- Performance monitoring setup

Hệ thống hiện tại hoàn toàn ready để implement với yêu cầu "việc thông báo cần chỉ rõ phòng ban nào cần thực hiện" và model Primary Owner + Secondary Access đã được simplified loại bỏ approval workflows.
```
**Color coding:**
- Red: Overdue
- Orange: Due in 7 days
- Yellow: Due in 30 days
- Green: Future

## 5. LARK BOT INTEGRATION

### 5.1 Bot Notifications

#### 5.1.1 Critical Alert Notifications
```python
def send_critical_alert_to_lark(alert):
    """
    Gửi thông báo Critical alert qua Lark Bot
    """
    message = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": "🔴 Critical Alert - PIM System"
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"**Sản phẩm:** {alert.sku} - {alert.product_name}\n**Vấn đề:** {alert.message}\n**Quá hạn:** {alert.days_overdue} ngày\n**Phụ trách:** {alert.assigned_to}"
                    }
                },
                {
                    "tag": "action",
                    "actions": [
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "Xem chi tiết"
                            },
                            "url": f"{PIM_BASE_URL}/alerts/{alert.id}",
                            "type": "primary"
                        },
                        {
                            "tag": "button", 
                            "text": {
                                "tag": "plain_text",
                                "content": "Lark Base Dashboard"
                            },
                            "url": f"https://example.larksuite.com/base/{LARK_BASE_TOKEN}"
                        }
                    ]
                }
            ]
        }
    }
    
    # Gửi đến group chat của department
    department_chat_id = get_department_chat_id(alert.department)
    send_message_to_chat(department_chat_id, message)
```

#### 5.1.2 Weekly Summary
```python
def send_weekly_summary():
    """
    Gửi báo cáo tóm tắt hàng tuần
    """
    summary = generate_weekly_summary()
    
    message = {
        "msg_type": "interactive", 
        "card": {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": f"📊 Báo cáo tuần {summary.week_number}/2025"
                },
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"""
**Tổng quan:**
• Compliance trung bình: {summary.avg_compliance}%
• Critical alerts: {summary.critical_count}
• Cải thiện: {summary.improvement}%

**Top Performers:**
🥇 {summary.top_dept_1}: {summary.top_score_1}%
🥈 {summary.top_dept_2}: {summary.top_score_2}%

**Cần chú ý:**
⚠️ {summary.attention_dept}: {summary.attention_issues}
                        """
                    }
                }
            ]
        }
    }
    
    # Gửi đến leadership chat
    send_message_to_chat(LEADERSHIP_CHAT_ID, message)
```

## 6. WEBHOOK & REAL-TIME UPDATES

### 6.1 Webhook từ Lark Base về PIM

```python
@csrf_exempt
def lark_webhook_handler(request):
    """
    Xử lý webhook từ Lark Base khi user update status
    """
    if request.method == 'POST':
        # Verify webhook signature
        if not verify_lark_signature(request):
            return HttpResponse(status=401)
        
        data = json.loads(request.body)
        
        if data.get('type') == 'record.updated':
            # User cập nhật status alert trên Lark Base
            record_id = data['data']['recordId']
            updated_fields = data['data']['updatedFields']
            
            if 'fld_status' in updated_fields:
                new_status = updated_fields['fld_status']
                alert_id = get_alert_id_by_record_id(record_id)
                
                # Update status trong PIM database
                update_alert_status(alert_id, new_status)
                
                # Log activity
                log_user_activity(
                    user=data['operator']['userId'],
                    action='status_update',
                    alert_id=alert_id,
                    new_status=new_status
                )
        
        return HttpResponse(status=200)
```

## 7. MONITORING & ERROR HANDLING

### 7.1 Sync Status Monitoring

```python
class LarkSyncStatus(models.Model):
    """
    Theo dõi trạng thái đồng bộ với Lark Base
    """
    sync_type = models.CharField(max_length=50)  # products, alerts, performance
    last_sync = models.DateTimeField()
    status = models.CharField(max_length=20)  # success, failed, partial
    records_processed = models.IntegerField()
    error_message = models.TextField(null=True, blank=True)
    duration_seconds = models.FloatField()

def monitor_sync_health():
    """
    Kiểm tra sức khỏe của sync process
    """
    failed_syncs = LarkSyncStatus.objects.filter(
        status='failed',
        last_sync__gte=timezone.now() - timedelta(hours=24)
    )
    
    if failed_syncs.count() > 5:
        # Gửi alert cho IT team
        send_system_alert("Lark Base sync failing repeatedly")
```

### 7.2 Rate Limiting & Retry Logic

```python
import time
from functools import wraps

def rate_limit_retry(max_retries=3, delay=1.0):
    """
    Decorator để handle rate limiting và retry
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError as e:
                    if attempt == max_retries - 1:
                        raise e
                    time.sleep(delay * (2 ** attempt))  # Exponential backoff
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

@rate_limit_retry(max_retries=3, delay=2.0)
def call_lark_api(endpoint, data):
    """
    Gọi Lark API với retry logic
    """
    response = requests.post(endpoint, json=data, headers=get_auth_headers())
    
    if response.status_code == 429:  # Rate limited
        raise RateLimitError("Rate limit exceeded")
    elif response.status_code >= 400:
        raise APIError(f"API error: {response.status_code}")
    
    return response.json()
```

## 8. BENEFITS & ROI

### 8.1 Lợi ích trực tiếp
✅ **Real-time visibility** - Leadership nhìn thấy tình trạng compliance ngay lập tức
✅ **Mobile access** - Truy cập báo cáo mọi lúc mọi nơi qua Lark mobile
✅ **Collaboration** - Team có thể comment, assign task trực tiếp trên Lark Base
✅ **No training needed** - Sử dụng Lark có sẵn, không cần học tool mới
✅ **Automated reporting** - Giảm 80% thời gian tạo báo cáo thủ công

### 8.2 Metrics để đánh giá
- **Response time**: Thời gian từ khi có alert đến khi được xử lý
- **Compliance improvement**: % cải thiện tuân thủ sau khi có dashboard
- **Executive engagement**: Số lần truy cập dashboard của leadership
- **Cross-department collaboration**: Số lượng comments/interactions trên Lark Base

## 9. IMPLEMENTATION TIMELINE

**Week 1-2:** 
- Setup Lark App, tạo Base và Tables
- Implement basic API integration

**Week 3-4:**
- Develop sync functions và scheduled jobs
- Create dashboard views

**Week 5-6:**
- Implement Bot notifications
- Setup webhook handlers

**Week 7-8:**
- Testing, monitoring, performance optimization
- User training và rollout

## 10. SECURITY CONSIDERATIONS

### 10.1 Data Privacy
- Chỉ đồng bộ dữ liệu summary, không đồng bộ nội dung nhạy cảm của tài liệu
- Implement field-level permissions trên Lark Base
- Regular audit của data access logs

### 10.2 API Security  
- Use OAuth 2.0 với refresh token
- Encrypt sensitive data in transit
- Rate limiting và IP whitelist
- Webhook signature verification

---

*Tài liệu này cung cấp blueprint đầy đủ để implement tích hợp Lark Base cho hệ thống PIM, đảm bảo tính khả thi và bảo mật.*