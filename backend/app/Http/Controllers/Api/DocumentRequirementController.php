<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DocumentRequirementService;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentRequirementController extends Controller
{
    public function __construct(
        private DocumentRequirementService $documentRequirementService
    ) {}

    /**
     * Get all document categories from requirements matrix
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = $this->documentRequirementService->getAllCategories();

            return response()->json([
                'success' => true,
                'data' => $categories,
                'meta' => [
                    'total_categories' => count($categories),
                    'departments' => config('document_requirements.departments')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get document categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document requirements matrix (organized view)
     */
    public function getRequirementsMatrix(): JsonResponse
    {
        try {
            $matrix = $this->documentRequirementService->getDocumentRequirementsMatrix();

            return response()->json([
                'success' => true,
                'data' => $matrix,
                'meta' => [
                    'total_categories' => count($matrix),
                    'departments' => config('document_requirements.departments'),
                    'access_levels' => config('document_requirements.access_levels'),
                    'priority_levels' => config('document_requirements.priority_levels')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get requirements matrix: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get required documents for specific product
     */
    public function getRequiredDocumentsForProduct(string $productId): JsonResponse
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $requirements = $this->documentRequirementService->getRequiredDocumentsForProduct($product);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => [
                        'id' => $product->id,
                        'code' => $product->code,
                        'name' => $product->name,
                        'primary_department' => $product->primary_owner_department,
                        'secondary_departments' => $product->secondary_access_departments
                    ],
                    'required_documents' => $requirements
                ],
                'meta' => [
                    'total_required' => count($requirements),
                    'required_count' => count(array_filter($requirements, fn($req) => $req['is_required']))
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get required documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check document compliance for product
     */
    public function checkProductCompliance(string $productId): JsonResponse
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $compliance = $this->documentRequirementService->checkDocumentCompliance($product);

            return response()->json([
                'success' => true,
                'data' => $compliance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check compliance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get missing documents for product
     */
    public function getMissingDocuments(string $productId): JsonResponse
    {
        try {
            $product = Product::find($productId);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $missing = $this->documentRequirementService->getMissingDocuments($product);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => [
                        'id' => $product->id,
                        'code' => $product->code,
                        'name' => $product->name
                    ],
                    'missing_documents' => $missing
                ],
                'meta' => [
                    'total_missing' => count($missing),
                    'critical_missing' => count(array_filter($missing, fn($doc) => $doc['is_overdue'])),
                    'required_missing' => count(array_filter($missing, fn($doc) => $doc['is_required']))
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get missing documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document categories accessible by user's department
     */
    public function getCategoriesByDepartment(Request $request, ?string $departmentCode = null): JsonResponse
    {
        try {
            $user = $request->user();
            $department = $departmentCode ?? $user->department;

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not specified'
                ], 400);
            }

            $categories = $this->documentRequirementService->getCategoriesAccessibleByDepartment($department);

            return response()->json([
                'success' => true,
                'data' => $categories,
                'meta' => [
                    'department' => $department,
                    'accessible_categories' => count($categories)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get department categories: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single category details
     */
    public function getCategoryDetails(string $categoryKey): JsonResponse
    {
        try {
            $category = $this->documentRequirementService->getCategoryDetails($categoryKey);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if department has access to category
     */
    public function checkDepartmentAccess(Request $request, string $categoryKey): JsonResponse
    {
        try {
            $user = $request->user();
            $department = $user->department;

            $hasAccess = $this->documentRequirementService->departmentHasAccess($department, $categoryKey);
            $accessLevel = $this->documentRequirementService->getDepartmentAccessLevel($department, $categoryKey);

            return response()->json([
                'success' => true,
                'data' => [
                    'department' => $department,
                    'category' => $categoryKey,
                    'has_access' => $hasAccess,
                    'access_level' => $accessLevel
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check access: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get compliance statistics by department
     */
    public function getDepartmentComplianceStats(Request $request, ?string $departmentCode = null): JsonResponse
    {
        try {
            $user = $request->user();
            $department = $departmentCode ?? $user->department;

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not specified'
                ], 400);
            }

            $stats = $this->documentRequirementService->getComplianceStatsByDepartment($department);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get compliance stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Batch check compliance for multiple products
     */
    public function batchCheckCompliance(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_ids' => 'required|array',
                'product_ids.*' => 'string|exists:products,id'
            ]);

            $results = [];
            $summary = [
                'total_products' => count($validated['product_ids']),
                'complete' => 0,
                'incomplete' => 0,
                'critical' => 0,
                'warning' => 0
            ];

            foreach ($validated['product_ids'] as $productId) {
                $product = Product::find($productId);
                if ($product) {
                    $compliance = $this->documentRequirementService->checkDocumentCompliance($product);
                    $results[] = $compliance;
                    $summary[$compliance['overall_status']]++;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'meta' => [
                    'summary' => $summary,
                    'processed' => count($results)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to batch check compliance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overall system compliance summary
     */
    public function getSystemComplianceSummary(): JsonResponse
    {
        try {
            $departments = array_keys(config('document_requirements.departments'));
            $systemSummary = [
                'total_departments' => count($departments),
                'department_stats' => [],
                'overall_compliance' => 0,
                'total_products' => 0,
                'categories_overview' => []
            ];

            $totalCompliance = 0;
            $totalProducts = 0;

            foreach ($departments as $department) {
                $stats = $this->documentRequirementService->getComplianceStatsByDepartment($department);
                $systemSummary['department_stats'][$department] = $stats;
                
                $totalCompliance += $stats['average_compliance_percentage'] * $stats['total_products'];
                $totalProducts += $stats['total_products'];
            }

            if ($totalProducts > 0) {
                $systemSummary['overall_compliance'] = round($totalCompliance / $totalProducts, 2);
            }
            $systemSummary['total_products'] = $totalProducts;

            return response()->json([
                'success' => true,
                'data' => $systemSummary
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get system summary: ' . $e->getMessage()
            ], 500);
        }
    }
}