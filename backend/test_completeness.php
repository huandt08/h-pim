<?php

require_once 'vendor/autoload.php';

use App\Services\ProductCompletenessService;
use App\Models\Product;
use Illuminate\Foundation\Application;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "🔍 Testing Product Completeness Service\n";
    echo "=====================================\n";
    
    // Initialize the service
    $completenessService = new ProductCompletenessService();
    
    // Get the first product to test
    $product = Product::first();
    
    if (!$product) {
        echo "❌ No products found in database\n";
        exit(1);
    }
    
    echo "📦 Testing product: " . $product->name . "\n";
    echo "🏢 Department: " . $product->primary_owner_department . "\n";
    echo "📊 Status: " . $product->status . "\n\n";
    
    // Check completeness
    $result = $completenessService->checkProductCompleteness($product);
    
    echo "✅ Completeness check completed!\n";
    echo "📊 Completeness Score: " . $result['completeness_score'] . "%\n";
    echo "📋 Missing Fields: " . count($result['missing_fields']) . "\n";
    
    if (!empty($result['missing_fields'])) {
        echo "🔍 Missing Fields:\n";
        foreach ($result['missing_fields'] as $field) {
            echo "   - " . $field . "\n";
        }
    }
    
    if (!empty($result['validation_errors'])) {
        echo "⚠️  Validation Errors: " . count($result['validation_errors']) . "\n";
        foreach ($result['validation_errors'] as $field => $errors) {
            if (is_array($errors)) {
                foreach ($errors as $error) {
                    echo "   - " . $field . ": " . $error . "\n";
                }
            } else {
                echo "   - " . $field . ": " . $errors . "\n";
            }
        }
    }
    
    echo "\n📈 System Statistics:\n";
    $stats = $completenessService->getCompletenessStatistics();
    echo "   - Total Products: " . $stats['total_products'] . "\n";
    echo "   - Average Score: " . $stats['average_score'] . "%\n";
    echo "   - Completed (≥90%): " . $stats['completed'] . " (" . $stats['completed_percentage'] . "%)\n";
    echo "   - Partial (50-89%): " . $stats['partial'] . " (" . $stats['partial_percentage'] . "%)\n";
    echo "   - Incomplete (<50%): " . $stats['incomplete'] . " (" . $stats['incomplete_percentage'] . "%)\n";
    
    echo "\n✅ Test completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}