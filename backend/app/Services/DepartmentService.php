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
        return Department::withCount([
            'users as users_count' => function($query) {
                $query->where('is_active', true);
            },
            'primaryProducts as products_count',
            'primaryDocuments as documents_count'
        ])
        ->with(['users' => function($query) {
            $query->where('is_active', true)->limit(1);
        }])
        ->get()
        ->map(function($department) {
            // Calculate efficiency score based on various metrics
            $department->efficiency_score = $this->calculateEfficiencyScore($department);
            return $department;
        });
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

        // Users count
        $totalUsers = $department->users()->where('is_active', true)->count();

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
            
            // Users
            'total_users' => $totalUsers,
            
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
        $departments = Department::with('users')->get();
        $departmentCodes = $departments->pluck('code')->toArray();
        $matrixData = [];
        $departmentStats = [];

        // Initialize department statistics
        foreach ($departments as $dept) {
            $departmentStats[$dept->code] = [
                'code' => $dept->code,
                'name' => $dept->name,
                'total_collaborations' => 0,
                'collaboration_score' => 0
            ];
        }

        // Calculate collaboration matrix
        foreach ($departmentCodes as $primaryDept) {
            foreach ($departmentCodes as $secondaryDept) {
                if ($primaryDept !== $secondaryDept) {
                    // Count shared products
                    $sharedProducts = Product::where('primary_owner_department', $primaryDept)
                        ->whereJsonContains('secondary_access_departments', $secondaryDept)
                        ->count();
                    
                    // Count shared documents
                    $sharedDocuments = Document::where('primary_owner_department', $primaryDept)
                        ->whereJsonContains('secondary_access_departments', $secondaryDept)
                        ->count();
                    
                    $collaborationScore = ($sharedProducts * 2) + $sharedDocuments; // Products weigh more
                    
                    if ($collaborationScore > 0) {
                        $matrixData[] = [
                            'department_from' => $primaryDept,
                            'department_to' => $secondaryDept,
                            'shared_products' => $sharedProducts,
                            'shared_documents' => $sharedDocuments,
                            'collaboration_score' => $collaborationScore,
                            'collaboration_level' => $this->getCollaborationLevel($collaborationScore)
                        ];

                        // Update department stats
                        $departmentStats[$primaryDept]['total_collaborations']++;
                        $departmentStats[$primaryDept]['collaboration_score'] += $collaborationScore;
                    }
                }
            }
        }

        // Calculate summary statistics
        $totalCollaborations = count($matrixData);
        $averageScore = $totalCollaborations > 0 
            ? round(collect($matrixData)->avg('collaboration_score'), 2) 
            : 0;

        // Find most and least collaborative departments
        $sortedDepts = collect($departmentStats)->sortByDesc('collaboration_score');
        $mostCollaborative = $sortedDepts->first();
        $leastCollaborative = $sortedDepts->last();

        return [
            'matrix' => $matrixData,
            'summary' => [
                'total_collaborations' => $totalCollaborations,
                'average_collaboration_score' => $averageScore,
                'most_collaborative_dept' => $mostCollaborative['name'] ?? 'N/A',
                'least_collaborative_dept' => $leastCollaborative['name'] ?? 'N/A',
            ],
            'departments' => array_values($departmentStats)
        ];
    }

    /**
     * Get collaboration level based on score
     */
    private function getCollaborationLevel(int $score): string
    {
        if ($score >= 20) return 'excellent';
        if ($score >= 15) return 'good';
        if ($score >= 10) return 'fair';
        if ($score >= 5) return 'poor';
        return 'minimal';
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

    /**
     * Get all departments statistics - aggregate data
     */
    public function getAllDepartmentStats(): array
    {
        $departments = $this->getAllDepartments();
        $departmentStats = [];
        $totalStats = [
            'total_departments' => $departments->count(),
            'total_products' => 0,
            'total_documents' => 0,
            'total_alerts' => 0,
            'total_users' => 0,
            'average_compliance' => 0,
            'critical_alerts' => 0,
            'overdue_alerts' => 0
        ];

        foreach ($departments as $department) {
            $metrics = $this->calculateDepartmentMetricsWithRoles($department->code);
            
            if (isset($metrics['error'])) {
                continue; // Skip departments with errors
            }

            $workload = $this->getDepartmentWorkload($department->code);
            
            if (isset($workload['error'])) {
                continue; // Skip departments with workload errors
            }

            $departmentData = [
                'code' => $department->code,
                'name' => $department->name,
                'metrics' => $metrics,
                'workload' => $workload,
                'performance_level' => $this->getPerformanceLevel($metrics),
                'compliance_status' => $this->getComplianceStatus($metrics['overall_compliance_score']),
                'alert_status' => $this->getAlertStatus($metrics['critical_alerts'], $metrics['overdue_alerts'])
            ];

            $departmentStats[] = $departmentData;

            // Aggregate totals
            $totalStats['total_products'] += $metrics['primary_owner_products'] ?? 0;
            $totalStats['total_documents'] += $metrics['primary_owner_documents'] ?? 0;
            $totalStats['total_alerts'] += $metrics['total_alerts'] ?? 0;
            $totalStats['total_users'] += $metrics['total_users'] ?? 0;
            $totalStats['average_compliance'] += $metrics['overall_compliance_score'] ?? 0;
            $totalStats['critical_alerts'] += $metrics['critical_alerts'] ?? 0;
            $totalStats['overdue_alerts'] += $metrics['overdue_alerts'] ?? 0;
        }

        // Calculate averages
        if ($departments->count() > 0) {
            $totalStats['average_compliance'] = round($totalStats['average_compliance'] / $departments->count(), 2);
        }

        // Sort departments by performance
        usort($departmentStats, function($a, $b) {
            $scoreA = $a['metrics']['overall_compliance_score'];
            $scoreB = $b['metrics']['overall_compliance_score'];
            return $scoreB <=> $scoreA; // Descending order
        });

        return [
            'departments' => $departmentStats,
            'totals' => $totalStats,
            'performance_summary' => $this->getPerformanceSummary($departmentStats),
            'compliance_distribution' => $this->getComplianceDistribution($departmentStats)
        ];
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

    /**
     * Get performance summary
     */
    private function getPerformanceSummary(array $departmentStats): array
    {
        $summary = [
            'excellent' => 0,
            'good' => 0,
            'average' => 0,
            'below_average' => 0,
            'poor' => 0
        ];

        foreach ($departmentStats as $dept) {
            $level = strtolower(str_replace(' ', '_', $dept['performance_level']));
            if (isset($summary[$level])) {
                $summary[$level]++;
            }
        }

        return $summary;
    }

    /**
     * Get compliance distribution
     */
    private function getComplianceDistribution(array $departmentStats): array
    {
        $distribution = [
            'excellent' => 0, // >= 95%
            'good' => 0,      // >= 85%
            'fair' => 0,      // >= 70%
            'poor' => 0,      // >= 50%
            'critical' => 0   // < 50%
        ];

        foreach ($departmentStats as $dept) {
            $compliance = $dept['metrics']['overall_compliance_score'];
            
            if ($compliance >= 95) {
                $distribution['excellent']++;
            } elseif ($compliance >= 85) {
                $distribution['good']++;
            } elseif ($compliance >= 70) {
                $distribution['fair']++;
            } elseif ($compliance >= 50) {
                $distribution['poor']++;
            } else {
                $distribution['critical']++;
            }
        }

        return $distribution;
    }

    /**
     * Calculate efficiency score for a department
     */
    private function calculateEfficiencyScore($department): float
    {
        // Base score
        $score = 70;
        
        // Bonus for having users
        if ($department->users_count > 0) {
            $score += 10;
        }
        
        // Bonus for products
        if ($department->products_count > 0) {
            $score += min(20, $department->products_count * 2);
        }
        
        // Bonus for documents
        if ($department->documents_count > 0) {
            $score += min(10, $department->documents_count);
        }
        
        // Cap at 100
        return min(100, $score);
    }

    /**
     * Get workload analysis for all departments
     */
    public function getWorkloadAnalysis(): array
    {
        $departments = $this->getAllDepartments();
        $workloadData = [];
        $totalWorkload = 0;
        $totalDepartments = $departments->count();

        foreach ($departments as $department) {
            $workload = $this->getDepartmentWorkload($department->code);
            
            if (!isset($workload['error'])) {
                $workloadInfo = [
                    'department' => $department->code,
                    'department_name' => $department->name,
                    'workload_score' => $workload['workload_score'],
                    'workload_level' => $workload['workload_level'],
                    'workload_factors' => $workload['workload_factors'],
                    'recommendations' => $workload['recommendations'],
                    'users_count' => $department->users_count ?? 0,
                    'workload_per_user' => ($department->users_count ?? 0) > 0 
                        ? round($workload['workload_score'] / $department->users_count, 2) 
                        : 0
                ];
                
                $workloadData[] = $workloadInfo;
                $totalWorkload += $workload['workload_score'];
            }
        }

        // Sort by workload score descending
        usort($workloadData, function($a, $b) {
            return $b['workload_score'] <=> $a['workload_score'];
        });

        // Calculate statistics
        $averageWorkload = $totalDepartments > 0 ? round($totalWorkload / $totalDepartments, 2) : 0;
        
        $workloadDistribution = [
            'very_high' => 0, // >= 80
            'high' => 0,      // >= 60
            'medium' => 0,    // >= 40
            'low' => 0,       // >= 20
            'very_low' => 0   // < 20
        ];

        foreach ($workloadData as $dept) {
            $score = $dept['workload_score'];
            if ($score >= 80) $workloadDistribution['very_high']++;
            elseif ($score >= 60) $workloadDistribution['high']++;
            elseif ($score >= 40) $workloadDistribution['medium']++;
            elseif ($score >= 20) $workloadDistribution['low']++;
            else $workloadDistribution['very_low']++;
        }

        // Find most overloaded and underloaded departments
        $mostOverloaded = count($workloadData) > 0 ? $workloadData[0] : null;
        $leastLoaded = count($workloadData) > 0 ? end($workloadData) : null;

        return [
            'departments' => $workloadData,
            'summary' => [
                'total_departments' => $totalDepartments,
                'average_workload' => $averageWorkload,
                'total_workload' => $totalWorkload,
                'workload_distribution' => $workloadDistribution
            ],
            'insights' => [
                'most_overloaded' => $mostOverloaded,
                'least_loaded' => $leastLoaded,
                'balance_recommendations' => $this->getWorkloadBalanceRecommendations($workloadData)
            ]
        ];
    }

    /**
     * Get workload balance recommendations
     */
    private function getWorkloadBalanceRecommendations(array $workloadData): array
    {
        $recommendations = [];
        
        $overloaded = array_filter($workloadData, fn($dept) => $dept['workload_score'] >= 70);
        $underloaded = array_filter($workloadData, fn($dept) => $dept['workload_score'] <= 30);
        
        if (count($overloaded) > 0 && count($underloaded) > 0) {
            $recommendations[] = [
                'type' => 'redistribution',
                'message' => 'Consider redistributing workload from overloaded to underloaded departments',
                'overloaded_depts' => array_column($overloaded, 'department_name'),
                'underloaded_depts' => array_column($underloaded, 'department_name')
            ];
        }
        
        foreach ($workloadData as $dept) {
            if ($dept['workload_score'] >= 80) {
                $recommendations[] = [
                    'type' => 'urgent_attention',
                    'message' => "Department {$dept['department_name']} needs urgent attention due to very high workload",
                    'department' => $dept['department_name'],
                    'workload_score' => $dept['workload_score']
                ];
            }
            
            if ($dept['workload_per_user'] >= 50 && $dept['users_count'] > 0) {
                $recommendations[] = [
                    'type' => 'resource_addition',
                    'message' => "Consider adding more resources to {$dept['department_name']}",
                    'department' => $dept['department_name'],
                    'workload_per_user' => $dept['workload_per_user']
                ];
            }
        }
        
        return $recommendations;
    }
}