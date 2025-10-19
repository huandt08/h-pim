<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "🔍 Testing Product API Endpoints\n";
    echo "================================\n";
    
    // Test product exists
    $productId = '17c448f9-91aa-4e53-870f-f5130810d719';
    $product = \App\Models\Product::find($productId);
    
    if (!$product) {
        echo "❌ Product not found with ID: $productId\n";
        exit(1);
    }
    
    echo "✅ Product found: " . $product->name . "\n";
    echo "🏢 Department: " . $product->primary_owner_department . "\n\n";
    
    // Test documents relationship
    echo "📄 Testing Documents Relationship:\n";
    $documents = $product->documents;
    echo "   Documents count: " . $documents->count() . "\n";
    if ($documents->count() > 0) {
        foreach ($documents->take(3) as $doc) {
            echo "   - " . $doc->title . " (Type: " . $doc->type . ")\n";
        }
    } else {
        echo "   No documents found for this product\n";
    }
    
    echo "\n🚨 Testing Alerts Relationship:\n";
    $alerts = $product->alerts;
    echo "   Alerts count: " . $alerts->count() . "\n";
    if ($alerts->count() > 0) {
        foreach ($alerts->take(3) as $alert) {
            echo "   - " . $alert->title . " (Priority: " . $alert->priority . ")\n";
        }
    } else {
        echo "   No alerts found for this product\n";
    }
    
    echo "\n📦 Testing Batches Relationship:\n";
    if (method_exists($product, 'batches')) {
        $batches = $product->batches;
        echo "   Batches count: " . $batches->count() . "\n";
        if ($batches->count() > 0) {
            foreach ($batches->take(3) as $batch) {
                echo "   - " . $batch->batch_number . " (Status: " . $batch->status . ")\n";
            }
        } else {
            echo "   No batches found for this product\n";
        }
    } else {
        echo "   Batches relationship not defined\n";
    }
    
    echo "\n✅ All relationships tested successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}