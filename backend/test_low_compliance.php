<?php

require_once 'vendor/autoload.php';

use App\Services\ProductCompletenessService;
use App\Models\Product;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "🔍 Testing Low Compliance Products\n";
    echo "=================================\n";
    
    $completenessService = new ProductCompletenessService();
    
    // Get products with low compliance (less than 90%)
    $lowComplianceProducts = $completenessService->getLowComplianceProducts(90);
    
    echo "📊 Products with less than 90% completeness:\n";
    foreach ($lowComplianceProducts as $product) {
        echo "   - " . $product->name . ": " . $product->completeness_score . "%\n";
    }
    
    echo "\n📊 Products with less than 70% completeness:\n";
    $veryLowComplianceProducts = $completenessService->getLowComplianceProducts(70);
    foreach ($veryLowComplianceProducts as $product) {
        echo "   - " . $product->name . ": " . $product->completeness_score . "%\n";
    }
    
    if ($veryLowComplianceProducts->isEmpty()) {
        echo "   ✅ No products with less than 70% completeness found!\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}