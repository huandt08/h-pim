<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Product;
use App\Models\Document;
use App\Models\Alert;
use Illuminate\Database\Eloquent\Collection;

class DepartmentService
{
    /**
     * Get all departments
     */
    public function getAllDepartments(): Collection
    {
        return Department::all();
    }

    /**
     * Get department by code
     */
    public function getDepartmentByCode(string $code): ?Department
    {
        return Department::findByCode($code);
    }

    /**
     * Calculate department metrics with roles (Primary vs Secondary)
     */
    public function calculateDepartmentMetricsWithRoles(string $departmentCode): array
    {
        $department = $this->getDepartmentByCode($departmentCode);
        
        if (!$department) {
            return [
                'error' => 'Department not found',
                'department' => $departmentCode
            ];
        }

        // Products metrics
        $primaryProducts = $department->primaryProducts();
        $primaryProductsCount = $primaryProducts->count();
        $secondaryProductsCount = Product::whereJsonContains('secondary_access_departments', $departmentCode)->count();

        // Documents metrics
        $primaryDocuments = $department->primaryDocuments();
        $primaryDocumentsCount = $primaryDocuments->count();
        $secondaryDocumentsCount = Document::whereJsonContains('secondary_access_departments', $departmentCode)->count();

        // Alerts metrics
        $totalAlerts = $department->primaryAlerts()->count();
        $criticalAlerts = $department->primaryAlerts()->where('priority', 'critical')->count();
        $openAlerts = $department->primaryAlerts()->where('status', 'open')->count();
        $overdueAlerts = $department->primaryAlerts()->where('due_date', '<', now())->whereIn('status', ['open', 'in_progress'])->count();

        // Compliance metrics
        $avgCompliancePrimary = $primaryProducts->avg('compliance_percentage') ?? 0;
        $lowComplianceProducts = $primaryProducts->where('compliance_percentage', '<', 80)->count();

        // Document deadlines
        $upcomingDeadlines = $primaryDocuments->where('deadline', '>', now())
            ->where('deadline', '<=', now()->addDays(30))->count();
        $expiredDocuments = $primaryDocuments->where('deadline', '<', now())
            ->where('status', 'active')->count();

        // Response time metrics
        $resolvedAlerts = Alert::where('primary_responsible_department', $departmentCode)
            ->where('status', 'resolved')
            ->whereNotNull('resolved_at')
            ->get();

        $avgResponseTime = $this->calculateAverageResponseTime($resolvedAlerts);

        return [
            'department' => $departmentCode,
            'department_name' => $department->name,
            
            // Products
            'primary_owner_products' => $primaryProductsCount,
            'secondary_access_products' => $secondaryProductsCount,
            'total_accessible_products' => $primaryProductsCount + $secondaryProductsCount,
            
            // Documents
            'primary_owner_documents' => $primaryDocumentsCount,
            'secondary_access_documents' => $secondaryDocumentsCount,
            'total_accessible_documents' => $primaryDocumentsCount + $secondaryDocumentsCount,
            
            // Alerts
            'total_alerts' => $totalAlerts,
            'critical_alerts' => $criticalAlerts,
            'open_alerts' => $openAlerts,
            'overdue_alerts' => $overdueAlerts,
            
            // Compliance
            'overall_compliance_score' => round($avgCompliancePrimary, 2),
            'low_compliance_products' => $lowComplianceProducts,
            
            // Deadlines
            'upcoming_deadlines' => $upcomingDeadlines,
            'expired_documents' => $expiredDocuments,
            
            // Performance
            'avg_response_time_hours' => $avgResponseTime,
            
            // Calculated at
            'calculated_at' => now()->toISOString()
        ];
    }

    /**
     * Get department workload summary
     */
    public function getDepartmentWorkload(string $departmentCode): array
    {
        $metrics = $this->calculateDepartmentMetricsWithRoles($departmentCode);
        
        if (isset($metrics['error'])) {
            return $metrics;
        }

        // Calculate workload score (0-100)
        $workloadFactors = [
            'open_alerts' => $metrics['open_alerts'] * 10,
            'critical_alerts' => $metrics['critical_alerts'] * 20,
            'overdue_alerts' => $metrics['overdue_alerts'] * 25,
            'expired_documents' => $metrics['expired_documents'] * 15,
            'upcoming_deadlines' => $metrics['upcoming_deadlines'] * 5,
        ];

        $totalWorkload = array_sum($workloadFactors);
        $workloadScore = min(100, $totalWorkload);

        return [
            'department' => $departmentCode,
            'workload_score' => $workloadScore,
            'workload_level' => $this->getWorkloadLevel($workloadScore),
            'workload_factors' => $workloadFactors,
            'recommendations' => $this->getWorkloadRecommendations($workloadScore, $metrics)
        ];
    }

