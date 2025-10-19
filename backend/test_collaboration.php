<?php

require_once 'bootstrap/app.php';

use App\Services\DepartmentService;

$service = new DepartmentService();

try {
    $result = $service->getDepartmentCollaboration();
    echo "Result structure:\n";
    echo json_encode($result, JSON_PRETTY_PRINT);
    echo "\n\nMatrix count: " . count($result['matrix'] ?? []) . "\n";
    echo "Summary exists: " . (isset($result['summary']) ? 'Yes' : 'No') . "\n";
    echo "Departments count: " . count($result['departments'] ?? []) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}