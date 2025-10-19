<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class AlertController extends Controller
{
    /**
     * Get alerts for user's department
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $query = Alert::forDepartment($departmentCode);

        // Apply filters
        if ($request->has('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('primary_only')) {
            $query->where('primary_responsible_department', $departmentCode);
        }

        $alerts = $query->with(['product', 'document', 'batch', 'department'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $alerts->items(),
            'meta' => [
                'current_page' => $alerts->currentPage(),
                'last_page' => $alerts->lastPage(),
                'per_page' => $alerts->perPage(),
                'total' => $alerts->total(),
                'department' => $departmentCode,
                'filters' => $request->only(['priority', 'status', 'type', 'primary_only'])
            ]
        ]);
    }

    /**
     * Get single alert
     */
    public function show(string $id): JsonResponse
    {
        $alert = Alert::with(['product', 'document', 'batch', 'department', 'resolver'])->find($id);

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alert not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        $userDept = $user->department_code;
        
        if ($alert->primary_responsible_department !== $userDept && 
            !in_array($userDept, $alert->secondary_involved_departments ?? [])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $alert
        ]);
    }

    /**
     * Update alert status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $alert = Alert::find($id);

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alert not found'
            ], 404);
        }

        // Check permission (only primary responsible department can update status)
        $user = $request->user();
        if ($alert->primary_responsible_department !== $user->department_code) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary responsible department can update alert status'
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed',
            'resolution_notes' => 'nullable|string|max:1000'
        ]);

        try {
            if ($validated['status'] === 'resolved') {
                $alert->resolve($validated['resolution_notes'] ?? null, $user->id);
            } else {
                $alert->update([
                    'status' => $validated['status']
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Alert status updated successfully',
                'data' => $alert->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update alert status'
            ], 500);
        }
    }

    /**
     * Resolve alert
     */
    public function resolve(Request $request, string $id): JsonResponse
    {
        $alert = Alert::find($id);

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alert not found'
            ], 404);
        }

        // Check permission
        $user = $request->user();
        if ($alert->primary_responsible_department !== $user->department_code) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary responsible department can resolve alert'
            ], 403);
        }

        $validated = $request->validate([
            'resolution_notes' => 'required|string|max:1000'
        ]);

        try {
            $alert->resolve($validated['resolution_notes'], $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Alert resolved successfully',
                'data' => $alert->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve alert'
            ], 500);
        }
    }

    /**
     * Escalate alert priority
     */
    public function escalate(Request $request, string $id): JsonResponse
    {
        $alert = Alert::find($id);

        if (!$alert) {
            return response()->json([
                'success' => false,
                'message' => 'Alert not found'
            ], 404);
        }

        // Check permission
        $user = $request->user();
        if ($alert->primary_responsible_department !== $user->department_code) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary responsible department can escalate alert'
            ], 403);
        }

        try {
            $escalated = $alert->escalate();

            if ($escalated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Alert escalated successfully',
                    'data' => $alert->fresh()
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Alert is already at highest priority'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to escalate alert'
            ], 500);
        }
    }

    /**
     * Get alerts dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        // Primary responsibility alerts
        $primaryAlerts = Alert::where('primary_responsible_department', $departmentCode);
        
        // Secondary involvement alerts
        $secondaryAlerts = Alert::whereJsonContains('secondary_involved_departments', $departmentCode);

        $dashboard = [
            'primary_alerts' => [
                'total' => $primaryAlerts->count(),
                'critical' => $primaryAlerts->copy()->where('priority', 'critical')->count(),
                'high' => $primaryAlerts->copy()->where('priority', 'high')->count(),
                'open' => $primaryAlerts->copy()->where('status', 'open')->count(),
                'in_progress' => $primaryAlerts->copy()->where('status', 'in_progress')->count(),
                'overdue' => $primaryAlerts->copy()->overdue()->count()
            ],
            'secondary_alerts' => [
                'total' => $secondaryAlerts->count(),
                'critical' => $secondaryAlerts->copy()->where('priority', 'critical')->count(),
                'high' => $secondaryAlerts->copy()->where('priority', 'high')->count()
            ],
            'recent_alerts' => Alert::forDepartment($departmentCode)
                ->with(['product', 'document'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'by_type' => Alert::where('primary_responsible_department', $departmentCode)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'by_priority' => Alert::where('primary_responsible_department', $departmentCode)
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray()
        ];

        return response()->json([
            'success' => true,
            'data' => $dashboard
        ]);
    }

    /**
     * Get critical alerts
     */
    public function critical(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $criticalAlerts = Alert::forDepartment($departmentCode)
            ->where('priority', 'critical')
            ->where('status', '!=', 'resolved')
            ->with(['product', 'document', 'batch'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $criticalAlerts,
            'meta' => [
                'total' => $criticalAlerts->count(),
                'department' => $departmentCode
            ]
        ]);
    }

    /**
     * Get overdue alerts
     */
    public function overdue(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $overdueAlerts = Alert::forDepartment($departmentCode)
            ->overdue()
            ->with(['product', 'document', 'batch'])
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $overdueAlerts,
            'meta' => [
                'total' => $overdueAlerts->count(),
                'department' => $departmentCode
            ]
        ]);
    }

    /**
     * Get alert statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $stats = [
            'department' => $departmentCode,
            'total_alerts' => Alert::forDepartment($departmentCode)->count(),
            'primary_responsibility' => Alert::where('primary_responsible_department', $departmentCode)->count(),
            'secondary_involvement' => Alert::whereJsonContains('secondary_involved_departments', $departmentCode)->count(),
            'by_status' => Alert::where('primary_responsible_department', $departmentCode)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray(),
            'by_priority' => Alert::where('primary_responsible_department', $departmentCode)
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray(),
            'by_type' => Alert::where('primary_responsible_department', $departmentCode)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'response_time' => [
                'average_hours' => $this->calculateAverageResponseTime($departmentCode),
                'total_resolved' => Alert::where('primary_responsible_department', $departmentCode)
                    ->where('status', 'resolved')
                    ->count()
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Search alerts
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'priority' => 'nullable|string|in:low,medium,high,critical',
            'status' => 'nullable|string|in:open,in_progress,resolved,closed',
            'type' => 'nullable|string'
        ]);

        $user = $request->user();
        $departmentCode = $user->department_code;
        $query = $request->input('q');

        $searchQuery = Alert::forDepartment($departmentCode)
            ->where(function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('message', 'like', "%{$query}%");
            });

        // Apply filters
        if ($request->has('priority')) {
            $searchQuery->where('priority', $request->input('priority'));
        }

        if ($request->has('status')) {
            $searchQuery->where('status', $request->input('status'));
        }

        if ($request->has('type')) {
            $searchQuery->where('type', $request->input('type'));
        }

        $alerts = $searchQuery->with(['product', 'document', 'batch'])
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'meta' => [
                'query' => $query,
                'total' => $alerts->count(),
                'department' => $departmentCode,
                'filters' => $request->only(['priority', 'status', 'type'])
            ]
        ]);
    }

    /**
     * Calculate average response time for department
     */
    private function calculateAverageResponseTime(string $departmentCode): float
    {
        $resolvedAlerts = Alert::where('primary_responsible_department', $departmentCode)
            ->where('status', 'resolved')
            ->whereNotNull('resolved_at')
            ->get();

        if ($resolvedAlerts->isEmpty()) {
            return 0;
        }

        $totalResponseTime = 0;
        foreach ($resolvedAlerts as $alert) {
            $responseTime = $alert->created_at->diffInHours($alert->resolved_at);
            $totalResponseTime += $responseTime;
        }

        return round($totalResponseTime / $resolvedAlerts->count(), 2);
    }
}