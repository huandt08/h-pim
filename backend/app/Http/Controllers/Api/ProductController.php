<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    /**
     * Get products accessible by user's department
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department;

        $filters = $request->only(['status', 'compliance_min', 'compliance_max', 'search']);
        
        $products = $this->productService->getProductsByDepartment($departmentCode, $filters);

        return response()->json([
            'success' => true,
            'data' => $products,
            'meta' => [
                'total' => $products->count(),
                'department' => $departmentCode,
                'filters' => $filters
            ]
        ]);
    }

    /**
     * Get single product
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['documents', 'alerts', 'batches'])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$product->hasAccess($user->department)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        // Ensure secondary_access_departments is properly formatted as array
        $productData = $product->toArray();
        if (isset($productData['secondary_access_departments']) && is_string($productData['secondary_access_departments'])) {
            $productData['secondary_access_departments'] = json_decode($productData['secondary_access_departments'], true) ?: [];
        }

        return response()->json([
            'success' => true,
            'data' => $productData
        ]);
    }

    /**
     * Create new product
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:100|unique:products,code',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'detailed_description' => 'nullable|string',
            'specifications' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'usage' => 'nullable|string',
            'instructions' => 'nullable|string',
            'storage' => 'nullable|string',
            'development_reason' => 'nullable|string',
            'similar_products' => 'nullable|string',
            'usp' => 'nullable|string',
            'primary_owner_department' => [
                'required',
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'secondary_access_departments' => 'nullable|array',
            'secondary_access_departments.*' => [
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'status' => 'sometimes|string|in:development,active,discontinued'
        ]);

        try {
            $product = $this->productService->createProduct($validated);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product'
            ], 500);
        }
    }

    /**
     * Update product
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission (only primary owner can update)
        $user = $request->user();
        if ($product->primary_owner_department !== $user->department) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary owner department can update product'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'brand' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'detailed_description' => 'nullable|string',
            'specifications' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'usage' => 'nullable|string',
            'instructions' => 'nullable|string',
            'storage' => 'nullable|string',
            'development_reason' => 'nullable|string',
            'similar_products' => 'nullable|string',
            'usp' => 'nullable|string',
            'primary_owner_department' => [
                'sometimes',
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'secondary_access_departments' => 'nullable|array',
            'secondary_access_departments.*' => [
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'status' => 'sometimes|string|in:development,active,discontinued'
        ]);

        try {
            $updatedProduct = $this->productService->updateProduct($product, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $updatedProduct
            ]);

        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product'
            ], 500);
        }
    }

    /**
     * Delete product
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission (only primary owner can delete)
        $user = $request->user();
        if ($product->primary_owner_department !== $user->department) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary owner department can delete product'
            ], 403);
        }

        try {
            $this->productService->deleteProduct($product);

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product'
            ], 500);
        }
    }

    /**
     * Get product statistics for user's department
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department;

        $stats = $this->productService->getProductStatsByDepartment($departmentCode);

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Search products
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'departments' => 'nullable|array',
            'departments.*' => [
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'status' => 'nullable|string|in:development,active,discontinued',
            'compliance_min' => 'nullable|numeric|min:0|max:100'
        ]);

        $query = $request->input('q');
        $departments = $request->input('departments', []);
        $filters = $request->only(['status', 'compliance_min']);

        $products = $this->productService->searchProducts($query, $departments, $filters);

        return response()->json([
            'success' => true,
            'data' => $products,
            'meta' => [
                'query' => $query,
                'total' => $products->count(),
                'departments' => $departments,
                'filters' => $filters
            ]
        ]);
    }

    /**
     * Update product compliance
     */
    public function updateCompliance(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission
        $user = $request->user();
        if ($product->primary_owner_department !== $user->department) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary owner department can update compliance'
            ], 403);
        }

        try {
            $compliance = $this->productService->updateProductCompliance($product);

            return response()->json([
                'success' => true,
                'message' => 'Compliance updated successfully',
                'data' => [
                    'product_id' => $product->id,
                    'compliance_percentage' => $compliance
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update compliance'
            ], 500);
        }
    }

    /**
     * Get products with low compliance
     */
    public function lowCompliance(Request $request): JsonResponse
    {
        $request->validate([
            'threshold' => 'nullable|numeric|min:0|max:100'
        ]);

        $threshold = $request->input('threshold', 80);
        $products = $this->productService->getLowComplianceProducts($threshold);

        return response()->json([
            'success' => true,
            'data' => $products,
            'meta' => [
                'threshold' => $threshold,
                'total' => $products->count()
            ]
        ]);
    }

    /**
     * Check product compliance
     */
    public function checkCompliance(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$product->hasAccess($user->department)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $compliance = $this->productService->updateProductCompliance($product);

            return response()->json([
                'success' => true,
                'data' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'compliance_percentage' => $compliance,
                    'department' => $product->primary_owner_department,
                    'status' => $product->status,
                    'last_updated' => $product->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check compliance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product documents
     */
    public function getDocuments(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$product->hasAccess($user->department)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $documents = $product->documents()->with(['versions'])->get();

            return response()->json([
                'success' => true,
                'data' => $documents,
                'meta' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'total_documents' => $documents->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product alerts
     */
    public function getAlerts(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$product->hasAccess($user->department)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            $alerts = $product->alerts()
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $alerts,
                'meta' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'total_alerts' => $alerts->count(),
                    'critical_alerts' => $alerts->where('priority', 'critical')->count(),
                    'open_alerts' => $alerts->where('status', 'open')->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch alerts: ' . $e->getMessage()
            ], 500);
        }
    }
}