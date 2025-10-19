<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "🔍 Testing Product API Response Format\n";
    echo "====================================\n";
    
    $productId = '17c448f9-91aa-4e53-870f-f5130810d719';
    $product = \App\Models\Product::find($productId);
    
    if (!$product) {
        echo "❌ Product not found\n";
        exit(1);
    }
    
    echo "✅ Product found\n";
    echo "📋 Product fields:\n";
    echo "   ID: " . $product->id . "\n";
    echo "   Name: " . ($product->name ?? 'NULL') . "\n";
    echo "   Code: " . ($product->code ?? 'NULL') . "\n";
    echo "   Brand: " . ($product->brand ?? 'NULL') . "\n";
    echo "   Status: " . ($product->status ?? 'NULL') . "\n";
    echo "   Department: " . ($product->primary_owner_department ?? 'NULL') . "\n";
    echo "   Compliance: " . ($product->compliance_percentage ?? 'NULL') . "\n";
    echo "   Created: " . ($product->created_at ?? 'NULL') . "\n";
    echo "   Updated: " . ($product->updated_at ?? 'NULL') . "\n";
    
    echo "\n📄 JSON representation:\n";
    $productArray = $product->toArray();
    echo json_encode($productArray, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}