<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SimpleAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BatchController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Debug route to check users
Route::get('/debug-users', function () {
    $users = \App\Models\User::select('email', 'name', 'department', 'role', 'is_active')->get();
    return response()->json(['users' => $users]);
});

// Debug route to check products
Route::get('/debug-products', function () {
    try {
        $products = \App\Models\Product::select('name', 'brand', 'primary_owner_department', 'status')->get();
        return response()->json(['count' => $products->count(), 'products' => $products]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Simple test login route
Route::post('/test-login', [SimpleAuthController::class, 'login']);

// Test authenticated route
Route::middleware('auth:sanctum')->get('/test-auth', function (Request $request) {
    $user = $request->user();
    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'department' => $user->department,
            'role' => $user->role
        ]
    ]);
});

// Test products without service
Route::middleware('auth:sanctum')->get('/test-products', function (Request $request) {
    try {
        $user = $request->user();
        $products = \App\Models\Product::where('primary_owner_department', $user->department)->get();
        return response()->json([
            'user_department' => $user->department,
            'products_count' => $products->count(),
            'products' => $products->take(3)
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Test products with service
Route::middleware('auth:sanctum')->get('/test-products-service', function (Request $request) {
    try {
        $user = $request->user();
        $productService = new \App\Services\ProductService();
        $products = $productService->getProductsByDepartment($user->department);
        return response()->json([
            'user_department' => $user->department,
            'products_count' => $products->count(),
            'products' => $products->take(3)
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Department routes
    Route::get('departments/all-stats', [DepartmentController::class, 'getAllDepartmentStats']);
    Route::get('departments/collaboration-matrix', [DepartmentController::class, 'collaborationMatrix']);
    Route::get('departments/workload-analysis', [DepartmentController::class, 'workloadAnalysis']);
    Route::apiResource('departments', DepartmentController::class);
    Route::get('departments/{department}/metrics', [DepartmentController::class, 'metrics']);
    Route::get('departments/{department}/workload', [DepartmentController::class, 'workload']);
    
    // Product routes
    Route::apiResource('products', ProductController::class);
    Route::get('products/{product}/compliance', [ProductController::class, 'checkCompliance']);
    Route::post('products/{product}/approve', [ProductController::class, 'approve']);
    Route::post('products/{product}/reject', [ProductController::class, 'reject']);
    
    // Product related data routes
    Route::get('products/{product}/documents', [ProductController::class, 'getDocuments']);
    Route::get('products/{product}/alerts', [ProductController::class, 'getAlerts']);
    Route::get('products/{product}/batches', [BatchController::class, 'byProduct']);
    
    // Product completeness routes
    Route::get('products/{product}/completeness', [\App\Http\Controllers\Api\ProductCompletenessController::class, 'checkProduct']);
    Route::post('products/completeness/batch-check', [\App\Http\Controllers\Api\ProductCompletenessController::class, 'batchCheck']);
    Route::get('products/completeness/statistics', [\App\Http\Controllers\Api\ProductCompletenessController::class, 'getStatistics']);
    Route::get('products/completeness/low-compliance', [\App\Http\Controllers\Api\ProductCompletenessController::class, 'getLowCompliance']);
    
    // Document Requirements routes (Matrix Management)
    Route::get('document-requirements/categories', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getCategories']);
    Route::get('document-requirements/matrix', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getRequirementsMatrix']);
    Route::get('document-requirements/products/{product}/required', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getRequiredDocumentsForProduct']);
    Route::get('document-requirements/products/{product}/compliance', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'checkProductCompliance']);
    Route::get('document-requirements/products/{product}/missing', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getMissingDocuments']);
    Route::get('document-requirements/departments/{department?}/categories', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getCategoriesByDepartment']);
    Route::get('document-requirements/categories/{category}', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getCategoryDetails']);
    Route::get('document-requirements/categories/{category}/access', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'checkDepartmentAccess']);
    Route::get('document-requirements/departments/{department?}/stats', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getDepartmentComplianceStats']);
    Route::post('document-requirements/batch-check', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'batchCheckCompliance']);
    Route::get('document-requirements/system/summary', [\App\Http\Controllers\Api\DocumentRequirementController::class, 'getSystemComplianceSummary']);

    // Document Storage routes (File Management)
    Route::apiResource('documents', DocumentController::class);
    Route::post('documents/{document}/approve', [DocumentController::class, 'approve']);
    Route::post('documents/{document}/reject', [DocumentController::class, 'reject']);
    Route::get('documents/{document}/versions', [DocumentController::class, 'versions']);
    Route::post('documents/{document}/upload-version', [DocumentController::class, 'uploadVersion']);
    
    // Batch routes
    Route::apiResource('batches', BatchController::class);
    Route::get('batches-statistics', [BatchController::class, 'statistics']);
    Route::get('batches-expiring', [BatchController::class, 'expiring']);
    Route::get('batches-expired', [BatchController::class, 'expired']);
    Route::get('batches-trends', [BatchController::class, 'trends']);
    Route::get('batches-by-supplier', [BatchController::class, 'bySupplier']);
    Route::get('batches/{batch}/qr-code', [BatchController::class, 'generateQRCode']);
    Route::get('batches/{batch}/compliance', [BatchController::class, 'checkCompliance']);
    Route::post('batches/{batch}/status', [BatchController::class, 'updateStatus']);
    Route::get('products/{product}/batches', [BatchController::class, 'byProduct']);
    
    // Alert routes
    Route::get('alerts/dashboard', [AlertController::class, 'dashboard']);
    Route::get('alerts/statistics', [AlertController::class, 'stats']);
    Route::get('alerts/critical', [AlertController::class, 'critical']);
    Route::get('alerts/overdue', [AlertController::class, 'overdue']);
    Route::get('alerts/search', [AlertController::class, 'search']);
    Route::apiResource('alerts', AlertController::class);
    Route::post('alerts/{alert}/resolve', [AlertController::class, 'resolve']);
    Route::post('alerts/{alert}/escalate', [AlertController::class, 'escalate']);
    Route::patch('alerts/{alert}/status', [AlertController::class, 'updateStatus']);
    
    // File routes
    Route::post('files/upload', [FileController::class, 'upload']);
    Route::get('files/{file}/download', [FileController::class, 'download']);
    Route::delete('files/{file}', [FileController::class, 'delete']);
    
    // User management routes
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/activate', [UserController::class, 'activate']);
    Route::post('users/{user}/deactivate', [UserController::class, 'deactivate']);
});