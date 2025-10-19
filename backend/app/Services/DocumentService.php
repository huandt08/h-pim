<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Product;
use App\Models\Alert;
use App\Models\DocumentVersion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    /**
     * Get documents accessible by department
     */
    public function getDocumentsByDepartment(string $departmentCode, array $filters = []): Collection
    {
        $query = Document::accessibleBy($departmentCode);

        // Apply filters
        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['required_only'])) {
            $query->required();
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->with(['product', 'department', 'versions', 'alerts'])->get();
    }

    /**
     * Create new document
     */
    public function createDocument(array $data, ?UploadedFile $file = null): Document
    {
        // Generate UUID if not provided
        if (!isset($data['id'])) {
            $data['id'] = Str::uuid();
        }

        // Handle file upload
        if ($file) {
            $fileData = $this->handleFileUpload($file, $data);
            $data = array_merge($data, $fileData);
        }

        // Set default version
        if (!isset($data['version'])) {
            $data['version'] = 1;
        }

        // Create document
        $document = Document::create($data);

        // Create initial version if file was uploaded
        if ($file) {
            $document->createVersion([
                'file_path' => $data['file_path'],
                'file_size' => $data['file_size'],
                'mime_type' => $data['mime_type'],
                'changes_summary' => 'Initial version',
                'created_by' => auth()->id()
            ]);
        }

        return $document->load(['product', 'department', 'versions']);
    }

    /**
     * Update document
     */
    public function updateDocument(Document $document, array $data, ?UploadedFile $file = null): Document
    {
        // Handle file upload for new version
        if ($file) {
            $this->createNewVersion($document, $file, $data['changes_summary'] ?? 'Document updated');
        }

        // Update document metadata
        $document->update($data);

        return $document->load(['product', 'department', 'versions']);
    }

    /**
     * Create new version of document
     */
    public function createNewVersion(Document $document, UploadedFile $file, string $changesSummary = null): DocumentVersion
    {
        $fileData = $this->handleFileUpload($file, [
            'primary_owner_department' => $document->primary_owner_department,
            'product_code' => $document->product->code ?? 'general'
        ]);

        // Update document with new file info
        $document->update([
            'file_path' => $fileData['file_path'],
            'file_size' => $fileData['file_size'],
            'mime_type' => $fileData['mime_type'],
            'version' => $document->version + 1
        ]);

        // Create version record
        return $document->createVersion([
            'file_path' => $fileData['file_path'],
            'file_size' => $fileData['file_size'],
            'mime_type' => $fileData['mime_type'],
            'changes_summary' => $changesSummary,
            'created_by' => auth()->id()
        ]);
    }

    /**
     * Delete document (soft delete)
     */
    public function deleteDocument(Document $document): bool
    {
        return $document->delete();
    }

    /**
     * Check document compliance for product
     */
    public function checkDocumentCompliance(Product $product): array
    {
        $requiredDocuments = $this->getRequiredDocuments($product);
        $existingDocuments = $product->documents()->where('is_required', true)->get();

        $compliance = [];
        $missingDocuments = [];
        $expiredDocuments = [];
        $expiringSoonDocuments = [];

        foreach ($requiredDocuments as $reqDoc) {
            $existing = $existingDocuments->where('category', $reqDoc['category'])->first();
            
            if (!$existing) {
                $missingDocuments[] = $reqDoc;
                $compliance[$reqDoc['category']] = [
                    'status' => 'missing',
                    'required' => true,
                    'deadline' => $reqDoc['deadline']
                ];
            } else {
                $status = 'complete';
                
                if ($existing->isOverdue()) {
                    $status = 'expired';
                    $expiredDocuments[] = $existing;
                } elseif ($existing->isApproachingDeadline()) {
                    $status = 'expiring_soon';
                    $expiringSoonDocuments[] = $existing;
                }

                $compliance[$reqDoc['category']] = [
                    'status' => $status,
                    'document' => $existing,
                    'deadline' => $existing->deadline
                ];
            }
        }

        $compliancePercentage = $this->calculateCompliancePercentage($requiredDocuments, $existingDocuments);

        return [
            'product_id' => $product->id,
            'product_code' => $product->code,
            'required_count' => count($requiredDocuments),
            'completed_count' => $existingDocuments->count(),
            'missing_count' => count($missingDocuments),
            'expired_count' => count($expiredDocuments),
            'expiring_soon_count' => count($expiringSoonDocuments),
            'compliance_percentage' => $compliancePercentage,
            'compliance_details' => $compliance,
            'missing_documents' => $missingDocuments,
            'expired_documents' => $expiredDocuments,
            'expiring_soon_documents' => $expiringSoonDocuments
        ];
    }

    /**
     * Get required documents for product based on department and type
     */
    public function getRequiredDocuments(Product $product): array
    {
        $requiredDocs = [];
        $department = $product->primary_owner_department;

        // Define required documents by department and product type
        $documentRequirements = [
            'RND' => [
                ['category' => 'product_info', 'name' => 'Product Information', 'deadline_days' => 0],
                ['category' => 'product_images', 'name' => 'Product Images/Videos', 'deadline_days' => 1],
                ['category' => 'product_certificates', 'name' => 'Product Certificates', 'deadline_days' => 30],
            ],
            'PUR' => [
                ['category' => 'batch_documents', 'name' => 'Batch Documents', 'deadline_days' => 7],
                ['category' => 'supplier_documents', 'name' => 'Supplier Documents', 'deadline_days' => 14],
            ],
            'MKT' => [
                ['category' => 'marketing_content', 'name' => 'Marketing Content', 'deadline_days' => 3],
            ],
            'ECOM' => [
                ['category' => 'ecommerce_content', 'name' => 'E-commerce Content', 'deadline_days' => 2],
            ],
            'LEG' => [
                ['category' => 'legal_documents', 'name' => 'Legal Documents', 'deadline_days' => 60],
            ],
            'WH' => [
                ['category' => 'warehouse_documents', 'name' => 'Warehouse Documents', 'deadline_days' => 7],
            ],
            'COM' => [
                ['category' => 'communication_content', 'name' => 'Communication Content', 'deadline_days' => 3],
            ]
        ];

        if (isset($documentRequirements[$department])) {
            foreach ($documentRequirements[$department] as $req) {
                $deadline = now()->addDays($req['deadline_days']);
                $requiredDocs[] = array_merge($req, [
                    'deadline' => $deadline,
                    'product_id' => $product->id
                ]);
            }
        }

        return $requiredDocs;
    }

    /**
     * Calculate compliance percentage
     */
    public function calculateCompliancePercentage(array $requiredDocuments, Collection $existingDocuments): float
    {
        if (empty($requiredDocuments)) {
            return 100.0;
        }

        $completedCount = 0;
        foreach ($requiredDocuments as $reqDoc) {
            $existing = $existingDocuments->where('category', $reqDoc['category'])->first();
            if ($existing && !$existing->isOverdue()) {
                $completedCount++;
            }
        }

        return round(($completedCount / count($requiredDocuments)) * 100, 2);
    }

    /**
     * Check for expired and expiring documents
     */
    public function checkDocumentDeadlines(): array
    {
        $expiredDocuments = Document::expired()->with(['product', 'department'])->get();
        $expiringSoonDocuments = Document::approachingDeadline(7)->with(['product', 'department'])->get();

        $results = [
            'expired' => [],
            'expiring_soon' => []
        ];

        // Process expired documents
        foreach ($expiredDocuments as $doc) {
            $results['expired'][] = [
                'document' => $doc,
                'days_overdue' => now()->diffInDays($doc->deadline)
            ];

            // Create alert if not exists
            $this->createDocumentExpiryAlert($doc);
        }

        // Process expiring soon documents
        foreach ($expiringSoonDocuments as $doc) {
            $results['expiring_soon'][] = [
                'document' => $doc,
                'days_until_expiry' => $doc->deadline->diffInDays(now())
            ];

            // Create alert if not exists
            $this->createDocumentExpiryAlert($doc);
        }

        return $results;
    }

    /**
     * Get document statistics by department
     */
    public function getDocumentStatsByDepartment(string $departmentCode): array
    {
        $primaryDocuments = Document::where('primary_owner_department', $departmentCode);
        $secondaryDocuments = Document::whereJsonContains('secondary_access_departments', $departmentCode);

        return [
            'department' => $departmentCode,
            'primary_documents' => $primaryDocuments->count(),
            'secondary_documents' => $secondaryDocuments->count(),
            'total_accessible' => $primaryDocuments->count() + $secondaryDocuments->count(),
            'required_documents' => $primaryDocuments->copy()->required()->count(),
            'expired_documents' => $primaryDocuments->copy()->expired()->count(),
            'expiring_soon' => $primaryDocuments->copy()->approachingDeadline(30)->count(),
            'by_category' => $primaryDocuments->copy()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray(),
            'by_type' => $primaryDocuments->copy()
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray()
        ];
    }

    /**
     * Handle file upload
     */
    private function handleFileUpload(UploadedFile $file, array $context): array
    {
        $department = $context['primary_owner_department'] ?? 'general';
        $productCode = $context['product_code'] ?? 'general';
        
        $filename = Str::uuid() . '_' . $file->getClientOriginalName();
        $path = "documents/{$department}/{$productCode}/{$filename}";
        
        // Store file
        Storage::disk('public')->putFileAs(
            dirname($path),
            $file,
            basename($path)
        );

        return [
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType()
        ];
    }

    /**
     * Create document expiry alert
     */
    private function createDocumentExpiryAlert(Document $document): void
    {
        // Check if alert already exists
        $existingAlert = Alert::where('document_id', $document->id)
            ->where('type', 'document_expiry')
            ->where('status', 'open')
            ->first();

        if (!$existingAlert) {
            Alert::createDocumentExpiryAlert($document);
        }
    }

    /**
     * Get document categories and their requirements
     */
    public function getDocumentCategories(): array
    {
        return [
            'product_info' => [
                'name' => 'Product Information',
                'description' => 'Basic product information and specifications',
                'primary_owner' => 'RND',
                'secondary_access' => ['MKT', 'ECOM'],
                'required' => true,
                'deadline_days' => 0
            ],
            'product_images' => [
                'name' => 'Product Images/Videos',
                'description' => 'Visual content for products',
                'primary_owner' => 'RND',
                'secondary_access' => ['MKT', 'ECOM', 'COM'],
                'required' => true,
                'deadline_days' => 1
            ],
            'product_certificates' => [
                'name' => 'Product Certificates',
                'description' => 'Regulatory and quality certificates',
                'primary_owner' => 'RND',
                'secondary_access' => ['LEG'],
                'required' => false,
                'deadline_days' => 30
            ],
            'batch_documents' => [
                'name' => 'Batch Documents',
                'description' => 'Manufacturing batch documentation',
                'primary_owner' => 'PUR',
                'secondary_access' => ['WH', 'LEG'],
                'required' => true,
                'deadline_days' => 7
            ],
            'marketing_content' => [
                'name' => 'Marketing Content',
                'description' => 'Marketing materials and campaigns',
                'primary_owner' => 'MKT',
                'secondary_access' => ['ECOM', 'COM'],
                'required' => true,
                'deadline_days' => 3
            ],
            'ecommerce_content' => [
                'name' => 'E-commerce Content',
                'description' => 'Online store product content',
                'primary_owner' => 'ECOM',
                'secondary_access' => ['MKT'],
                'required' => true,
                'deadline_days' => 2
            ],
            'communication_content' => [
                'name' => 'Communication Content',
                'description' => 'PR and communication materials',
                'primary_owner' => 'COM',
                'secondary_access' => ['MKT'],
                'required' => false,
                'deadline_days' => 3
            ],
            'legal_documents' => [
                'name' => 'Legal Documents',
                'description' => 'Legal compliance and contracts',
                'primary_owner' => 'LEG',
                'secondary_access' => ['RND', 'PUR'],
                'required' => false,
                'deadline_days' => 60
            ],
            'warehouse_documents' => [
                'name' => 'Warehouse Documents',
                'description' => 'Storage and logistics documentation',
                'primary_owner' => 'WH',
                'secondary_access' => ['PUR'],
                'required' => true,
                'deadline_days' => 7
            ]
        ];
    }
}