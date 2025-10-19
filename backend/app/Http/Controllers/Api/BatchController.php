<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BatchService;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BatchController extends Controller
{
    protected BatchService $batchService;

    public function __construct(BatchService $batchService)
    {
        $this->batchService = $batchService;
    }

    /**
     * Display a listing of batches
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search', 'status', 'product_id', 'supplier',
                'expiry_from', 'expiry_to', 'production_from', 'production_to',
                'is_expired', 'expiring_soon_days'
            ]);

            $perPage = $request->get('per_page', 15);
            $batches = $this->batchService->getBatches($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $batches->items(),
                'meta' => [
                    'current_page' => $batches->currentPage(),
                    'last_page' => $batches->lastPage(),
                    'per_page' => $batches->perPage(),
                    'total' => $batches->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batches',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created batch
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'batch_number' => 'sometimes|string|max:100|unique:batches',
                'product_id' => 'required|uuid|exists:products,id',
                'production_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:production_date',
                'quantity' => 'required|integer|min:1',
                'unit' => 'required|string|max:50',
                'supplier' => 'nullable|string|max:255',
                'warehouse_notes' => 'nullable|string',
                'status' => 'required|in:incoming,stored,shipped,expired',
            ]);

            $batch = $this->batchService->createBatch($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Batch created successfully',
                'data' => $batch->load('product'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create batch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified batch
     */
    public function show(string $id): JsonResponse
    {
        try {
            $batch = $this->batchService->getBatchById($id);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $batch,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified batch
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'batch_number' => 'sometimes|string|max:100|unique:batches,batch_number,' . $id,
                'product_id' => 'sometimes|uuid|exists:products,id',
                'production_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:production_date',
                'quantity' => 'sometimes|integer|min:1',
                'unit' => 'sometimes|string|max:50',
                'supplier' => 'nullable|string|max:255',
                'warehouse_notes' => 'nullable|string',
                'status' => 'sometimes|in:incoming,stored,shipped,expired',
            ]);

            $batch = $this->batchService->updateBatch($id, $validatedData);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch updated successfully',
                'data' => $batch,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update batch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified batch
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $deleted = $this->batchService->deleteBatch($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete batch',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get batch statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->batchService->getBatchStatistics();

            return response()->json([
                'success' => true,
                'data' => $statistics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get expiring batches
     */
    public function expiring(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $batches = $this->batchService->getExpiringBatches($days);

            return response()->json([
                'success' => true,
                'data' => $batches,
                'meta' => [
                    'days' => $days,
                    'count' => $batches->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expiring batches',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get expired batches
     */
    public function expired(): JsonResponse
    {
        try {
            $batches = $this->batchService->getExpiredBatches();

            return response()->json([
                'success' => true,
                'data' => $batches,
                'meta' => [
                    'count' => $batches->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch expired batches',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update batch status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'status' => 'required|in:incoming,stored,shipped,expired',
            ]);

            $batch = $this->batchService->updateBatchStatus($id, $validatedData['status']);

            if (!$batch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batch not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Batch status updated successfully',
                'data' => $batch,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update batch status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate QR code for batch
     */
    public function generateQRCode(string $id): JsonResponse
    {
        try {
            $qrData = $this->batchService->generateQRCodeData($id);

            return response()->json([
                'success' => true,
                'data' => $qrData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check batch compliance
     */
    public function checkCompliance(string $id): JsonResponse
    {
        try {
            $compliance = $this->batchService->checkBatchCompliance($id);

            return response()->json([
                'success' => true,
                'data' => $compliance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check compliance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get batch trends
     */
    public function trends(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $trends = $this->batchService->getBatchTrends($days);

            return response()->json([
                'success' => true,
                'data' => $trends,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trends',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get batches by product
     */
    public function byProduct(string $productId): JsonResponse
    {
        try {
            $batches = $this->batchService->getBatchesByProduct($productId);

            return response()->json([
                'success' => true,
                'data' => $batches,
                'meta' => [
                    'product_id' => $productId,
                    'count' => $batches->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batches by product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get batches by supplier
     */
    public function bySupplier(Request $request): JsonResponse
    {
        try {
            $supplier = $request->get('supplier');
            if (!$supplier) {
                return response()->json([
                    'success' => false,
                    'message' => 'Supplier parameter is required',
                ], 400);
            }

            $batches = $this->batchService->getBatchesBySupplier($supplier);

            return response()->json([
                'success' => true,
                'data' => $batches,
                'meta' => [
                    'supplier' => $supplier,
                    'count' => $batches->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch batches by supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