    /**
     * Get all departments performance comparison
     */
    public function getDepartmentsComparison(): array
    {
        $departments = Department::getAllCodes();
        $comparison = [];

        foreach ($departments as $deptCode) {
            $metrics = $this->calculateDepartmentMetricsWithRoles($deptCode);
            $workload = $this->getDepartmentWorkload($deptCode);
            
            if (!isset($metrics['error'])) {
                $comparison[] = [
                    'department' => $deptCode,
                    'department_name' => $metrics['department_name'],
                    'compliance_score' => $metrics['overall_compliance_score'],
                    'workload_score' => $workload['workload_score'],
                    'critical_alerts' => $metrics['critical_alerts'],
                    'overdue_items' => $metrics['overdue_alerts'] + $metrics['expired_documents'],
                    'primary_products' => $metrics['primary_owner_products'],
                    'total_accessible_products' => $metrics['total_accessible_products']
                ];
            }
        }

        // Sort by workload score descending (most loaded first)
        usort($comparison, function($a, $b) {
            return $b['workload_score'] <=> $a['workload_score'];
        });

        return $comparison;
    }

    /**
     * Get department collaboration matrix
     */
    public function getDepartmentCollaboration(): array
    {
        $departments = Department::getAllCodes();
        $collaborationMatrix = [];

        foreach ($departments as $primaryDept) {
            $collaborationMatrix[$primaryDept] = [];
            
            foreach ($departments as $secondaryDept) {
                if ($primaryDept !== $secondaryDept) {
                    // Count products where primary dept owns and secondary has access
                    $sharedProducts = Product::where('primary_owner_department', $primaryDept)
                        ->whereJsonContains('secondary_access_departments', $secondaryDept)
                        ->count();
                    
                    // Count documents where primary dept owns and secondary has access
                    $sharedDocuments = Document::where('primary_owner_department', $primaryDept)
                        ->whereJsonContains('secondary_access_departments', $secondaryDept)
                        ->count();
                    
                    $collaborationMatrix[$primaryDept][$secondaryDept] = [
                        'shared_products' => $sharedProducts,
                        'shared_documents' => $sharedDocuments,
                        'collaboration_score' => $sharedProducts + $sharedDocuments
                    ];
                }
            }
        }

        return $collaborationMatrix;
    }

    /**
     * Calculate average response time for alerts
     */
    private function calculateAverageResponseTime(Collection $resolvedAlerts): float
    {
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

    /**
     * Get workload level description
     */
    private function getWorkloadLevel(float $score): string
    {
        if ($score >= 80) return 'Very High';
        if ($score >= 60) return 'High';
        if ($score >= 40) return 'Medium';
        if ($score >= 20) return 'Low';
        return 'Very Low';
    }

    /**
     * Get workload recommendations
     */
    private function getWorkloadRecommendations(float $score, array $metrics): array
    {
        $recommendations = [];

        if ($metrics['critical_alerts'] > 0) {
            $recommendations[] = "Address {$metrics['critical_alerts']} critical alerts immediately";
        }

        if ($metrics['overdue_alerts'] > 0) {
            $recommendations[] = "Resolve {$metrics['overdue_alerts']} overdue alerts";
        }

        if ($metrics['expired_documents'] > 0) {
            $recommendations[] = "Update {$metrics['expired_documents']} expired documents";
        }

        if ($metrics['overall_compliance_score'] < 80) {
            $recommendations[] = "Improve compliance score (currently {$metrics['overall_compliance_score']}%)";
        }

        if ($score >= 80) {
            $recommendations[] = "Consider redistributing workload or requesting additional resources";
        }

        return $recommendations;
    }

    /**
     * Get department statistics for dashboard
     */
    public function getDepartmentDashboardStats(string $departmentCode): array
    {
        $metrics = $this->calculateDepartmentMetricsWithRoles($departmentCode);
        
        if (isset($metrics['error'])) {
            return $metrics;
        }

        $workload = $this->getDepartmentWorkload($departmentCode);

        // Get recent activity
        $recentAlerts = Alert::where('primary_responsible_department', $departmentCode)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $upcomingDeadlines = Document::where('primary_owner_department', $departmentCode)
            ->where('deadline', '>', now())
            ->where('deadline', '<=', now()->addDays(7))
            ->orderBy('deadline')
            ->limit(5)
            ->get();

        return [
            'metrics' => $metrics,
            'workload' => $workload,
            'recent_alerts' => $recentAlerts,
            'upcoming_deadlines' => $upcomingDeadlines
        ];
    }
}