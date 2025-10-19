<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\User;
use App\Models\Product;
use App\Models\Document;
use App\Models\Batch;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AlertService
{
    /**
     * Get all alerts with filters and pagination
     */
    public function getAllAlerts(array $filters = [], ?User $user = null): LengthAwarePaginator
    {
        $query = Alert::with(['product', 'document', 'batch', 'department', 'resolver']);

        // Apply department filter
        if (isset($filters['department'])) {
            if ($filters['my_alerts_only'] ?? false) {
                $query->where('primary_responsible_department', $filters['department']);
            } else {
                $query->forDepartment($filters['department']);
            }
        } elseif ($user && $user->department) {
            $query->forDepartment($user->department);
        }

        // Apply priority filter
        if (isset($filters['priority'])) {
            $query->byPriority($filters['priority']);
        }

        // Apply status filter
        if (isset($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        // Apply type filter
        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }

        // Apply overdue filter
        if ($filters['overdue_only'] ?? false) {
            $query->overdue();
        }

        // Default ordering by priority and creation date
        $query->orderByRaw("
            CASE priority 
                WHEN 'critical' THEN 4 
                WHEN 'high' THEN 3 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 1 
                ELSE 0 
            END DESC
        ")->orderBy('created_at', 'desc');

        $perPage = $filters['per_page'] ?? 20;
        return $query->paginate($perPage);
    }

    /**
     * Get alert by ID with relationships
     */
    public function getAlertById(string $id): ?Alert
    {
        return Alert::with(['product', 'document', 'batch', 'department', 'resolver'])->find($id);
    }

    /**
     * Create new alert
     */
    public function createAlert(array $data, ?User $user = null): Alert
    {
        return Alert::create($data);
    }

    /**
     * Update alert
     */
    public function updateAlert(Alert $alert, array $data, ?User $user = null): Alert
    {
        $alert->update($data);
        return $alert->fresh(['product', 'document', 'batch', 'department', 'resolver']);
    }

    /**
     * Delete alert
     */
    public function deleteAlert(Alert $alert): bool
    {
        return $alert->delete();
    }

    /**
     * Resolve alert
     */
    public function resolveAlert(Alert $alert, ?string $notes = null, ?User $user = null): Alert
    {
        $alert->resolve($notes, $user?->id);
        return $alert->fresh(['product', 'document', 'batch', 'department', 'resolver']);
    }

    /**
     * Mark alert as in progress
     */
    public function markInProgress(Alert $alert): Alert
    {
        $alert->markInProgress();
        return $alert->fresh(['product', 'document', 'batch', 'department', 'resolver']);
    }

    /**
     * Escalate alert priority
     */
    public function escalateAlert(Alert $alert): ?Alert
    {
        $escalated = $alert->escalate();
        return $escalated ? $alert->fresh(['product', 'document', 'batch', 'department', 'resolver']) : null;
    }

    /**
     * Get alert statistics for a department
     */
    public function getAlertStatistics(?string $departmentCode = null): array
    {
        $query = Alert::query();

        if ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        $stats = [
            'total_alerts' => $query->count(),
            'by_status' => [
                'open' => $query->copy()->where('status', 'open')->count(),
                'in_progress' => $query->copy()->where('status', 'in_progress')->count(),
                'resolved' => $query->copy()->where('status', 'resolved')->count(),
                'closed' => $query->copy()->where('status', 'closed')->count()
            ],
            'by_priority' => [
                'critical' => $query->copy()->where('priority', 'critical')->count(),
                'high' => $query->copy()->where('priority', 'high')->count(),
                'medium' => $query->copy()->where('priority', 'medium')->count(),
                'low' => $query->copy()->where('priority', 'low')->count()
            ],
            'by_type' => Alert::when($departmentCode, function($q) use ($departmentCode) {
                    return $q->where('primary_responsible_department', $departmentCode);
                })
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'overdue_count' => $query->copy()->overdue()->count(),
            'critical_open' => $query->copy()->critical()->active()->count(),
            'average_response_time_hours' => $this->calculateAverageResponseTime($departmentCode),
            'resolution_rate' => $this->calculateResolutionRate($departmentCode),
            'trends' => $this->getWeeklyTrends($departmentCode)
        ];

        return $stats;
    }

    /**
     * Get overdue alerts
     */
    public function getOverdueAlerts(?string $departmentCode = null): Collection
    {
        $query = Alert::overdue()->with(['product', 'document', 'batch', 'department']);

        if ($departmentCode) {
            $query->forDepartment($departmentCode);
        }

        return $query->orderBy('due_date')->get();
    }

    /**
     * Get critical alerts
     */
    public function getCriticalAlerts(?string $departmentCode = null): Collection
    {
        $query = Alert::critical()->active()->with(['product', 'document', 'batch', 'department']);

        if ($departmentCode) {
            $query->forDepartment($departmentCode);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Perform bulk operations on alerts
     */
    public function bulkOperation(array $alertIds, string $operation, array $data = [], ?User $user = null): array
    {
        $alerts = Alert::whereIn('id', $alertIds)->get();
        $results = [];

        foreach ($alerts as $alert) {
            try {
                switch ($operation) {
                    case 'resolve':
                        $notes = $data['resolution_notes'] ?? null;
                        $this->resolveAlert($alert, $notes, $user);
                        $results[] = ['id' => $alert->id, 'status' => 'resolved'];
                        break;

                    case 'mark_in_progress':
                        $this->markInProgress($alert);
                        $results[] = ['id' => $alert->id, 'status' => 'marked_in_progress'];
                        break;

                    case 'escalate':
                        $escalated = $this->escalateAlert($alert);
                        $results[] = [
                            'id' => $alert->id, 
                            'status' => $escalated ? 'escalated' : 'already_max_priority'
                        ];
                        break;

                    case 'delete':
                        $this->deleteAlert($alert);
                        $results[] = ['id' => $alert->id, 'status' => 'deleted'];
                        break;

                    case 'update_department':
                        if (isset($data['department'])) {
                            $this->updateAlert($alert, ['primary_responsible_department' => $data['department']], $user);
                            $results[] = ['id' => $alert->id, 'status' => 'department_updated'];
                        }
                        break;
                }
            } catch (\Exception $e) {
                $results[] = ['id' => $alert->id, 'status' => 'error', 'message' => $e->getMessage()];
            }
        }

        return $results;
    }

    /**
     * Get alert trends and analytics
     */
    public function getAlertTrends(array $params = []): array
    {
        $period = $params['period'] ?? 'month';
        $departmentCode = $params['department'] ?? null;
        $startDate = $params['start_date'] ?? now()->subMonth();
        $endDate = $params['end_date'] ?? now();

        $query = Alert::whereBetween('created_at', [$startDate, $endDate]);

        if ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        // Group by date based on period
        $dateFormat = match($period) {
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            'quarter' => '%Y-Q%q',
            'year' => '%Y',
            default => '%Y-%m-%d'
        };

        $trends = [
            'created_alerts' => $query->copy()
                ->selectRaw("DATE_FORMAT(created_at, '{$dateFormat}') as period, COUNT(*) as count")
                ->groupBy('period')
                ->orderBy('period')
                ->pluck('count', 'period')
                ->toArray(),

            'resolved_alerts' => $query->copy()
                ->whereNotNull('resolved_at')
                ->selectRaw("DATE_FORMAT(resolved_at, '{$dateFormat}') as period, COUNT(*) as count")
                ->groupBy('period')
                ->orderBy('period')
                ->pluck('count', 'period')
                ->toArray(),

            'by_priority' => $query->copy()
                ->selectRaw("priority, DATE_FORMAT(created_at, '{$dateFormat}') as period, COUNT(*) as count")
                ->groupBy(['priority', 'period'])
                ->orderBy('period')
                ->get()
                ->groupBy('priority')
                ->map(fn($items) => $items->pluck('count', 'period')->toArray())
                ->toArray(),

            'response_time_trend' => $this->getResponseTimeTrend($departmentCode, $startDate, $endDate, $dateFormat),
            
            'top_alert_types' => $query->copy()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->pluck('count', 'type')
                ->toArray()
        ];

        return $trends;
    }

    /**
     * Create system alert for automated monitoring
     */
    public function createSystemAlert(array $data): Alert
    {
        return Alert::create([
            'type' => $data['type'],
            'priority' => $data['priority'],
            'title' => $data['title'],
            'message' => $data['message'],
            'primary_responsible_department' => $data['department'],
            'status' => 'open',
            'metadata' => array_merge($data['metadata'] ?? [], [
                'created_by_system' => true,
                'created_at_timestamp' => now()->timestamp
            ])
        ]);
    }

    /**
     * Automatic alert generation for compliance monitoring
     */
    public function generateComplianceAlerts(): array
    {
        $alerts = [];

        // Check for low compliance products
        $lowComplianceProducts = Product::where('compliance_percentage', '<', 70)
            ->where('status', 'active')
            ->get();

        foreach ($lowComplianceProducts as $product) {
            // Check if alert already exists
            $existingAlert = Alert::where('product_id', $product->id)
                ->where('type', 'low_compliance')
                ->where('status', '!=', 'resolved')
                ->first();

            if (!$existingAlert) {
                $alert = Alert::createLowComplianceAlert($product);
                $alerts[] = $alert;
            }
        }

        // Check for expiring documents
        $expiringDocuments = Document::where('deadline', '<=', now()->addDays(30))
            ->where('deadline', '>', now())
            ->where('status', 'active')
            ->get();

        foreach ($expiringDocuments as $document) {
            $existingAlert = Alert::where('document_id', $document->id)
                ->where('type', 'document_expiry')
                ->where('status', '!=', 'resolved')
                ->first();

            if (!$existingAlert) {
                $alert = Alert::createDocumentExpiryAlert($document);
                $alerts[] = $alert;
            }
        }

        // Check for missing required documents
        $products = Product::where('status', 'active')->get();
        
        foreach ($products as $product) {
            $requiredDocumentTypes = ['registration', 'certificate', 'specification'];
            
            foreach ($requiredDocumentTypes as $type) {
                $hasDocument = $product->documents()->where('category', $type)->exists();
                
                if (!$hasDocument) {
                    $existingAlert = Alert::where('product_id', $product->id)
                        ->where('type', 'missing_document')
                        ->where('message', 'like', "%{$type}%")
                        ->where('status', '!=', 'resolved')
                        ->first();

                    if (!$existingAlert) {
                        $alert = Alert::createMissingDocumentAlert($product, $type);
                        $alerts[] = $alert;
                    }
                }
            }
        }

        return $alerts;
    }

    /**
     * Calculate average response time for department
     */
    private function calculateAverageResponseTime(?string $departmentCode = null): float
    {
        $query = Alert::where('status', 'resolved')->whereNotNull('resolved_at');

        if ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        $alerts = $query->get();

        if ($alerts->isEmpty()) {
            return 0;
        }

        $totalHours = $alerts->sum(function ($alert) {
            return $alert->created_at->diffInHours($alert->resolved_at);
        });

        return round($totalHours / $alerts->count(), 2);
    }

    /**
     * Calculate resolution rate for department
     */
    private function calculateResolutionRate(?string $departmentCode = null): float
    {
        $query = Alert::query();

        if ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        $totalAlerts = $query->count();
        
        if ($totalAlerts === 0) {
            return 0;
        }

        $resolvedAlerts = $query->copy()->where('status', 'resolved')->count();

        return round(($resolvedAlerts / $totalAlerts) * 100, 2);
    }

    /**
     * Get weekly trends for last 12 weeks
     */
    private function getWeeklyTrends(?string $departmentCode = null): array
    {
        $query = Alert::where('created_at', '>=', now()->subWeeks(12));

        if ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        return $query->selectRaw('YEARWEEK(created_at) as week, COUNT(*) as count')
            ->groupBy('week')
            ->orderBy('week')
            ->pluck('count', 'week')
            ->toArray();
    }

    /**
     * Get response time trend
     */
    private function getResponseTimeTrend(?string $departmentCode, $startDate, $endDate, string $dateFormat): array
    {
        $query = Alert::whereBetween('resolved_at', [$startDate, $endDate])
            ->whereNotNull('resolved_at');

        if ($departmentCode) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        return $query->selectRaw("
                DATE_FORMAT(resolved_at, '{$dateFormat}') as period,
                AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours
            ")
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('avg_hours', 'period')
            ->map(fn($value) => round($value, 2))
            ->toArray();
    }
}