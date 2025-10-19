<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Document;
use App\Models\Alert;
use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Get all products accessible by department
     */
    public function getProductsByDepartment(string $departmentCode, array $filters = []): Collection
    {
        $query = Product::accessibleBy($departmentCode);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['compliance_min'])) {
            $query->where('compliance_percentage', '>=', $filters['compliance_min']);
        }

        if (isset($filters['compliance_max'])) {
            $query->where('compliance_percentage', '<=', $filters['compliance_max']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        return $query->with(['department', 'documents', 'alerts'])->get();
    }

    /**
     * Create new product
     */
    public function createProduct(array $data): Product
    {
        // Generate UUID if not provided
        if (!isset($data['id'])) {
            $data['id'] = Str::uuid();
        }

        // Generate product code if not provided
        if (!isset($data['code'])) {
            $data['code'] = $this->generateProductCode($data['primary_owner_department']);
        }

        // Validate department exists
        $department = Department::findByCode($data['primary_owner_department']);
        if (!$department) {
            throw new \InvalidArgumentException("Department {$data['primary_owner_department']} not found");
        }

        // Create product
        $product = Product::create($data);

        // Calculate initial compliance
        $this->updateProductCompliance($product);

        return $product->load(['department', 'documents', 'alerts']);
    }

    /**
     * Update product
     */
    public function updateProduct(Product $product, array $data): Product
    {
        // Check if department is being changed and validate
        if (isset($data['primary_owner_department']) && 
            $data['primary_owner_department'] !== $product->primary_owner_department) {
            
            $department = Department::findByCode($data['primary_owner_department']);
            if (!$department) {
                throw new \InvalidArgumentException("Department {$data['primary_owner_department']} not found");
            }
        }

        $product->update($data);

        // Recalculate compliance if certain fields changed
        if (isset($data['status']) || isset($data['primary_owner_department'])) {
            $this->updateProductCompliance($product);
        }

        return $product->load(['department', 'documents', 'alerts']);
    }

    /**
     * Delete product (soft delete)
     */
    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    /**
     * Calculate and update product compliance
     */
    public function updateProductCompliance(Product $product): float
    {
        $compliance = $product->calculateCompliance();
        
        $product->update(['compliance_percentage' => $compliance]);

        // Create alert if compliance is low
        if ($compliance < 80) {
            $this->createLowComplianceAlert($product);
        }

        return $compliance;
    }

    /**
     * Update compliance for all products
     */
    public function updateAllProductsCompliance(): array
    {
        $products = Product::all();
        $results = [];

        foreach ($products as $product) {
            $compliance = $this->updateProductCompliance($product);
            $results[$product->id] = [
                'code' => $product->code,
                'compliance' => $compliance
            ];
        }

        return $results;
    }

    /**
     * Get products with low compliance
     */
    public function getLowComplianceProducts(float $threshold = 80): Collection
    {
        return Product::where('compliance_percentage', '<', $threshold)
            ->with(['department', 'documents', 'alerts'])
            ->orderBy('compliance_percentage')
            ->get();
    }

    /**
     * Get product statistics for department
     */
    public function getProductStatsByDepartment(string $departmentCode): array
    {
        // Primary products (department is owner)
        $primaryProducts = Product::where('primary_owner_department', $departmentCode);
        $primaryCount = $primaryProducts->count();
        $primaryAvgCompliance = $primaryProducts->avg('compliance_percentage') ?? 0;

        // Secondary products (department has access)
        $secondaryCount = Product::whereJsonContains('secondary_access_departments', $departmentCode)->count();

        // Status breakdown for primary products
        $statusBreakdown = Product::where('primary_owner_department', $departmentCode)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Compliance breakdown
        $complianceBreakdown = [
            'excellent' => $primaryProducts->copy()->where('compliance_percentage', '>=', 95)->count(),
            'good' => $primaryProducts->copy()->whereBetween('compliance_percentage', [80, 94])->count(),
            'needs_improvement' => $primaryProducts->copy()->whereBetween('compliance_percentage', [60, 79])->count(),
            'poor' => $primaryProducts->copy()->where('compliance_percentage', '<', 60)->count(),
        ];

        return [
            'department' => $departmentCode,
            'primary_products' => $primaryCount,
            'secondary_products' => $secondaryCount,
            'total_accessible' => $primaryCount + $secondaryCount,
            'avg_compliance' => round($primaryAvgCompliance, 2),
            'status_breakdown' => $statusBreakdown,
            'compliance_breakdown' => $complianceBreakdown
        ];
    }

    /**
     * Get product details with all related information
     */
    public function getProductDetails(string $productId): ?array
    {
        $product = Product::with([
            'department',
            'documents' => function($query) {
                $query->orderBy('created_at', 'desc');
            },
            'alerts' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'batches' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(5);
            }
        ])->find($productId);

        if (!$product) {
            return null;
        }

        // Calculate document compliance details
        $documentStats = $this->getProductDocumentStats($product);

        // Get recent activity
        $recentActivity = $this->getProductRecentActivity($product);

        return [
            'product' => $product,
            'document_stats' => $documentStats,
            'recent_activity' => $recentActivity
        ];
    }

    /**
     * Get product document statistics
     */
    public function getProductDocumentStats(Product $product): array
    {
        $documents = $product->documents();
        
        $total = $documents->count();
        $required = $product->documents()->where('is_required', true)->count();
        $completed = $product->documents()->where('is_required', true)
            ->where('status', 'active')
            ->whereNotNull('file_path')->count();
        $expired = $product->documents()->where('deadline', '<', now())
            ->where('status', 'active')->count();
        $expiringSoon = $product->documents()->where('deadline', '>', now())
            ->where('deadline', '<=', now()->addDays(30))->count();

        return [
            'total_documents' => $total,
            'required_documents' => $required,
            'completed_documents' => $completed,
            'expired_documents' => $expired,
            'expiring_soon' => $expiringSoon,
            'compliance_percentage' => $required > 0 ? round(($completed / $required) * 100, 2) : 100
        ];
    }

    /**
     * Get recent activity for product
     */
    public function getProductRecentActivity(Product $product): array
    {
        $activity = [];

        // Recent document uploads
        $recentDocs = $product->documents()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentDocs as $doc) {
            $activity[] = [
                'type' => 'document_created',
                'description' => "Document '{$doc->name}' was created",
                'timestamp' => $doc->created_at,
                'user' => null // Can be added if tracking user who created
            ];
        }

        // Recent alerts
        $recentAlerts = $product->alerts()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentAlerts as $alert) {
            $activity[] = [
                'type' => 'alert_created',
                'description' => $alert->title,
                'timestamp' => $alert->created_at,
                'priority' => $alert->priority
            ];
        }

        // Sort by timestamp descending
        usort($activity, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return array_slice($activity, 0, 10);
    }

    /**
     * Generate unique product code
     */
    private function generateProductCode(string $departmentCode): string
    {
        $prefix = strtoupper($departmentCode);
        $date = now()->format('Ymd');
        $sequence = 1;

        do {
            $code = "{$prefix}-{$date}-" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
            $exists = Product::where('code', $code)->exists();
            $sequence++;
        } while ($exists);

        return $code;
    }

    /**
     * Create low compliance alert
     */
    private function createLowComplianceAlert(Product $product): void
    {
        // Check if alert already exists
        $existingAlert = Alert::where('product_id', $product->id)
            ->where('type', 'low_compliance')
            ->where('status', 'open')
            ->first();

        if (!$existingAlert) {
            Alert::createLowComplianceAlert($product);
        }
    }

    /**
     * Search products across all departments
     */
    public function searchProducts(string $query, array $departments = [], array $filters = []): Collection
    {
        $searchQuery = Product::query();

        // Search in product fields
        $searchQuery->where(function($q) use ($query) {
            $q->where('code', 'like', "%{$query}%")
              ->orWhere('name', 'like', "%{$query}%")
              ->orWhere('brand', 'like', "%{$query}%")
              ->orWhere('description', 'like', "%{$query}%");
        });

        // Filter by departments if specified
        if (!empty($departments)) {
            $searchQuery->where(function($q) use ($departments) {
                $q->whereIn('primary_owner_department', $departments);
                foreach ($departments as $dept) {
                    $q->orWhereJsonContains('secondary_access_departments', $dept);
                }
            });
        }

        // Apply additional filters
        if (isset($filters['status'])) {
            $searchQuery->where('status', $filters['status']);
        }

        if (isset($filters['compliance_min'])) {
            $searchQuery->where('compliance_percentage', '>=', $filters['compliance_min']);
        }

        return $searchQuery->with(['department', 'documents', 'alerts'])
            ->orderBy('compliance_percentage')
            ->get();
    }
}