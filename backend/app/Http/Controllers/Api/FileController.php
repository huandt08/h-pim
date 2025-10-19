<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FileController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Upload file for document
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:102400', // 100MB max
            'document_id' => 'required|uuid|exists:documents,id',
            'document_type' => 'required|string|in:specification,requirement,approval,certificate,test_report,quality_control,other',
            'version' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $documentId = $request->input('document_id');
            $documentType = $request->input('document_type');
            
            $uploadResult = $this->fileUploadService->uploadDocument(
                $file,
                $documentId,
                $documentType,
                $request->input('version'),
                $request->input('notes')
            );

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => $uploadResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload product image
     */
    public function uploadProductImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            'product_id' => 'required|uuid|exists:products,id',
            'image_type' => 'required|string|in:main,gallery,technical,packaging',
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $productId = $request->input('product_id');
            $imageType = $request->input('image_type');
            
            $uploadResult = $this->fileUploadService->uploadProductImage(
                $file,
                $productId,
                $imageType,
                $request->input('alt_text'),
                $request->boolean('is_primary')
            );

            return response()->json([
                'success' => true,
                'message' => 'Product image uploaded successfully',
                'data' => $uploadResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload product image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload batch file
     */
    public function uploadBatchFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:51200', // 50MB max
            'batch_id' => 'required|uuid|exists:batches,id',
            'file_type' => 'required|string|in:production_record,quality_test,certificate,inspection_report,other',
            'description' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $batchId = $request->input('batch_id');
            $fileType = $request->input('file_type');
            
            $uploadResult = $this->fileUploadService->uploadBatchFile(
                $file,
                $batchId,
                $fileType,
                $request->input('description')
            );

            return response()->json([
                'success' => true,
                'message' => 'Batch file uploaded successfully',
                'data' => $uploadResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload batch file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download file
     */
    public function download(Request $request, string $fileId): JsonResponse
    {
        $validator = Validator::make(['file_id' => $fileId], [
            'file_id' => 'required|uuid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file ID'
            ], 422);
        }

        try {
            $downloadResult = $this->fileUploadService->downloadFile($fileId);

            if (!$downloadResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found or access denied'
                ], 404);
            }

            return response()->download(
                $downloadResult['path'],
                $downloadResult['filename'],
                $downloadResult['headers']
            );

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get file info
     */
    public function info(string $fileId): JsonResponse
    {
        $validator = Validator::make(['file_id' => $fileId], [
            'file_id' => 'required|uuid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file ID'
            ], 422);
        }

        try {
            $fileInfo = $this->fileUploadService->getFileInfo($fileId);

            if (!$fileInfo) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found or access denied'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $fileInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get file info: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete file
     */
    public function delete(string $fileId): JsonResponse
    {
        $validator = Validator::make(['file_id' => $fileId], [
            'file_id' => 'required|uuid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file ID'
            ], 422);
        }

        try {
            $deleted = $this->fileUploadService->deleteFile($fileId);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found or access denied'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get files for entity
     */
    public function getEntityFiles(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|string|in:product,document,batch',
            'entity_id' => 'required|uuid',
            'file_type' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $files = $this->fileUploadService->getEntityFiles(
                $request->input('entity_type'),
                $request->input('entity_id'),
                $request->input('file_type')
            );

            return response()->json([
                'success' => true,
                'data' => $files,
                'meta' => [
                    'entity_type' => $request->input('entity_type'),
                    'entity_id' => $request->input('entity_id'),
                    'total' => count($files)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get entity files: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get storage statistics
     */
    public function storageStats(): JsonResponse
    {
        try {
            $stats = $this->fileUploadService->getStorageStats();

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get storage stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate presigned URL for large file uploads
     */
    public function generatePresignedUrl(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'filename' => 'required|string|max:255',
            'content_type' => 'required|string|max:100',
            'file_size' => 'required|integer|min:1|max:1073741824', // 1GB max
            'entity_type' => 'required|string|in:product,document,batch',
            'entity_id' => 'required|uuid'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $presignedData = $this->fileUploadService->generatePresignedUrl(
                $request->input('filename'),
                $request->input('content_type'),
                $request->input('file_size'),
                $request->input('entity_type'),
                $request->input('entity_id')
            );

            return response()->json([
                'success' => true,
                'data' => $presignedData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate presigned URL: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate file type and size
     */
    public function validateFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'filename' => 'required|string|max:255',
            'file_size' => 'required|integer|min:1',
            'content_type' => 'required|string|max:100',
            'entity_type' => 'required|string|in:product,document,batch',
            'file_type' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $validation = $this->fileUploadService->validateFileUpload(
                $request->input('filename'),
                $request->input('file_size'),
                $request->input('content_type'),
                $request->input('entity_type'),
                $request->input('file_type')
            );

            return response()->json([
                'success' => $validation['valid'],
                'message' => $validation['message'] ?? 'File validation completed',
                'data' => $validation
            ], $validation['valid'] ? 200 : 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate file: ' . $e->getMessage()
            ], 500);
        }
    }
}