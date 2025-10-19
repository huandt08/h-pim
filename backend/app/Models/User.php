<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'department',
        'role',
        'cross_department_access',
        'is_active'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'cross_department_access' => 'array'
        ];
    }

    /**
     * Get the options for activity logging
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'department', 'role', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get the department this user belongs to
     */
    public function departmentModel(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department', 'code');
    }

    /**
     * Get alerts resolved by this user
     */
    public function resolvedAlerts(): HasMany
    {
        return $this->hasMany(\App\Models\Alert::class, 'resolved_by');
    }

    /**
     * Get document versions created by this user
     */
    public function documentVersions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class, 'created_by');
    }

    /**
     * Scope active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope users by department
     */
    public function scopeByDepartment($query, string $departmentCode)
    {
        return $query->where('department', $departmentCode);
    }

    /**
     * Check if user has access to product
     */
    public function hasProductAccess(Product $product): bool
    {
        return $product->hasAccess($this->department);
    }

    /**
     * Check if user has access to document
     */
    public function hasDocumentAccess(Document $document, string $accessType = 'read'): bool
    {
        return $document->hasAccess($this->department);
    }

    /**
     * Get user's accessible products
     */
    public function getAccessibleProducts()
    {
        return Product::accessibleBy($this->department);
    }

    /**
     * Get user's accessible documents
     */
    public function getAccessibleDocuments()
    {
        return Document::accessibleBy($this->department);
    }
}
