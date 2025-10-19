<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Document;
use Illuminate\Support\Collection;

class DocumentRequirementService
{
    /**
     * Get all document categories from config
     */
    public function getAllCategories(): array
    {
        return config('document_requirements.categories');
    }

    /**
     * Get required document categories for a specific product
     */
    public function getRequiredDocumentsForProduct(Product $product): array
    {
        $allCategories = $this->getAllCategories();
        $requirementRules = config('document_requirements.requirement_rules');
        $requiredCategories = [];

        // 1. Base requirements for all products
        if (isset($requirementRules['all_products']['required_categories'])) {
            foreach ($requirementRules['all_products']['required_categories'] as $categoryKey) {
                if (isset($allCategories[$categoryKey])) {
                    $requiredCategories[$categoryKey] = array_merge(
                        $allCategories[$categoryKey],
                        ['category_key' => $categoryKey]
                    );
                }
            }
        }

        // 2. Requirements by primary department
        $primaryDept = $product->primary_owner_department;
        if (isset($requirementRules['by_primary_department'][$primaryDept]['required_categories'])) {
            foreach ($requirementRules['by_primary_department'][$primaryDept]['required_categories'] as $categoryKey) {
                if (isset($allCategories[$categoryKey])) {
                    $requiredCategories[$categoryKey] = array_merge(
                        $allCategories[$categoryKey],
                        ['category_key' => $categoryKey]
                    );
                }
            }
        }

        // 3. Additional requirements based on product attributes
        // Check if product is imported (có thể thêm field is_imported vào Product model)
        if ($this->isImportedProduct($product)) {
            if (isset($requirementRules['imported_products']['additional_required'])) {
                foreach ($requirementRules['imported_products']['additional_required'] as $categoryKey) {
                    if (isset($allCategories[$categoryKey])) {
                        $category = $allCategories[$categoryKey];
                        // Override requirement for imported products
                        if ($categoryKey === 'legal_documents') {
                            $category['is_required'] = true;
                        }
                        $requiredCategories[$categoryKey] = array_merge(
                            $category,
                            ['category_key' => $categoryKey]
                        );
                    }
                }
            }
        }

        // 4. Marketing products requirements
        if ($this->hasMarketingCampaign($product)) {
            if (isset($requirementRules['marketing_products']['additional_required'])) {
                foreach ($requirementRules['marketing_products']['additional_required'] as $categoryKey) {
                    if (isset($allCategories[$categoryKey])) {
                        $requiredCategories[$categoryKey] = array_merge(
                            $allCategories[$categoryKey],
                            ['category_key' => $categoryKey]
                        );
                    }
                }
            }
        }

        // Calculate deadline for each requirement
        foreach ($requiredCategories as $categoryKey => &$requirement) {
            $requirement['calculated_deadline'] = $this->calculateDeadline(
                $product->created_at,
                $requirement['deadline_days']
            );
        }

        return $requiredCategories;
    }

    /**
     * Check document compliance for a product
     */
    public function checkDocumentCompliance(Product $product): array
    {
        $requiredDocuments = $this->getRequiredDocumentsForProduct($product);
        $uploadedDocuments = $product->documents()->get();

        $compliance = [
            'product_id' => $product->id,
            'product_code' => $product->code,
            'product_name' => $product->name,
            'primary_department' => $product->primary_owner_department,
            'total_required' => count($requiredDocuments),
            'total_uploaded' => $uploadedDocuments->count(),
            'categories' => [],
            'summary' => [
                'completed' => 0,
                'missing' => 0,
                'expired' => 0,
                'expiring_soon' => 0,
            ],
            'compliance_percentage' => 0,
            'overall_status' => 'incomplete'
        ];

        foreach ($requiredDocuments as $categoryKey => $requirement) {
            $uploadedDocs = $uploadedDocuments->where('category', $categoryKey);
            $categoryCompliance = [
                'category_key' => $categoryKey,
                'category_name' => $requirement['name'],
                'is_required' => $requirement['is_required'],
                'deadline' => $requirement['calculated_deadline'],
                'primary_owner' => $requirement['primary_owner'],
                'secondary_access' => $requirement['secondary_access'],
                'uploaded_count' => $uploadedDocs->count(),
                'status' => 'missing',
                'uploaded_documents' => [],
                'days_until_deadline' => null,
                'is_overdue' => false
            ];

            // Check uploaded documents for this category
            if ($uploadedDocs->count() > 0) {
                $categoryCompliance['status'] = 'completed';
                $categoryCompliance['uploaded_documents'] = $uploadedDocs->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'file_path' => $doc->file_path,
                        'uploaded_at' => $doc->created_at,
                        'file_size' => $doc->file_size,
                        'version' => $doc->version
                    ];
                })->toArray();

