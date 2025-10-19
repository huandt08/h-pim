<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Alert;
use Carbon\Carbon;

class ProductCompletenessService
{
    /**
     * Cấu hình validation rules theo yêu cầu hệ thống
     */
    private array $validationConfig = [
        'basic_info' => [
            'name' => [
                'required' => true,
                'check_after_hours' => 0,
                'reminder_intervals' => [0, 1, 2],
                'validation_rules' => ['not_empty', 'min_length:2'],
                'weight' => 15
            ],
            'brand' => [
                'required' => true,
                'check_after_hours' => 0,
                'reminder_intervals' => [0, 1, 2],
                'validation_rules' => ['not_empty', 'min_length:2'],
                'weight' => 10
            ],
            'description' => [
                'required' => true,
                'check_after_hours' => 0,
                'reminder_intervals' => [0, 1, 2],
                'validation_rules' => ['not_empty', 'min_length:10'],
                'weight' => 15
            ],
            'detailed_description' => [
                'required' => true,
                'check_after_hours' => 2,
                'reminder_intervals' => [2, 4, 8],
                'validation_rules' => ['not_empty', 'min_length:20'],
                'weight' => 15
            ],
            'specifications' => [
                'required' => true,
                'check_after_hours' => 4,
                'reminder_intervals' => [4, 8, 12],
                'validation_rules' => ['not_empty', 'contains_unit'],
                'weight' => 10
            ],
            'ingredients' => [
                'required' => true,
                'check_after_hours' => 6,
                'reminder_intervals' => [6, 12, 18],
                'validation_rules' => ['not_empty', 'min_length:15'],
                'weight' => 10
            ],
            'usage' => [
                'required' => true,
                'check_after_hours' => 8,
                'reminder_intervals' => [8, 16, 24],
                'validation_rules' => ['not_empty', 'min_length:20'],
                'weight' => 10
            ],
            'instructions' => [
                'required' => true,
                'check_after_hours' => 12,
                'reminder_intervals' => [12, 24, 36],
                'validation_rules' => ['not_empty', 'contains_steps'],
                'weight' => 5
            ],
            'storage' => [
                'required' => true,
                'check_after_hours' => 12,
                'reminder_intervals' => [12, 24, 36],
                'validation_rules' => ['not_empty', 'contains_conditions'],
                'weight' => 5
            ]
        ],
        'extended_info' => [
            'development_reason' => [
                'required' => true,
                'check_after_hours' => 24,
                'reminder_intervals' => [24, 48, 72],
                'validation_rules' => ['not_empty', 'min_length:50'],
                'weight' => 3
            ],
            'similar_products' => [
                'required' => true,
                'check_after_hours' => 48,
                'reminder_intervals' => [48, 96, 144],
                'validation_rules' => ['not_empty', 'has_comparison'],
                'weight' => 3
            ],
            'usp' => [
                'required' => true,
                'check_after_hours' => 72,
                'reminder_intervals' => [72, 144, 216],
                'validation_rules' => ['not_empty', 'min_length:30', 'has_unique_points'],
                'weight' => 4
            ]
        ]
    ];

