<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DocumentVersion extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'document_id',
        'version_number',
        'file_path',
        'file_size',
        'mime_type',
        'changes_summary',
        'created_by',
        'is_current'
    ];

    protected $casts = [
        'version_number' => 'integer',
        'file_size' => 'integer',
        'is_current' => 'boolean'
    ];

    /**
     * Get the document this version belongs to
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the user who created this version
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope current versions
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope by document
     */
    public function scopeForDocument($query, string $documentId)
    {
        return $query->where('document_id', $documentId);
    }

    /**
     * Activity log configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['version_number', 'changes_summary', 'is_current'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Set this version as current
     */
    public function makeCurrent(): bool
    {
        // First, set all other versions of the same document as not current
        self::where('document_id', $this->document_id)
            ->update(['is_current' => false]);

        // Then set this version as current
        return $this->update(['is_current' => true]);
    }

    /**
     * Get file URL
     */
    public function getFileUrl(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        return asset('storage/' . $this->file_path);
    }

    /**
     * Get human readable file size
     */
    public function getHumanFileSize(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}