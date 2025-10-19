<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Services\DepartmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function __construct(
        private DepartmentService $departmentService
    ) {}

    /**
     * Get all departments
     */
    public function index(): JsonResponse
    {
        $departments = $this->departmentService->getAllDepartments();

        return response()->json([
            'success' => true,
            'data' => $departments
        ]);
    }

    /**
     * Get single department
     */
    public function show(string $code): JsonResponse
    {
        $department = $this->departmentService->getDepartmentByCode($code);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $department
        ]);
    }

    /**
     * Get department metrics with roles
     */
    public function metrics(string $code): JsonResponse
    {
        $metrics = $this->departmentService->calculateDepartmentMetricsWithRoles($code);

        if (isset($metrics['error'])) {
            return response()->json([
                'success' => false,
                'message' => $metrics['error']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $metrics
        ]);
    }

    /**
     * Get current user's department metrics
     */
    public function myMetrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $metrics = $this->departmentService->calculateDepartmentMetricsWithRoles($departmentCode);

        if (isset($metrics['error'])) {
            return response()->json([
                'success' => false,
                'message' => $metrics['error']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $metrics
        ]);
    }

    /**
     * Get department workload
     */
    public function workload(string $code): JsonResponse
    {
        $workload = $this->departmentService->getDepartmentWorkload($code);

        if (isset($workload['error'])) {
            return response()->json([
                'success' => false,
                'message' => $workload['error']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $workload
        ]);
    }

    /**
     * Get current user's department workload
     */
    public function myWorkload(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $workload = $this->departmentService->getDepartmentWorkload($departmentCode);

        if (isset($workload['error'])) {
            return response()->json([
                'success' => false,
                'message' => $workload['error']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $workload
        ]);
    }

    /**
     * Get departments comparison
     */
    public function comparison(): JsonResponse
    {
        $comparison = $this->departmentService->getDepartmentsComparison();

        return response()->json([
            'success' => true,
            'data' => $comparison,
            'meta' => [
                'total_departments' => count($comparison),
                'sorted_by' => 'workload_score_desc'
            ]
        ]);
    }

    /**
     * Get department collaboration matrix
     */
    public function collaboration(): JsonResponse
    {
        $collaboration = $this->departmentService->getDepartmentCollaboration();

        return response()->json([
            'success' => true,
            'data' => $collaboration
        ]);
    }

    /**
     * Get dashboard statistics for department
     */
    public function dashboard(string $code): JsonResponse
    {
        $dashboardStats = $this->departmentService->getDepartmentDashboardStats($code);

        if (isset($dashboardStats['error'])) {
            return response()->json([
                'success' => false,
                'message' => $dashboardStats['error']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $dashboardStats
        ]);
    }

    /**
     * Get dashboard statistics for current user's department
     */
    public function myDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $dashboardStats = $this->departmentService->getDepartmentDashboardStats($departmentCode);

        if (isset($dashboardStats['error'])) {
            return response()->json([
                'success' => false,
                'message' => $dashboardStats['error']
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $dashboardStats
        ]);
    }

    /**
     * Get department users
     */
    public function users(string $code): JsonResponse
    {
        $department = $this->departmentService->getDepartmentByCode($code);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $users = $department->users()->where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $users,
            'meta' => [
                'department' => $code,
                'total_users' => $users->count()
            ]
        ]);
    }

    /**
     * Get department products (primary ownership)
     */
    public function products(Request $request, string $code): JsonResponse
    {
        $department = $this->departmentService->getDepartmentByCode($code);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $query = $department->primaryProducts();

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('compliance_min')) {
            $query->where('compliance_percentage', '>=', $request->input('compliance_min'));
        }

        $products = $query->with(['documents', 'alerts'])->get();

        return response()->json([
            'success' => true,
            'data' => $products,
            'meta' => [
                'department' => $code,
                'total_products' => $products->count(),
                'filters' => $request->only(['status', 'compliance_min'])
            ]
        ]);
    }

    /**
     * Get department documents (primary ownership)
     */
    public function documents(Request $request, string $code): JsonResponse
    {
        $department = $this->departmentService->getDepartmentByCode($code);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $query = $department->primaryDocuments();

        // Apply filters
        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('required_only')) {
            $query->where('is_required', true);
        }

        $documents = $query->with(['product', 'versions'])->get();

        return response()->json([
            'success' => true,
            'data' => $documents,
            'meta' => [
                'department' => $code,
                'total_documents' => $documents->count(),
                'filters' => $request->only(['category', 'status', 'required_only'])
            ]
        ]);
    }

    /**
     * Get department alerts (primary responsibility)
     */
    public function alerts(Request $request, string $code): JsonResponse
    {
        $department = $this->departmentService->getDepartmentByCode($code);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $query = $department->primaryAlerts();

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

        $alerts = $query->with(['product', 'document'])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $alerts,
            'meta' => [
                'department' => $code,
                'total_alerts' => $alerts->count(),
                'filters' => $request->only(['priority', 'status', 'type'])
            ]
        ]);
    }

    /**
     * Get department overview with summary statistics
     */
    public function overview(string $code): JsonResponse
    {
        $department = $this->departmentService->getDepartmentByCode($code);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $metrics = $this->departmentService->calculateDepartmentMetricsWithRoles($code);
        $workload = $this->departmentService->getDepartmentWorkload($code);

        $overview = [
            'department' => $department,
            'metrics' => $metrics,
            'workload' => $workload,
            'summary' => [
                'performance_level' => $this->getPerformanceLevel($metrics),
                'workload_level' => $workload['workload_level'],
                'compliance_status' => $this->getComplianceStatus($metrics['overall_compliance_score']),
                'alert_status' => $this->getAlertStatus($metrics['critical_alerts'], $metrics['overdue_alerts'])
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $overview
        ]);
    }

    /**
     * Get performance level based on metrics
     */
    private function getPerformanceLevel(array $metrics): string
    {
        $compliance = $metrics['overall_compliance_score'];
        $criticalAlerts = $metrics['critical_alerts'];
        $overdueAlerts = $metrics['overdue_alerts'];

        if ($compliance >= 95 && $criticalAlerts === 0 && $overdueAlerts === 0) {
            return 'Excellent';
        } elseif ($compliance >= 85 && $criticalAlerts <= 1 && $overdueAlerts <= 2) {
            return 'Good';
        } elseif ($compliance >= 70 && $criticalAlerts <= 3 && $overdueAlerts <= 5) {
            return 'Average';
        } elseif ($compliance >= 50) {
            return 'Below Average';
        } else {
            return 'Poor';
        }
    }

    /**
     * Get compliance status
     */
    private function getComplianceStatus(float $compliance): string
    {
        if ($compliance >= 95) return 'Excellent';
        if ($compliance >= 85) return 'Good';
        if ($compliance >= 70) return 'Fair';
        if ($compliance >= 50) return 'Poor';
        return 'Critical';
    }

    /**
     * Get alert status
     */
    private function getAlertStatus(int $critical, int $overdue): string
    {
        if ($critical === 0 && $overdue === 0) return 'Good';
        if ($critical <= 1 && $overdue <= 2) return 'Attention';
        if ($critical <= 3 && $overdue <= 5) return 'Warning';
        return 'Critical';
    }
}