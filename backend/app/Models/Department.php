<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Department extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'code',
        'name',
        'description',
        'manager_email',
        'secondary_emails',
        'settings',
        'is_active'
    ];

    protected $casts = [
        'secondary_emails' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean'
    ];

    protected $appends = ['status'];

    /**
     * Get status attribute based on is_active
     */
    public function getStatusAttribute(): string
    {
        return $this->is_active ? 'active' : 'inactive';
    }

    /**
     * Get activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['code', 'name', 'description', 'manager_email'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get users belonging to this department
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'department', 'code');
    }

    /**
     * Get products where this department is primary owner
     */
    public function primaryProducts(): HasMany
    {
        return $this->hasMany(Product::class, 'primary_owner_department', 'code');
    }

    /**
     * Get documents where this department is primary owner
     */
    public function primaryDocuments(): HasMany
    {
        return $this->hasMany(Document::class, 'primary_owner_department', 'code');
    }

    /**
     * Get alerts where this department is primary responsible
     */
    public function primaryAlerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'primary_responsible_department', 'code');
    }

    /**
     * Get all products this department has access to (primary + secondary)
     */
    public function accessibleProducts()
    {
        return Product::where('primary_owner_department', $this->code)
            ->orWhereJsonContains('secondary_access_departments', $this->code);
    }

    /**
     * Get all documents this department has access to (primary + secondary)
     */
    public function accessibleDocuments()
    {
        return Document::where('primary_owner_department', $this->code)
            ->orWhereJsonContains('secondary_access_departments', $this->code);
    }

    /**
     * Calculate department metrics
     */
    public function calculateMetrics(): array
    {
        $primaryProducts = $this->primaryProducts()->count();
        $secondaryProducts = Product::whereJsonContains('secondary_access_departments', $this->code)->count();
        $totalAlerts = $this->primaryAlerts()->count();
        $criticalAlerts = $this->primaryAlerts()->where('priority', 'critical')->count();
        
        $avgCompliance = $this->primaryProducts()->avg('compliance_percentage') ?? 0;

        return [
            'primary_products' => $primaryProducts,
            'secondary_products' => $secondaryProducts,
            'total_alerts' => $totalAlerts,
            'critical_alerts' => $criticalAlerts,
            'avg_compliance' => round($avgCompliance, 2)
        ];
    }

    /**
     * Get department by code
     */
    public static function findByCode(string $code): ?self
    {
        return static::where('code', $code)->first();
    }

    /**
     * Get all department codes
     */
    public static function getAllCodes(): array
    {
        return static::pluck('code')->toArray();
    }
}