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

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'department_code',
        'position',
        'phone',
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
            'is_active' => 'boolean'
        ];
    }

    /**
     * Get the department this user belongs to
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_code', 'code');
    }

    /**
     * Get alerts resolved by this user
     */
    public function resolvedAlerts(): HasMany
    {
        return $this->hasMany(Alert::class, 'resolved_by');
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
        return $query->where('department_code', $departmentCode);
    }

    /**
     * Check if user has access to product
     */
    public function hasProductAccess(Product $product): bool
    {
        return $product->hasAccess($this->department_code);
    }

    /**
     * Check if user has access to document
     */
    public function hasDocumentAccess(Document $document, string $accessType = 'read'): bool
    {
        return $document->hasAccess($this->department_code, $accessType);
    }

    /**
     * Get user's accessible products
     */
    public function getAccessibleProducts()
    {
        return Product::accessibleBy($this->department_code);
    }

    /**
     * Get user's accessible documents
     */
    public function getAccessibleDocuments()
    {
        return Document::accessibleBy($this->department_code);
    }
}
