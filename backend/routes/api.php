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
    Route::apiResource('departments', DepartmentController::class);
    Route::get('departments/{department}/metrics', [DepartmentController::class, 'metrics']);
    Route::get('departments/{department}/workload', [DepartmentController::class, 'workload']);
    
    // Product routes
    Route::apiResource('products', ProductController::class);
    Route::get('products/{product}/compliance', [ProductController::class, 'checkCompliance']);
    Route::post('products/{product}/approve', [ProductController::class, 'approve']);
    Route::post('products/{product}/reject', [ProductController::class, 'reject']);
    
    // Document routes
    Route::apiResource('documents', DocumentController::class);
    Route::post('documents/{document}/approve', [DocumentController::class, 'approve']);
    Route::post('documents/{document}/reject', [DocumentController::class, 'reject']);
    Route::get('documents/{document}/versions', [DocumentController::class, 'versions']);
    Route::post('documents/{document}/upload-version', [DocumentController::class, 'uploadVersion']);
    
    // Alert routes
    Route::apiResource('alerts', AlertController::class);
    Route::post('alerts/{alert}/acknowledge', [AlertController::class, 'acknowledge']);
    Route::post('alerts/{alert}/resolve', [AlertController::class, 'resolve']);
    Route::post('alerts/{alert}/escalate', [AlertController::class, 'escalate']);
    
    // File routes
    Route::post('files/upload', [FileController::class, 'upload']);
    Route::get('files/{file}/download', [FileController::class, 'download']);
    Route::delete('files/{file}', [FileController::class, 'delete']);
    
    // User management routes
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/activate', [UserController::class, 'activate']);
    Route::post('users/{user}/deactivate', [UserController::class, 'deactivate']);
});