<?php

require_once 'bootstrap/app.php';

use App\Models\Document;

try {
    echo "=== DOCUMENT STATISTICS ===" . PHP_EOL;
    echo "Total documents: " . Document::count() . PHP_EOL;
    echo PHP_EOL;
    
    echo "By Category:" . PHP_EOL;
    $categories = Document::select('category', \DB::raw('count(*) as count'))
        ->groupBy('category')
        ->orderBy('count', 'desc')
        ->get();
    
    foreach ($categories as $cat) {
        echo "  {$cat->category}: {$cat->count}" . PHP_EOL;
    }
    echo PHP_EOL;
    
    echo "By Type:" . PHP_EOL;
    $types = Document::select('type', \DB::raw('count(*) as count'))
        ->groupBy('type')
        ->get();
    
    foreach ($types as $type) {
        echo "  {$type->type}: {$type->count}" . PHP_EOL;
    }
    echo PHP_EOL;
    
    echo "Special Categories:" . PHP_EOL;
    echo "  Batch-related docs: " . Document::whereNotNull('batch_id')->count() . PHP_EOL;
    echo "  Product-related docs: " . Document::whereNotNull('product_id')->count() . PHP_EOL;
    echo "  General company docs: " . Document::whereNull('batch_id')->whereNull('product_id')->count() . PHP_EOL;
    echo "  Required docs: " . Document::where('is_required', true)->count() . PHP_EOL;
    echo "  Expired docs: " . Document::where('status', 'expired')->count() . PHP_EOL;
    echo PHP_EOL;
    
    echo "Recent batch documents (sample):" . PHP_EOL;
    $batchDocs = Document::with('batch')->whereNotNull('batch_id')->take(5)->get();
    foreach ($batchDocs as $doc) {
        $batchNumber = $doc->batch ? $doc->batch->batch_number : 'N/A';
        echo "  {$doc->name} (Batch: {$batchNumber})" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}