<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DocumentRequirementService;
use App\Models\Product;

class CheckDocumentRequirements extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'pim:check-document-requirements 
                            {--product= : Check specific product by ID}
                            {--department= : Check products for specific department}
                            {--summary : Show summary only}';

    /**
     * The console command description.
     */
    protected $description = 'Check document requirements and compliance for products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $documentRequirementService = app(DocumentRequirementService::class);

        if ($this->option('summary')) {
            $this->showSystemSummary($documentRequirementService);
            return;
        }

        if ($productId = $this->option('product')) {
            $this->checkSingleProduct($documentRequirementService, $productId);
            return;
        }

        if ($department = $this->option('department')) {
            $this->checkDepartmentProducts($documentRequirementService, $department);
            return;
        }

        // Default: Show all products summary
        $this->showAllProductsSummary($documentRequirementService);
    }

    private function showSystemSummary(DocumentRequirementService $service)
    {
        $this->info('=== DOCUMENT REQUIREMENTS SYSTEM SUMMARY ===');
        
        // Show all categories
        $categories = $service->getAllCategories();
        $this->info("Total Document Categories: " . count($categories));
        $this->newLine();

        $this->table(
            ['Category', 'Primary Owner', 'Secondary Access', 'Required', 'Deadline Days'],
            collect($categories)->map(function ($category, $key) {
                return [
                    $key,
                    $category['primary_owner'],
                    implode(', ', $category['secondary_access']),
                    $category['is_required'] ? 'Yes' : 'No',
                    $category['deadline_days'] ?? 'Variable'
                ];
            })->toArray()
        );

        // Show requirements matrix
        $this->newLine();
        $this->info('=== REQUIREMENTS MATRIX ===');
        $matrix = $service->getDocumentRequirementsMatrix();
        
        foreach ($matrix as $requirement) {
            $this->line("• {$requirement['name']} ({$requirement['category_key']})");
            $this->line("  Primary: {$requirement['primary_owner']} | Secondary: " . implode(', ', $requirement['secondary_access']));
            $this->line("  Required: " . ($requirement['is_required'] ? 'YES' : 'NO') . " | Deadline: {$requirement['deadline_days']} days");
            $this->newLine();
        }
    }

    private function checkSingleProduct(DocumentRequirementService $service, string $productId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            $this->error("Product not found: {$productId}");
            return;
        }

        $this->info("=== DOCUMENT REQUIREMENTS FOR PRODUCT ===");
        $this->info("Product: {$product->code} - {$product->name}");
        $this->info("Primary Department: {$product->primary_owner_department}");
        $this->info("Secondary Departments: " . implode(', ', $product->secondary_access_departments ?? []));
        $this->newLine();

        // Show required documents
        $requirements = $service->getRequiredDocumentsForProduct($product);
        $this->info("Required Document Categories: " . count($requirements));
        $this->newLine();

        $this->table(
            ['Category', 'Name', 'Required', 'Deadline', 'Primary Owner'],
            collect($requirements)->map(function ($req, $key) {
                return [
                    $key,
                    $req['name'],
                    $req['is_required'] ? 'Yes' : 'No',
                    $req['calculated_deadline'] ?? 'No deadline',
                    $req['primary_owner']
                ];
            })->toArray()
        );

        // Check compliance
        $this->newLine();
        $this->info('=== COMPLIANCE CHECK ===');
        $compliance = $service->checkDocumentCompliance($product);
        
        $this->info("Overall Status: {$compliance['overall_status']}");
        $this->info("Compliance Percentage: {$compliance['compliance_percentage']}%");
        $this->info("Total Required: {$compliance['total_required']}");
        $this->info("Total Uploaded: {$compliance['total_uploaded']}");
        $this->newLine();

        $this->info("Summary:");
        $this->info("- Completed: {$compliance['summary']['completed']}");
        $this->info("- Missing: {$compliance['summary']['missing']}");
        $this->info("- Expired: {$compliance['summary']['expired']}");
        $this->info("- Expiring Soon: {$compliance['summary']['expiring_soon']}");
        $this->newLine();

        // Show detailed category status
        $this->table(
            ['Category', 'Name', 'Status', 'Uploaded', 'Deadline'],
            collect($compliance['categories'])->map(function ($category) {
                return [
                    $category['category_key'],
                    $category['category_name'],
                    $category['status'],
                    $category['uploaded_count'],
                    $category['deadline'] ?? 'No deadline'
                ];
            })->toArray()
        );
    }

    private function checkDepartmentProducts(DocumentRequirementService $service, string $department)
    {
        $this->info("=== DEPARTMENT COMPLIANCE: {$department} ===");
        
        $stats = $service->getComplianceStatsByDepartment($department);
        
        $this->info("Total Products: {$stats['total_products']}");
        $this->info("Average Compliance: {$stats['average_compliance_percentage']}%");
        $this->newLine();

        $this->info("Compliance Summary:");
        foreach ($stats['compliance_summary'] as $status => $count) {
            $this->info("- " . ucfirst($status) . ": {$count}");
        }
        $this->newLine();

        if (!empty($stats['categories_stats'])) {
            $this->info('=== CATEGORY STATISTICS ===');
            $this->table(
                ['Category', 'Total Required', 'Completed', 'Missing', 'Overdue'],
                collect($stats['categories_stats'])->map(function ($stat, $key) {
                    return [
                        $stat['category_name'],
                        $stat['total_required'],
                        $stat['completed'],
                        $stat['missing'],
                        $stat['overdue']
                    ];
                })->toArray()
            );
        }
    }

    private function showAllProductsSummary(DocumentRequirementService $service)
    {
        $this->info('=== ALL PRODUCTS DOCUMENT COMPLIANCE SUMMARY ===');
        
        $products = Product::all();
        $this->info("Total Products: " . $products->count());
        $this->newLine();

        $summary = [
            'complete' => 0,
            'incomplete' => 0,
            'critical' => 0,
            'warning' => 0
        ];

        $totalCompliance = 0;
        $results = [];

        foreach ($products as $product) {
            $compliance = $service->checkDocumentCompliance($product);
            $summary[$compliance['overall_status']]++;
            $totalCompliance += $compliance['compliance_percentage'];
            
            $results[] = [
                $product->code,
                $product->name,
                $product->primary_owner_department,
                $compliance['overall_status'],
                $compliance['compliance_percentage'] . '%',
                "{$compliance['summary']['completed']}/{$compliance['total_required']}"
            ];
        }

        $averageCompliance = $products->count() > 0 ? round($totalCompliance / $products->count(), 2) : 0;

        $this->info("Overall Statistics:");
        $this->info("- Average Compliance: {$averageCompliance}%");
        foreach ($summary as $status => $count) {
            $this->info("- " . ucfirst($status) . ": {$count}");
        }
        $this->newLine();

        $this->table(
            ['Product Code', 'Name', 'Department', 'Status', 'Compliance %', 'Completed/Required'],
            $results
        );
    }
}
