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

class Product extends Model
{
    use HasFactory, SoftDeletes, HasUuids, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'code',
        'name',
        'brand',
        'description',
        'detailed_description',
        'specifications',
        'ingredients',
        'usage',
        'instructions',
        'storage',
        'development_reason',
        'similar_products',
        'usp',
        'primary_owner_department',
        'secondary_access_departments',
        'status',
        'compliance_percentage',
    ];

    protected $casts = [
        'secondary_access_departments' => 'array',
        'compliance_percentage' => 'decimal:2',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'primary_owner_department', 'code');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Check if a department has access to this product
     */
    public function hasAccess(string $departmentCode): bool
    {
        if ($this->primary_owner_department === $departmentCode) {
            return true;
        }

        return in_array($departmentCode, $this->secondary_access_departments ?? []);
    }

    /**
     * Get products accessible by a department
     */
    public function scopeAccessibleBy($query, string $departmentCode)
    {
        return $query->where('primary_owner_department', $departmentCode)
            ->orWhereJsonContains('secondary_access_departments', $departmentCode);
    }

    /**
     * Scope to filter by compliance percentage
     */
    public function scopeByCompliance($query, float $minCompliance = null, float $maxCompliance = null)
    {
        if ($minCompliance !== null) {
            $query->where('compliance_percentage', '>=', $minCompliance);
        }
        
        if ($maxCompliance !== null) {
            $query->where('compliance_percentage', '<=', $maxCompliance);
        }

        return $query;
    }

    /**
     * Activity log configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['code', 'name', 'status', 'compliance_percentage'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Calculate compliance percentage based on required documents
     */
    public function calculateCompliance(): float
    {
        $requiredDocuments = $this->documents()->where('is_required', true)->count();
        $completedDocuments = $this->documents()
            ->where('is_required', true)
            ->where('status', 'active')
            ->whereNotNull('file_path')
            ->count();

        if ($requiredDocuments === 0) {
            return 100.0;
        }

        return round(($completedDocuments / $requiredDocuments) * 100, 2);
    }
}