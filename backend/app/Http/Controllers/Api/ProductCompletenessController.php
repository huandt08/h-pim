<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProductCompletenessService;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProductCompletenessController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ProductCompletenessService $completenessService
    ) {}

    /**
     * Check completeness of a specific product
     */
    public function checkProduct(string $productId): JsonResponse
    {
        try {
            $product = Product::findOrFail($productId);
            
            // Check permissions
            $this->authorize('view', $product);
            
            $result = $this->completenessService->checkProductCompleteness($product);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kiểm tra completeness: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Batch check completeness for multiple products
     */
    public function batchCheck(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_ids' => 'nullable|array',
                'product_ids.*' => 'uuid|exists:products,id',
                'department' => 'nullable|string|in:RND,MKT,ECOM,PUR,LEG,WH,COM',
                'generate_alerts' => 'boolean'
            ]);

            $productIds = $validated['product_ids'] ?? null;
            $generateAlerts = $validated['generate_alerts'] ?? false;
            
            // Filter by department if specified
            if (isset($validated['department']) && !$productIds) {
                $products = Product::where('primary_owner_department', $validated['department'])
                    ->pluck('id')
                    ->toArray();
                $productIds = $products;
            }

            $results = $this->completenessService->batchCheckCompleteness($productIds);

            // Generate alerts if requested
            if ($generateAlerts) {
                $alertsGenerated = 0;
                foreach ($results as $result) {
                    if (isset($result['product_id']) && ($result['completeness_score'] ?? 0) < 90) {
                        $product = Product::find($result['product_id']);
                        if ($product) {
                            $this->completenessService->generateCompletenessAlerts($product);
                            $alertsGenerated++;
                        }
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'data' => $results,
                    'meta' => [
                        'processed_count' => count($results),
                        'alerts_generated' => $alertsGenerated
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'meta' => [
                    'processed_count' => count($results)
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kiểm tra batch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get completeness statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = $this->completenessService->getCompletenessStatistics();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get products with low completeness
     */
    public function getLowCompliance(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'threshold' => 'nullable|numeric|min:0|max:100',
                'department' => 'nullable|string|in:RND,MKT,ECOM,PUR,LEG,WH,COM',
                'limit' => 'nullable|integer|min:1|max:100'
            ]);

            $threshold = $validated['threshold'] ?? 80;
            $department = $validated['department'] ?? null;
            $limit = $validated['limit'] ?? 20;

            $query = Product::where('completeness_score', '<', $threshold)
                ->orderBy('completeness_score', 'asc')
                ->orderBy('created_at', 'asc');

            if ($department) {
                $query->where('primary_owner_department', $department);
            }

            $products = $query->limit($limit)
                ->with(['documents', 'alerts'])
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'code' => $product->code,
                        'completeness_score' => $product->completeness_score,
                        'missing_fields' => $product->missing_fields,
                        'primary_owner_department' => $product->primary_owner_department,
                        'created_at' => $product->created_at,
                        'hours_from_creation' => now()->diffInHours($product->created_at),
                        'last_completeness_check' => $product->last_completeness_check
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $products,
                'meta' => [
                    'threshold' => $threshold,
                    'department' => $department,
                    'count' => $products->count(),
                    'limit' => $limit
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get validation config for frontend
     */
    public function getValidationConfig(): JsonResponse
    {
        try {
            // Get validation config from service (this would be extracted to a config file)
            $config = [
                'basic_info' => [
                    'name' => [
                        'label' => 'Tên sản phẩm',
                        'required' => true,
                        'check_after_hours' => 0,
                        'weight' => 15,
                        'rules' => ['not_empty', 'min_length:2']
                    ],
                    'brand' => [
                        'label' => 'Thương hiệu',
                        'required' => true,
                        'check_after_hours' => 0,
                        'weight' => 10,
                        'rules' => ['not_empty', 'min_length:2']
                    ],
                    'description' => [
                        'label' => 'Mô tả sản phẩm',
                        'required' => true,
                        'check_after_hours' => 0,
                        'weight' => 15,
                        'rules' => ['not_empty', 'min_length:10']
                    ],
                    'detailed_description' => [
                        'label' => 'Thông tin chi tiết',
                        'required' => true,
                        'check_after_hours' => 2,
                        'weight' => 15,
                        'rules' => ['not_empty', 'min_length:20']
                    ],
                    'specifications' => [
                        'label' => 'Quy cách',
                        'required' => true,
                        'check_after_hours' => 4,
                        'weight' => 10,
                        'rules' => ['not_empty', 'contains_unit']
                    ],
                    'ingredients' => [
                        'label' => 'Thành phần',
                        'required' => true,
                        'check_after_hours' => 6,
                        'weight' => 10,
                        'rules' => ['not_empty', 'min_length:15']
                    ],
                    'usage' => [
                        'label' => 'Công dụng',
                        'required' => true,
                        'check_after_hours' => 8,
                        'weight' => 10,
                        'rules' => ['not_empty', 'min_length:20']
                    ],
                    'instructions' => [
                        'label' => 'Hướng dẫn sử dụng',
                        'required' => true,
                        'check_after_hours' => 12,
                        'weight' => 5,
                        'rules' => ['not_empty', 'contains_steps']
                    ],
                    'storage' => [
                        'label' => 'Bảo quản',
                        'required' => true,
                        'check_after_hours' => 12,
                        'weight' => 5,
                        'rules' => ['not_empty', 'contains_conditions']
                    ]
                ],
                'extended_info' => [
                    'development_reason' => [
                        'label' => 'Lý do phát triển & Xu hướng thị trường',
                        'required' => true,
                        'check_after_hours' => 24,
                        'weight' => 3,
                        'rules' => ['not_empty', 'min_length:50']
                    ],
                    'similar_products' => [
                        'label' => 'Sản phẩm tương tự',
                        'required' => true,
                        'check_after_hours' => 48,
                        'weight' => 3,
                        'rules' => ['not_empty', 'has_comparison']
                    ],
                    'usp' => [
                        'label' => 'Ưu điểm cạnh tranh/USP',
                        'required' => true,
                        'check_after_hours' => 72,
                        'weight' => 4,
                        'rules' => ['not_empty', 'min_length:30', 'has_unique_points']
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $config
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy cấu hình: ' . $e->getMessage()
            ], 500);
        }
    }
}