                $compliance['summary']['completed']++;
            } else {
                $compliance['summary']['missing']++;
            }

            // Check deadline status
            if ($requirement['calculated_deadline']) {
                $deadlineDate = \Carbon\Carbon::parse($requirement['calculated_deadline']);
                $now = now();
                
                $categoryCompliance['days_until_deadline'] = $now->diffInDays($deadlineDate, false);
                
                if ($deadlineDate->isPast()) {
                    $categoryCompliance['is_overdue'] = true;
                    if ($uploadedDocs->count() === 0) {
                        $categoryCompliance['status'] = 'overdue';
                        $compliance['summary']['expired']++;
                        $compliance['summary']['missing']--; // Remove from missing, add to expired
                    }
                } elseif ($deadlineDate->diffInDays($now) <= 7) {
                    if ($uploadedDocs->count() === 0) {
                        $categoryCompliance['status'] = 'expiring_soon';
                        $compliance['summary']['expiring_soon']++;
                        $compliance['summary']['missing']--; // Remove from missing, add to expiring
                    }
                }
            }

            $compliance['categories'][$categoryKey] = $categoryCompliance;
        }

        // Calculate compliance percentage
        if ($compliance['total_required'] > 0) {
            $compliance['compliance_percentage'] = round(
                ($compliance['summary']['completed'] / $compliance['total_required']) * 100,
                2
            );
        } else {
            $compliance['compliance_percentage'] = 100;
        }

        // Determine overall status
        if ($compliance['summary']['expired'] > 0) {
            $compliance['overall_status'] = 'critical';
        } elseif ($compliance['summary']['expiring_soon'] > 0) {
            $compliance['overall_status'] = 'warning';
        } elseif ($compliance['summary']['missing'] > 0) {
            $compliance['overall_status'] = 'incomplete';
        } else {
            $compliance['overall_status'] = 'complete';
        }

        return $compliance;
    }

    /**
     * Get missing documents for a product
     */
    public function getMissingDocuments(Product $product): array
    {
        $compliance = $this->checkDocumentCompliance($product);
        $missing = [];

        foreach ($compliance['categories'] as $categoryKey => $category) {
            if (in_array($category['status'], ['missing', 'overdue', 'expiring_soon'])) {
                $missing[] = [
                    'category_key' => $categoryKey,
                    'category_name' => $category['category_name'],
                    'status' => $category['status'],
                    'deadline' => $category['deadline'],
                    'days_until_deadline' => $category['days_until_deadline'],
                    'is_overdue' => $category['is_overdue'],
                    'primary_owner' => $category['primary_owner'],
                    'is_required' => $category['is_required']
                ];
            }
        }

        return $missing;
    }

    /**
     * Get document categories accessible by department
     */
    public function getCategoriesAccessibleByDepartment(string $departmentCode): array
    {
        $allCategories = $this->getAllCategories();
        $accessible = [];

        foreach ($allCategories as $categoryKey => $category) {
            if ($category['primary_owner'] === $departmentCode || 
                in_array($departmentCode, $category['secondary_access'])) {
                $accessible[$categoryKey] = array_merge($category, ['category_key' => $categoryKey]);
            }
        }

        return $accessible;
    }

    /**
     * Get category details
     */
    public function getCategoryDetails(string $categoryKey): ?array
    {
        $categories = $this->getAllCategories();
        
        if (isset($categories[$categoryKey])) {
            return array_merge($categories[$categoryKey], ['category_key' => $categoryKey]);
        }

        return null;
    }

    /**
     * Check if department has access to category
     */
    public function departmentHasAccess(string $departmentCode, string $categoryKey): bool
    {
        $category = $this->getCategoryDetails($categoryKey);
        
        if (!$category) {
            return false;
        }

        return $category['primary_owner'] === $departmentCode || 
               in_array($departmentCode, $category['secondary_access']);
    }

    /**
     * Get access level for department on category
     */
    public function getDepartmentAccessLevel(string $departmentCode, string $categoryKey): string
    {
        $category = $this->getCategoryDetails($categoryKey);
        
        if (!$category) {
            return 'none';
        }

        if ($category['primary_owner'] === $departmentCode) {
            return 'full_control';
        }

        if (in_array($departmentCode, $category['secondary_access'])) {
            return 'read_edit'; // Default secondary access level
        }

        return 'none';
    }

    /**
     * Get compliance statistics by department
     */
    public function getComplianceStatsByDepartment(string $departmentCode): array
    {
        $products = Product::where('primary_owner_department', $departmentCode)
            ->orWhereJsonContains('secondary_access_departments', $departmentCode)
            ->get();

        $stats = [
            'department' => $departmentCode,
            'total_products' => $products->count(),
            'compliance_summary' => [
                'complete' => 0,
                'incomplete' => 0,
                'critical' => 0,
                'warning' => 0
            ],
            'average_compliance_percentage' => 0,
            'categories_stats' => []
        ];

        $totalCompliance = 0;
        $categoryStats = [];

        foreach ($products as $product) {
            $compliance = $this->checkDocumentCompliance($product);
            $totalCompliance += $compliance['compliance_percentage'];
            
            $stats['compliance_summary'][$compliance['overall_status']]++;

            // Collect category statistics
            foreach ($compliance['categories'] as $categoryKey => $category) {
                if (!isset($categoryStats[$categoryKey])) {
                    $categoryStats[$categoryKey] = [
                        'category_name' => $category['category_name'],
                        'total_required' => 0,
                        'completed' => 0,
                        'missing' => 0,
                        'overdue' => 0
                    ];
                }

                $categoryStats[$categoryKey]['total_required']++;
                
                if ($category['status'] === 'completed') {
                    $categoryStats[$categoryKey]['completed']++;
                } elseif ($category['status'] === 'overdue') {
                    $categoryStats[$categoryKey]['overdue']++;
                } else {
                    $categoryStats[$categoryKey]['missing']++;
                }
            }
        }

        if ($products->count() > 0) {
            $stats['average_compliance_percentage'] = round($totalCompliance / $products->count(), 2);
        }

        $stats['categories_stats'] = $categoryStats;

        return $stats;
    }

    /**
     * Helper: Check if product is imported
     */
    private function isImportedProduct(Product $product): bool
    {
        // Logic để xác định sản phẩm có phải nhập khẩu không
        // Có thể dựa vào field trong product hoặc business logic
        // Ví dụ: kiểm tra primary_owner_department hoặc tags
        return $product->primary_owner_department === 'PUR' || 
               str_contains(strtolower($product->description ?? ''), 'import');
    }

    /**
     * Helper: Check if product has marketing campaign
     */
    private function hasMarketingCampaign(Product $product): bool
    {
        // Logic để xác định sản phẩm có campaign marketing không
        // Có thể dựa vào secondary_access_departments chứa MKT
        return in_array('MKT', $product->secondary_access_departments ?? []) ||
               in_array('ECOM', $product->secondary_access_departments ?? []);
    }

    /**
     * Helper: Calculate deadline based on created date and deadline days
     */
    private function calculateDeadline($createdAt, $deadlineDays): ?string
    {
        if ($deadlineDays === null) {
            return null;
        }

        return \Carbon\Carbon::parse($createdAt)->addDays($deadlineDays)->toDateTimeString();
    }

    /**
     * Get priority level for category
     */
    public function getCategoryPriority(string $categoryKey): string
    {
        $priorities = config('document_requirements.priority_levels');
        
        foreach ($priorities as $level => $config) {
            if (in_array($categoryKey, $config['categories'])) {
                return $level;
            }
        }

        return 'low';
    }

    /**
     * Get all document requirements as organized structure
     */
    public function getDocumentRequirementsMatrix(): array
    {
        $categories = $this->getAllCategories();
        $matrix = [];

        foreach ($categories as $categoryKey => $category) {
            $matrix[] = [
                'category_key' => $categoryKey,
                'name' => $category['name'],
                'description' => $category['description'],
                'primary_owner' => $category['primary_owner'],
                'secondary_access' => $category['secondary_access'],
                'is_required' => $category['is_required'],
                'deadline_days' => $category['deadline_days'],
                'file_types' => $category['file_types'],
                'max_file_size_mb' => $category['max_file_size_mb'],
                'priority' => $this->getCategoryPriority($categoryKey),
                'access_levels' => [
                    'primary' => 'full_control',
                    'secondary' => 'read_edit'
                ]
            ];
        }

        return $matrix;
    }
}