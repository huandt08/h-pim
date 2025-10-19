<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ProductCompletenessService;
use App\Models\Product;

class CheckProductCompleteness extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pim:check-completeness 
                            {--product-id= : Check specific product by ID} 
                            {--department= : Check products by department}
                            {--batch-size=50 : Number of products to process in each batch}
                            {--generate-alerts : Generate alerts for incomplete products}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kiểm tra completeness thông tin sản phẩm và tạo cảnh báo';

    /**
     * Execute the console command.
     */
    public function handle(ProductCompletenessService $completenessService)
    {
        $this->info('🔍 Bắt đầu kiểm tra completeness thông tin sản phẩm...');
        
        $productId = $this->option('product-id');
        $department = $this->option('department');
        $batchSize = (int)$this->option('batch-size');
        $generateAlerts = $this->option('generate-alerts');

        if ($productId) {
            $this->checkSingleProduct($productId, $completenessService, $generateAlerts);
        } else {
            $this->checkMultipleProducts($department, $batchSize, $completenessService, $generateAlerts);
        }

        $this->displayStatistics($completenessService);
        $this->info('✅ Hoàn thành kiểm tra completeness!');
    }

    /**
     * Check single product completeness
     */
    private function checkSingleProduct(string $productId, ProductCompletenessService $service, bool $generateAlerts): void
    {
        $product = Product::find($productId);
        
        if (!$product) {
            $this->error("❌ Không tìm thấy sản phẩm với ID: {$productId}");
            return;
        }

        $this->info("🔍 Kiểm tra sản phẩm: {$product->name} (ID: {$product->id})");
        
        $result = $service->checkProductCompleteness($product);
        
        $this->displayProductResult($result);

        if ($generateAlerts && $result['completeness_score'] < 90) {
            $service->generateCompletenessAlerts($product);
            $this->info("📢 Đã tạo cảnh báo cho sản phẩm {$product->name}");
        }
    }

    /**
     * Check multiple products completeness
     */
    private function checkMultipleProducts(?string $department, int $batchSize, ProductCompletenessService $service, bool $generateAlerts): void
    {
        $query = Product::query();
        
        if ($department) {
            $query->where('primary_owner_department', $department);
            $this->info("🏢 Kiểm tra sản phẩm của phòng ban: {$department}");
        }

        $totalProducts = $query->count();
        $this->info("📊 Tổng số sản phẩm cần kiểm tra: {$totalProducts}");

        $processed = 0;
        $progressBar = $this->output->createProgressBar($totalProducts);
        $progressBar->start();

        $results = [];
        
        $query->chunk($batchSize, function ($products) use ($service, $generateAlerts, &$processed, $progressBar, &$results) {
            foreach ($products as $product) {
                try {
                    $result = $service->checkProductCompleteness($product);
                    $results[] = $result;

                    if ($generateAlerts && $result['completeness_score'] < 90) {
                        $service->generateCompletenessAlerts($product);
                    }

                    $processed++;
                    $progressBar->advance();
                } catch (\Exception $e) {
                    $this->error("❌ Lỗi khi kiểm tra sản phẩm {$product->id}: " . $e->getMessage());
                }
            }
        });

        $progressBar->finish();
        $this->newLine(2);

        // Display summary
        $this->displayBatchResults($results, $processed);
    }

    /**
     * Display single product result
     */
    private function displayProductResult(array $result): void
    {
        $score = $result['completeness_score'];
        $scoreColor = $this->getScoreColor($score);
        
        $this->line("📋 Kết quả kiểm tra:");
        $this->line("  • Điểm completeness: <{$scoreColor}>{$score}%</>");
        $this->line("  • Trọng số hoàn thành: {$result['completed_weight']}/{$result['total_weight']}");
        $this->line("  • Số trường thiếu: {$result['missing_fields_count']}");

        if (!empty($result['missing_fields'])) {
            $this->warn("⚠️  Các trường cần cập nhật:");
            foreach ($result['missing_fields'] as $field) {
                $overdueText = $field['hours_overdue'] > 0 ? " (Quá hạn {$field['hours_overdue']} giờ)" : "";
                $this->line("  • {$field['field_label']}{$overdueText}");
            }
        }
    }

    /**
     * Display batch results summary
     */
    private function displayBatchResults(array $results, int $processed): void
    {
        $this->info("📊 Tổng kết kiểm tra:");
        $this->line("  • Đã xử lý: {$processed} sản phẩm");
        
        $scores = collect($results)->pluck('completeness_score');
        $avgScore = $scores->avg();
        
        $excellent = $scores->filter(fn($s) => $s >= 90)->count();
        $good = $scores->filter(fn($s) => $s >= 70 && $s < 90)->count();
        $poor = $scores->filter(fn($s) => $s < 70)->count();

        $this->line("  • Điểm trung bình: " . round($avgScore, 2) . "%");
        $this->line("  • Xuất sắc (≥90%): <fg=green>{$excellent}</>");
        $this->line("  • Tốt (70-89%): <fg=yellow>{$good}</>");
        $this->line("  • Cần cải thiện (<70%): <fg=red>{$poor}</>");
    }

    /**
     * Display overall statistics
     */
    private function displayStatistics(ProductCompletenessService $service): void
    {
        $stats = $service->getCompletenessStatistics();
        
        $this->newLine();
        $this->info("📈 Thống kê tổng thể hệ thống:");
        $this->line("  • Tổng sản phẩm: {$stats['total_products']}");
        $this->line("  • Hoàn thiện (≥90%): <fg=green>{$stats['completed']} ({$stats['completed_percentage']}%)</>");
        $this->line("  • Một phần (50-89%): <fg=yellow>{$stats['partial']} ({$stats['partial_percentage']}%)</>");
        $this->line("  • Chưa hoàn thiện (<50%): <fg=red>{$stats['incomplete']} ({$stats['incomplete_percentage']}%)</>");
        $this->line("  • Điểm trung bình: {$stats['average_score']}%");
    }

    /**
     * Get color based on completeness score
     */
    private function getScoreColor(float $score): string
    {
        if ($score >= 90) return 'fg=green';
        if ($score >= 70) return 'fg=yellow';
        return 'fg=red';
    }
}