    /**
     * Kiểm tra completeness của sản phẩm
     */
    public function checkProductCompleteness(Product $product): array
    {
        $hoursFromCreation = Carbon::now()->diffInHours($product->created_at);
        $allFields = array_merge($this->validationConfig['basic_info'], $this->validationConfig['extended_info']);
        
        $completionStatus = [];
        $missingFields = [];
        $validationErrors = [];
        $totalWeight = 0;
        $completedWeight = 0;

        foreach ($allFields as $fieldName => $config) {
            $totalWeight += $config['weight'];
            
            $fieldValue = $product->{$fieldName} ?? '';
            $isRequired = $config['required'];
            $checkAfterHours = $config['check_after_hours'];
            $shouldCheck = $hoursFromCreation >= $checkAfterHours;
            
            // Validate field
            $fieldErrors = $this->validateField($fieldName, $fieldValue, $config['validation_rules']);
            $isCompleted = empty($fieldErrors);
            
            if ($isCompleted) {
                $completedWeight += $config['weight'];
            }

            $completionStatus[$fieldName] = [
                'completed' => $isCompleted,
                'required' => $isRequired,
                'should_check' => $shouldCheck,
                'deadline_passed' => $shouldCheck && !$isCompleted,
                'hours_from_creation' => $hoursFromCreation,
                'check_after_hours' => $checkAfterHours,
                'weight' => $config['weight'],
                'errors' => $fieldErrors
            ];

            // Collect missing fields
            if ($shouldCheck && !$isCompleted) {
                $missingFields[] = [
                    'field' => $fieldName,
                    'field_label' => $this->getFieldLabel($fieldName),
                    'hours_overdue' => $hoursFromCreation - $checkAfterHours,
                    'errors' => $fieldErrors
                ];
            }

            // Collect validation errors
            if (!empty($fieldErrors)) {
                $validationErrors[$fieldName] = $fieldErrors;
            }
        }

        $completenessScore = $totalWeight > 0 ? round(($completedWeight / $totalWeight) * 100, 2) : 0;

        // Update product with completeness data
        $product->update([
            'completeness_score' => $completenessScore,
            'missing_fields' => $missingFields,
            'validation_errors' => $validationErrors,
            'last_completeness_check' => now(),
            'field_completion_status' => $completionStatus
        ]);

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'completeness_score' => $completenessScore,
            'total_weight' => $totalWeight,
            'completed_weight' => $completedWeight,
            'missing_fields_count' => count($missingFields),
            'missing_fields' => $missingFields,
            'validation_errors' => $validationErrors,
            'field_completion_status' => $completionStatus,
            'hours_from_creation' => $hoursFromCreation,
            'last_checked' => now()
        ];
    }

    /**
     * Validate individual field
     */
    private function validateField(string $fieldName, $value, array $rules): array
    {
        $errors = [];
        $stringValue = trim((string)$value);

        foreach ($rules as $rule) {
            switch ($rule) {
                case 'not_empty':
                    if (empty($stringValue)) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} không được để trống";
                    }
                    break;

                case str_starts_with($rule, 'min_length:'):
                    $minLength = (int)explode(':', $rule)[1];
                    if (strlen($stringValue) < $minLength) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} phải có tối thiểu {$minLength} ký tự";
                    }
                    break;

                case 'contains_unit':
                    $units = ['ml', 'g', 'kg', 'l', 'mg', 'gam', 'lít', 'viên', 'gói', 'hộp', 'tube', 'chai'];
                    if (!$this->containsAny(strtolower($stringValue), $units)) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} phải có đơn vị đo (ml, g, kg, etc.)";
                    }
                    break;

                case 'contains_steps':
                    $stepIndicators = ['bước', 'step', '1.', '2.', '3.', 'đầu tiên', 'sau đó', 'cuối cùng', 'thứ nhất', 'thứ hai'];
                    if (!$this->containsAny(strtolower($stringValue), $stepIndicators)) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} phải có các bước hướng dẫn rõ ràng";
                    }
                    break;

                case 'contains_conditions':
                    $conditions = ['nhiệt độ', 'độ ẩm', 'tránh', 'nơi', '°c', 'khô', 'ẩm', 'mát', 'thoáng', 'ánh sáng'];
                    if (!$this->containsAny(strtolower($stringValue), $conditions)) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} phải có điều kiện bảo quản cụ thể";
                    }
                    break;

                case 'has_comparison':
                    $comparisonWords = ['so với', 'khác với', 'tương tự', 'giá', 'chất lượng', 'brand', 'sản phẩm khác'];
                    if (!$this->containsAny(strtolower($stringValue), $comparisonWords)) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} phải có so sánh với sản phẩm khác";
                    }
                    break;

                case 'has_unique_points':
                    $uniqueWords = ['độc quyền', 'duy nhất', 'khác biệt', 'đặc biệt', 'ưu điểm', 'nổi trội', 'vượt trội'];
                    if (!$this->containsAny(strtolower($stringValue), $uniqueWords)) {
                        $errors[] = "{$this->getFieldLabel($fieldName)} phải có điểm khác biệt/ưu điểm độc đáo";
                    }
                    break;
            }
        }

        return $errors;
    }

    /**
     * Check if string contains any of the given substrings
     */
    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get human-readable field label
     */
    private function getFieldLabel(string $fieldName): string
    {
        $labels = [
            'name' => 'Tên sản phẩm',
            'brand' => 'Thương hiệu',
            'description' => 'Mô tả sản phẩm',
            'detailed_description' => 'Thông tin chi tiết',
            'specifications' => 'Quy cách',
            'ingredients' => 'Thành phần',
            'usage' => 'Công dụng',
            'instructions' => 'Hướng dẫn sử dụng',
            'storage' => 'Bảo quản',
            'development_reason' => 'Lý do phát triển & Xu hướng thị trường',
            'similar_products' => 'Sản phẩm tương tự',
            'usp' => 'Ưu điểm cạnh tranh/USP'
        ];

        return $labels[$fieldName] ?? $fieldName;
    }

    /**
     * Get products with low completeness score
     */
    public function getLowComplianceProducts(float $threshold = 80): \Illuminate\Database\Eloquent\Collection
    {
        return Product::where('completeness_score', '<', $threshold)
            ->orderBy('completeness_score', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Generate alerts for incomplete products
     */
    public function generateCompletenessAlerts(Product $product): void
    {
        $completenessData = $this->checkProductCompleteness($product);
        $missingFields = $completenessData['missing_fields'];

        if (empty($missingFields)) {
            return;
        }

        // Group missing fields by priority (hours overdue)
        $criticalFields = [];
        $warningFields = [];

        foreach ($missingFields as $fieldData) {
            if ($fieldData['hours_overdue'] > 12) {
                $criticalFields[] = $fieldData;
            } elseif ($fieldData['hours_overdue'] > 0) {
                $warningFields[] = $fieldData;
            }
        }

        // Create critical alert for overdue fields
        if (!empty($criticalFields)) {
            $this->createCompletenessAlert($product, $criticalFields, 'critical');
        }

        // Create warning alert for due fields
        if (!empty($warningFields)) {
            $this->createCompletenessAlert($product, $warningFields, 'high');
        }
    }

    /**
     * Create completeness alert
     */
    private function createCompletenessAlert(Product $product, array $fields, string $priority): void
    {
        $fieldNames = collect($fields)->pluck('field_label')->implode(', ');
        $maxOverdue = collect($fields)->max('hours_overdue');

        $title = "Thông tin sản phẩm chưa hoàn thiện - {$product->name}";
        $message = "Các trường sau cần được cập nhật: {$fieldNames}";
        
        if ($maxOverdue > 0) {
            $message .= " (Quá hạn tối đa: {$maxOverdue} giờ)";
        }

        Alert::create([
            'type' => 'product_completeness',
            'priority' => $priority,
            'title' => $title,
            'message' => $message,
            'primary_responsible_department' => $product->primary_owner_department,
            'secondary_involved_departments' => $product->secondary_access_departments,
            'product_id' => $product->id,
            'due_date' => now()->addHours(6), // 6 hours to fix
            'metadata' => [
                'missing_fields' => $fields,
                'completeness_score' => $product->completeness_score,
                'hours_from_creation' => Carbon::now()->diffInHours($product->created_at)
            ]
        ]);
    }

    /**
     * Batch check completeness for all products
     */
    public function batchCheckCompleteness(?array $productIds = null): array
    {
        $query = Product::query();
        
        if ($productIds) {
            $query->whereIn('id', $productIds);
        }

        $products = $query->get();
        $results = [];

        foreach ($products as $product) {
            try {
                $result = $this->checkProductCompleteness($product);
                $results[] = $result;

                // Generate alerts if needed
                if ($result['completeness_score'] < 90) {
                    $this->generateCompletenessAlerts($product);
                }
            } catch (\Exception $e) {
                $results[] = [
                    'product_id' => $product->id,
                    'error' => $e->getMessage()
                ];
            }
        }

        return $results;
    }

    /**
     * Get completeness statistics
     */
    public function getCompletenessStatistics(): array
    {
        $products = Product::all();
        $total = $products->count();

        $completed = $products->where('completeness_score', '>=', 90)->count();
        $partial = $products->whereBetween('completeness_score', [50, 89.99])->count();
        $incomplete = $products->where('completeness_score', '<', 50)->count();

        $avgScore = $products->avg('completeness_score') ?? 0;

        return [
            'total_products' => $total,
            'completed' => $completed,
            'completed_percentage' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            'partial' => $partial,
            'partial_percentage' => $total > 0 ? round(($partial / $total) * 100, 2) : 0,
            'incomplete' => $incomplete,
            'incomplete_percentage' => $total > 0 ? round(($incomplete / $total) * 100, 2) : 0,
            'average_score' => round($avgScore, 2)
        ];
    }
}