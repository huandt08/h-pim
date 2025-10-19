<?php

namespace App\Services;

use App\Models\Batch;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class BatchService
{
    /**
     * Get batches with filters and pagination
     */
    public function getBatches(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Batch::with(['product']);

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($productQuery) use ($search) {
                      $productQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('code', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['supplier'])) {
            $query->where('supplier', 'like', "%{$filters['supplier']}%");
        }

        if (!empty($filters['expiry_from'])) {
            $query->where('expiry_date', '>=', $filters['expiry_from']);
        }

        if (!empty($filters['expiry_to'])) {
            $query->where('expiry_date', '<=', $filters['expiry_to']);
        }

        if (!empty($filters['production_from'])) {
            $query->where('production_date', '>=', $filters['production_from']);
        }

        if (!empty($filters['production_to'])) {
            $query->where('production_date', '<=', $filters['production_to']);
        }

        // Filter expired batches
        if (isset($filters['is_expired'])) {
            if ($filters['is_expired']) {
                $query->where('expiry_date', '<', now());
            } else {
                $query->where('expiry_date', '>=', now());
            }
        }

        // Filter expiring soon
        if (isset($filters['expiring_soon_days'])) {
            $days = (int) $filters['expiring_soon_days'];
            $query->where('expiry_date', '<=', now()->addDays($days))
                  ->where('expiry_date', '>', now());
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get batch by ID
     */
    public function getBatchById(string $id): ?Batch
    {
        return Batch::with(['product', 'documents', 'alerts'])->find($id);
    }

    /**
     * Create new batch
     */
    public function createBatch(array $data): Batch
    {
        // Generate batch number if not provided
        if (empty($data['batch_number'])) {
            $data['batch_number'] = $this->generateBatchNumber($data['product_id']);
        }

        return Batch::create($data);
    }

    /**
     * Update batch
     */
    public function updateBatch(string $id, array $data): ?Batch
    {
        $batch = Batch::find($id);
        if (!$batch) {
            return null;
        }

        $batch->update($data);
        return $batch->fresh(['product']);
    }

    /**
     * Delete batch
     */
    public function deleteBatch(string $id): bool
    {
        $batch = Batch::find($id);
        if (!$batch) {
            return false;
        }

        return $batch->delete();
    }

    /**
     * Get batch statistics
     */
    public function getBatchStatistics(): array
    {
        $total = Batch::count();
        $byStatus = Batch::selectRaw('status, COUNT(*) as count')
                         ->groupBy('status')
                         ->pluck('count', 'status')
                         ->toArray();

        $expired = Batch::where('expiry_date', '<', now())->count();
        $expiringSoon = Batch::where('expiry_date', '<=', now()->addDays(30))
                             ->where('expiry_date', '>', now())
                             ->count();

        $totalQuantity = Batch::sum('quantity');
        $averageQuantity = $total > 0 ? round($totalQuantity / $total, 2) : 0;

        return [
            'total_batches' => $total,
            'by_status' => $byStatus,
            'expired_batches' => $expired,
            'expiring_soon' => $expiringSoon,
            'total_quantity' => $totalQuantity,
            'average_quantity' => $averageQuantity,
        ];
    }

    /**
     * Get expiring batches
     */
    public function getExpiringBatches(int $days = 30): Collection
    {
        return Batch::with(['product'])
                    ->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>', now())
                    ->orderBy('expiry_date', 'asc')
                    ->get();
    }

    /**
     * Get expired batches
     */
    public function getExpiredBatches(): Collection
    {
        return Batch::with(['product'])
                    ->where('expiry_date', '<', now())
                    ->orderBy('expiry_date', 'desc')
                    ->get();
    }

    /**
     * Get batches by product
     */
    public function getBatchesByProduct(string $productId): Collection
    {
        return Batch::where('product_id', $productId)
                    ->orderBy('production_date', 'desc')
                    ->get();
    }

    /**
     * Get batches by supplier
     */
    public function getBatchesBySupplier(string $supplier): Collection
    {
        return Batch::with(['product'])
                    ->where('supplier', 'like', "%{$supplier}%")
                    ->orderBy('production_date', 'desc')
                    ->get();
    }

    /**
     * Update batch status
     */
    public function updateBatchStatus(string $id, string $status): ?Batch
    {
        $batch = Batch::find($id);
        if (!$batch) {
            return null;
        }

        $batch->update(['status' => $status]);
        return $batch->fresh(['product']);
    }

    /**
     * Generate QR code data for batch
     */
    public function generateQRCodeData(string $batchId): array
    {
        $batch = $this->getBatchById($batchId);
        if (!$batch) {
            throw new \Exception('Batch not found');
        }

        return [
            'type' => 'batch',
            'id' => $batch->id,
            'batch_number' => $batch->batch_number,
            'product_id' => $batch->product_id,
            'product_name' => $batch->product->name,
            'production_date' => $batch->production_date?->format('Y-m-d'),
            'expiry_date' => $batch->expiry_date?->format('Y-m-d'),
            'quantity' => $batch->quantity,
            'unit' => $batch->unit,
            'status' => $batch->status,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Generate unique batch number
     */
    private function generateBatchNumber(string $productId): string
    {
        $product = Product::find($productId);
        if (!$product) {
            throw new \Exception('Product not found');
        }

        $date = now()->format('Ymd');
        $productCode = strtoupper($product->code);
        
        // Find the next sequence number for this product and date
        $lastBatch = Batch::where('batch_number', 'like', "{$productCode}-{$date}-%")
                          ->orderBy('batch_number', 'desc')
                          ->first();

        $sequence = 1;
        if ($lastBatch) {
            $parts = explode('-', $lastBatch->batch_number);
            if (count($parts) === 3) {
                $sequence = (int) $parts[2] + 1;
            }
        }

        return sprintf('%s-%s-%03d', $productCode, $date, $sequence);
    }

    /**
     * Get batch trends
     */
    public function getBatchTrends(int $days = 30): array
    {
        $endDate = now();
        $startDate = $endDate->copy()->subDays($days);

        // Get daily batch creation counts
        $dailyCounts = Batch::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                           ->whereBetween('created_at', [$startDate, $endDate])
                           ->groupBy('date')
                           ->orderBy('date')
                           ->get()
                           ->keyBy('date')
                           ->map(fn($item) => $item->count);

        // Get status distribution over time
        $statusTrends = Batch::selectRaw('DATE(created_at) as date, status, COUNT(*) as count')
                            ->whereBetween('created_at', [$startDate, $endDate])
                            ->groupBy('date', 'status')
                            ->orderBy('date')
                            ->get()
                            ->groupBy('date');

        return [
            'daily_counts' => $dailyCounts,
            'status_trends' => $statusTrends,
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'days' => $days,
            ],
        ];
    }

    /**
     * Check batch compliance
     */
    public function checkBatchCompliance(string $id): array
    {
        $batch = $this->getBatchById($id);
        if (!$batch) {
            throw new \Exception('Batch not found');
        }

        $issues = [];
        $warnings = [];

        // Check if expired
        if ($batch->isExpired()) {
            $issues[] = 'Batch is expired';
        }

        // Check if expiring soon
        if ($batch->isExpiringSoon(30)) {
            $warnings[] = 'Batch expires within 30 days';
        }

        // Check if production date is in the future
        if ($batch->production_date && $batch->production_date->isFuture()) {
            $issues[] = 'Production date is in the future';
        }

        // Check if expiry date is before production date
        if ($batch->production_date && $batch->expiry_date && 
            $batch->expiry_date->lt($batch->production_date)) {
            $issues[] = 'Expiry date is before production date';
        }

        // Check quantity
        if ($batch->quantity <= 0) {
            $issues[] = 'Invalid quantity';
        }

        // Check if missing required fields
        if (empty($batch->supplier)) {
            $warnings[] = 'Missing supplier information';
        }

        if (empty($batch->warehouse_notes)) {
            $warnings[] = 'Missing warehouse notes';
        }

        $complianceScore = 100;
        $complianceScore -= count($issues) * 20; // Each issue reduces score by 20
        $complianceScore -= count($warnings) * 5; // Each warning reduces score by 5
        $complianceScore = max(0, $complianceScore);

        return [
            'compliant' => empty($issues),
            'compliance_score' => $complianceScore,
            'issues' => $issues,
            'warnings' => $warnings,
            'checked_at' => now()->toISOString(),
        ];
    }
}