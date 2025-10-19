<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Document extends Model
{
    use HasFactory, SoftDeletes, HasUuids, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'type',
        'category',
        'primary_owner_department',
        'secondary_access_departments',
        'access_level',
        'product_id',
        'batch_id',
        'file_path',
        'file_size',
        'mime_type',
        'version',
        'is_required',
        'deadline',
        'status',
        'notes',
    ];

    protected $casts = [
        'secondary_access_departments' => 'array',
        'is_required' => 'boolean',
        'deadline' => 'datetime',
        'file_size' => 'integer',
        'version' => 'integer',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'primary_owner_department', 'code');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Check if a department has access to this document
     */
    public function hasAccess(string $departmentCode): bool
    {
        if ($this->primary_owner_department === $departmentCode) {
            return true;
        }

        return in_array($departmentCode, $this->secondary_access_departments ?? []);
    }

    /**
     * Check if a department can edit this document
     */
    public function canEdit(string $departmentCode): bool
    {
        if ($this->primary_owner_department === $departmentCode) {
            return true;
        }

        return $this->hasAccess($departmentCode) && $this->access_level === 'read_edit';
    }

    /**
     * Get documents accessible by a department
     */
    public function scopeAccessibleBy($query, string $departmentCode)
    {
        return $query->where('primary_owner_department', $departmentCode)
            ->orWhereJsonContains('secondary_access_departments', $departmentCode);
    }

    /**
     * Scope for required documents
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope for documents nearing deadline
     */
    public function scopeNearingDeadline($query, int $days = 30)
    {
        return $query->where('deadline', '<=', now()->addDays($days))
            ->where('deadline', '>', now())
            ->where('status', 'active');
    }

    /**
     * Scope for expired documents
     */
    public function scopeExpired($query)
    {
        return $query->where('deadline', '<', now())
            ->where('status', 'active');
    }

    /**
     * Activity log configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'version', 'deadline'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Check if document is expired
     */
    public function isExpired(): bool
    {
        return $this->deadline && $this->deadline->isPast() && $this->status === 'active';
    }

    /**
     * Get file URL
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        return asset('storage/' . $this->file_path);
    }
}