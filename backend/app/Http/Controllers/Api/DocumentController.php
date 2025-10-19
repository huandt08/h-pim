<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Product;
use App\Services\DocumentService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class DocumentController extends Controller
{
    public function __construct(
        private DocumentService $documentService,
        private FileUploadService $fileUploadService
    ) {}

    /**
     * Get documents accessible by user's department
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $filters = $request->only(['category', 'type', 'status', 'required_only', 'search']);
        
        $documents = $this->documentService->getDocumentsByDepartment($departmentCode, $filters);

        return response()->json([
            'success' => true,
            'data' => $documents,
            'meta' => [
                'total' => $documents->count(),
                'department' => $departmentCode,
                'filters' => $filters
            ]
        ]);
    }

    /**
     * Get single document
     */
    public function show(string $id): JsonResponse
    {
        $document = Document::with(['product', 'department', 'versions', 'alerts'])->find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$document->hasAccess($user->department_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $document
        ]);
    }

    /**
     * Create new document
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:text,file,image,video',
            'category' => [
                'required',
                'string',
                Rule::in([
                    'product_info', 'product_images', 'product_certificates',
                    'batch_documents', 'marketing_content', 'ecommerce_content',
                    'communication_content', 'legal_documents', 'warehouse_documents'
                ])
            ],
            'primary_owner_department' => [
                'required',
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'secondary_access_departments' => 'nullable|array',
            'secondary_access_departments.*' => [
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'access_level' => 'nullable|string|in:read,read_comment,read_edit',
            'product_id' => 'nullable|string|exists:products,id',
            'batch_id' => 'nullable|string|exists:batches,id',
            'is_required' => 'nullable|boolean',
            'deadline' => 'nullable|date|after:today',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:10240' // 10MB max
        ]);

        // Check permission to create document in department
        $user = $request->user();
        if ($validated['primary_owner_department'] !== $user->department_code) {
            return response()->json([
                'success' => false,
                'message' => 'Can only create documents for your own department'
            ], 403);
        }

        try {
            $file = $request->file('file');
            $document = $this->documentService->createDocument($validated, $file);

            return response()->json([
                'success' => true,
                'message' => 'Document created successfully',
                'data' => $document
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update document
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Check access permission (primary owner can edit, secondary with read_edit access)
        $user = $request->user();
        if ($document->primary_owner_department !== $user->department_code && 
            !$document->hasAccess($user->department_code, 'edit')) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to edit this document'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:text,file,image,video',
            'category' => [
                'sometimes',
                'string',
                Rule::in([
                    'product_info', 'product_images', 'product_certificates',
                    'batch_documents', 'marketing_content', 'ecommerce_content',
                    'communication_content', 'legal_documents', 'warehouse_documents'
                ])
            ],
            'secondary_access_departments' => 'nullable|array',
            'secondary_access_departments.*' => [
                'string',
                Rule::in(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'])
            ],
            'access_level' => 'nullable|string|in:read,read_comment,read_edit',
            'is_required' => 'nullable|boolean',
            'deadline' => 'nullable|date',
            'status' => 'sometimes|string|in:draft,active,archived',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
            'changes_summary' => 'nullable|string'
        ]);

        try {
            $file = $request->file('file');
            $document = $this->documentService->updateDocument($document, $validated, $file);

            return response()->json([
                'success' => true,
                'message' => 'Document updated successfully',
                'data' => $document
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete document
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Check access permission (only primary owner can delete)
        $user = $request->user();
        if ($document->primary_owner_department !== $user->department_code) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary owner department can delete document'
            ], 403);
        }

        try {
            $this->documentService->deleteDocument($document);

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document'
            ], 500);
        }
    }

    /**
     * Upload new version of document
     */
    public function uploadVersion(Request $request, string $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Check access permission
        $user = $request->user();
        if ($document->primary_owner_department !== $user->department_code && 
            !$document->hasAccess($user->department_code, 'edit')) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to upload new version'
            ], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'changes_summary' => 'required|string|max:500'
        ]);

        try {
            $file = $request->file('file');
            $changesSummary = $request->input('changes_summary');
            
            $version = $this->documentService->createNewVersion($document, $file, $changesSummary);

            return response()->json([
                'success' => true,
                'message' => 'New version uploaded successfully',
                'data' => $version
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload new version: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document versions
     */
    public function versions(string $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$document->hasAccess($user->department_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $versions = $document->versions()->with('creator')->orderBy('version_number', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $versions
        ]);
    }

    /**
     * Check document compliance for product
     */
    public function checkCompliance(Request $request, string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check access permission
        $user = $request->user();
        if (!$product->hasAccess($user->department_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $compliance = $this->documentService->checkDocumentCompliance($product);

        return response()->json([
            'success' => true,
            'data' => $compliance
        ]);
    }

    /**
     * Get document statistics for user's department
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department_code;

        $stats = $this->documentService->getDocumentStatsByDepartment($departmentCode);

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Check document deadlines
     */
    public function checkDeadlines(Request $request): JsonResponse
    {
        $deadlines = $this->documentService->checkDocumentDeadlines();

        return response()->json([
            'success' => true,
            'data' => $deadlines,
            'meta' => [
                'expired_count' => count($deadlines['expired']),
                'expiring_soon_count' => count($deadlines['expiring_soon'])
            ]
        ]);
    }

    /**
     * Get document categories and their requirements
     */
    public function categories(): JsonResponse
    {
        $categories = $this->documentService->getDocumentCategories();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Download document file
     */
    public function download(string $id): JsonResponse
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }

        // Check access permission
        $user = request()->user();
        if (!$document->hasAccess($user->department_code)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        if (!$document->file_path) {
            return response()->json([
                'success' => false,
                'message' => 'No file attached to this document'
            ], 404);
        }

        $fileInfo = $this->fileUploadService->getFileInfo($document->file_path);

        if (!$fileInfo || !$fileInfo['exists']) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => $fileInfo['url'],
                'filename' => $document->name,
                'file_size' => $document->getHumanFileSize(),
                'mime_type' => $document->mime_type
            ]
        ]);
    }
}