<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class FileUploadService
{
    /**
     * Allowed file types for documents
     */
    private const ALLOWED_DOCUMENT_TYPES = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'
    ];

    /**
     * Allowed image types
     */
    private const ALLOWED_IMAGE_TYPES = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'
    ];

    /**
     * Allowed video types
     */
    private const ALLOWED_VIDEO_TYPES = [
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'
    ];

    /**
     * Maximum file sizes (in MB)
     */
    private const MAX_FILE_SIZES = [
        'document' => 10, // 10MB
        'image' => 5,     // 5MB
        'video' => 100    // 100MB
    ];

    /**
     * Upload document file
     */
    public function uploadDocument(UploadedFile $file, array $metadata): array
    {
        $this->validateFile($file, 'document');

        $directory = $this->buildDirectoryPath('documents', $metadata);
        $filename = $this->generateFilename($file);
        $path = $directory . '/' . $filename;

        // Store file
        $storedPath = Storage::disk('public')->putFileAs(
            $directory,
            $file,
            $filename
        );

        if (!$storedPath) {
            throw new \Exception('Failed to store file');
        }

        return [
            'file_path' => $storedPath,
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'url' => Storage::disk('public')->url($storedPath)
        ];
    }

    /**
     * Upload image file
     */
    public function uploadImage(UploadedFile $file, array $metadata): array
    {
        $this->validateFile($file, 'image');

        $directory = $this->buildDirectoryPath('images', $metadata);
        $filename = $this->generateFilename($file);
        $path = $directory . '/' . $filename;

        // Store original image
        $storedPath = Storage::disk('public')->putFileAs(
            $directory,
            $file,
            $filename
        );

        if (!$storedPath) {
            throw new \Exception('Failed to store image');
        }

        $result = [
            'file_path' => $storedPath,
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'url' => Storage::disk('public')->url($storedPath)
        ];

        // Generate thumbnails for images
        if ($this->isImage($file)) {
            $result['thumbnails'] = $this->generateThumbnails($file, $directory, $filename);
        }

        return $result;
    }

    /**
     * Upload video file
     */
    public function uploadVideo(UploadedFile $file, array $metadata): array
    {
        $this->validateFile($file, 'video');

        $directory = $this->buildDirectoryPath('videos', $metadata);
        $filename = $this->generateFilename($file);
        $path = $directory . '/' . $filename;

        // Store video
        $storedPath = Storage::disk('public')->putFileAs(
            $directory,
            $file,
            $filename
        );

        if (!$storedPath) {
            throw new \Exception('Failed to store video');
        }

        return [
            'file_path' => $storedPath,
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'url' => Storage::disk('public')->url($storedPath),
            'duration' => $this->getVideoDuration($storedPath)
        ];
    }

    /**
     * Upload multiple files
     */
    public function uploadMultiple(array $files, array $metadata): array
    {
        $results = [];

        foreach ($files as $index => $file) {
            if ($file instanceof UploadedFile && $file->isValid()) {
                $fileType = $this->detectFileType($file);
                
                try {
                    switch ($fileType) {
                        case 'image':
                            $result = $this->uploadImage($file, $metadata);
                            break;
                        case 'video':
                            $result = $this->uploadVideo($file, $metadata);
                            break;
                        default:
                            $result = $this->uploadDocument($file, $metadata);
                            break;
                    }
                    
                    $result['upload_index'] = $index;
                    $result['type'] = $fileType;
                    $results[] = $result;
                    
                } catch (\Exception $e) {
                    $results[] = [
                        'upload_index' => $index,
                        'error' => $e->getMessage(),
                        'original_name' => $file->getClientOriginalName()
                    ];
                }
            }
        }

        return $results;
    }

    /**
     * Delete file
     */
    public function deleteFile(string $filePath): bool
    {
        if (Storage::disk('public')->exists($filePath)) {
            return Storage::disk('public')->delete($filePath);
        }

        return false;
    }

    /**
     * Get file info
     */
    public function getFileInfo(string $filePath): ?array
    {
        if (!Storage::disk('public')->exists($filePath)) {
            return null;
        }

        return [
            'exists' => true,
            'size' => Storage::disk('public')->size($filePath),
            'last_modified' => Storage::disk('public')->lastModified($filePath),
            'url' => Storage::disk('public')->url($filePath),
            'mime_type' => Storage::disk('public')->mimeType($filePath)
        ];
    }

    /**
     * Validate uploaded file
     */
    private function validateFile(UploadedFile $file, string $type): void
    {
        // Check if file is valid
        if (!$file->isValid()) {
            throw new \InvalidArgumentException('Invalid file uploaded');
        }

        // Get file extension
        $extension = strtolower($file->getClientOriginalExtension());

        // Check allowed extensions
        $allowedExtensions = $this->getAllowedExtensions($type);
        if (!in_array($extension, $allowedExtensions)) {
            throw new \InvalidArgumentException(
                "File type '{$extension}' not allowed for {$type}. Allowed: " . implode(', ', $allowedExtensions)
            );
        }

        // Check file size
        $maxSize = self::MAX_FILE_SIZES[$type] * 1024 * 1024; // Convert MB to bytes
        if ($file->getSize() > $maxSize) {
            $maxSizeMB = self::MAX_FILE_SIZES[$type];
            throw new \InvalidArgumentException("File size exceeds maximum allowed size of {$maxSizeMB}MB");
        }

        // Additional MIME type validation
        $this->validateMimeType($file, $type);
    }

    /**
     * Validate MIME type
     */
    private function validateMimeType(UploadedFile $file, string $type): void
    {
        $mimeType = $file->getMimeType();
        $allowedMimeTypes = $this->getAllowedMimeTypes($type);

        if (!in_array($mimeType, $allowedMimeTypes)) {
            throw new \InvalidArgumentException("MIME type '{$mimeType}' not allowed for {$type}");
        }
    }

    /**
     * Get allowed extensions for file type
     */
    private function getAllowedExtensions(string $type): array
    {
        switch ($type) {
            case 'image':
                return self::ALLOWED_IMAGE_TYPES;
            case 'video':
                return self::ALLOWED_VIDEO_TYPES;
            case 'document':
            default:
                return self::ALLOWED_DOCUMENT_TYPES;
        }
    }

    /**
     * Get allowed MIME types for file type
     */
    private function getAllowedMimeTypes(string $type): array
    {
        switch ($type) {
            case 'image':
                return [
                    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
                    'image/webp', 'image/svg+xml'
                ];
            case 'video':
                return [
                    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
                    'video/x-flv', 'video/webm'
                ];
            case 'document':
            default:
                return [
                    'application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'text/plain'
                ];
        }
    }

    /**
     * Detect file type based on extension and MIME type
     */
    private function detectFileType(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mimeType = $file->getMimeType();

        if (in_array($extension, self::ALLOWED_IMAGE_TYPES) || strpos($mimeType, 'image/') === 0) {
            return 'image';
        }

        if (in_array($extension, self::ALLOWED_VIDEO_TYPES) || strpos($mimeType, 'video/') === 0) {
            return 'video';
        }

        return 'document';
    }

    /**
     * Check if file is an image
     */
    private function isImage(UploadedFile $file): bool
    {
        return $this->detectFileType($file) === 'image';
    }

    /**
     * Build directory path for file storage
     */
    private function buildDirectoryPath(string $baseDir, array $metadata): string
    {
        $parts = [$baseDir];

        if (isset($metadata['department'])) {
            $parts[] = $metadata['department'];
        }

        if (isset($metadata['product_code'])) {
            $parts[] = $metadata['product_code'];
        }

        if (isset($metadata['category'])) {
            $parts[] = $metadata['category'];
        }

        $parts[] = date('Y/m');

        return implode('/', $parts);
    }

    /**
     * Generate unique filename
     */
    private function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $uuid = Str::uuid();
        $timestamp = now()->format('YmdHis');
        
        return "{$uuid}_{$timestamp}.{$extension}";
    }

    /**
     * Generate thumbnails for images
     */
    private function generateThumbnails(UploadedFile $file, string $directory, string $filename): array
    {
        // This would typically use an image processing library like Intervention Image
        // For now, we'll return a placeholder structure
        
        $baseName = pathinfo($filename, PATHINFO_FILENAME);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);

        $thumbnails = [
            'small' => [
                'size' => '150x150',
                'path' => "{$directory}/thumbs/small_{$baseName}.{$extension}",
                'url' => null
            ],
            'medium' => [
                'size' => '300x300',
                'path' => "{$directory}/thumbs/medium_{$baseName}.{$extension}",
                'url' => null
            ],
            'large' => [
                'size' => '600x600',
                'path' => "{$directory}/thumbs/large_{$baseName}.{$extension}",
                'url' => null
            ]
        ];

        // TODO: Implement actual thumbnail generation using Intervention Image
        // For now, just return the structure

        return $thumbnails;
    }

    /**
     * Get video duration (placeholder)
     */
    private function getVideoDuration(string $filePath): ?int
    {
        // This would typically use FFMpeg or similar library
        // For now, return null
        return null;
    }

    /**
     * Clean up old files (for scheduled cleanup)
     */
    public function cleanupOldFiles(int $daysOld = 30): array
    {
        $cutoffDate = now()->subDays($daysOld);
        $cleaned = [];

        // This would scan for old files and remove them
        // Implementation depends on specific requirements

        return $cleaned;
    }

    /**
     * Get storage statistics
     */
    public function getStorageStats(): array
    {
        $disk = Storage::disk('public');
        
        return [
            'total_files' => 0, // Would count actual files
            'total_size' => 0,  // Would calculate total size
            'by_type' => [
                'documents' => ['count' => 0, 'size' => 0],
                'images' => ['count' => 0, 'size' => 0],
                'videos' => ['count' => 0, 'size' => 0]
            ]
        ];
    }
}