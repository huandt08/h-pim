<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Alert extends Model
{
    use HasFactory, HasUuids, LogsActivity;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'document_id',
        'batch_id',
        'type',
        'priority',
        'title',
        'message',
        'primary_responsible_department',
        'secondary_involved_departments',
        'due_date',
        'status',
        'response_time_hours',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
        'metadata'
    ];

    protected $casts = [
        'secondary_involved_departments' => 'array',
        'due_date' => 'datetime',
        'resolved_at' => 'datetime',
        'response_time_hours' => 'integer',
        'metadata' => 'array'
    ];

    /**
     * Get the product this alert belongs to
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the document this alert belongs to
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the batch this alert belongs to
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the primary responsible department
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'primary_responsible_department', 'code');
    }

    /**
     * Get the user who resolved this alert
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Scope alerts by priority
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope critical alerts
     */
    public function scopeCritical($query)
    {
        return $query->where('priority', 'critical');
    }

    /**
     * Scope high priority alerts
     */
    public function scopeHigh($query)
    {
        return $query->where('priority', 'high');
    }

    /**
     * Scope alerts by status
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope active alerts
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['open', 'in_progress']);
    }

    /**
     * Scope resolved alerts
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    /**
     * Scope overdue alerts
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereIn('status', ['open', 'in_progress']);
    }

    /**
     * Scope alerts by department (primary or secondary)
     */
    public function scopeForDepartment($query, string $departmentCode)
    {
        return $query->where('primary_responsible_department', $departmentCode)
            ->orWhereJsonContains('secondary_involved_departments', $departmentCode);
    }

    /**
     * Scope alerts by primary responsible department
     */
    public function scopePrimaryResponsible($query, string $departmentCode)
    {
        return $query->where('primary_responsible_department', $departmentCode);
    }

    /**
     * Scope alerts by type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Activity log configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'priority', 'resolved_at', 'resolved_by'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Check if alert is overdue
     */
    public function isOverdue(): bool
    {
        return $this->due_date && 
               $this->due_date->isPast() && 
               in_array($this->status, ['open', 'in_progress']);
    }

    /**
     * Check if alert is critical
     */
    public function isCritical(): bool
    {
        return $this->priority === 'critical';
    }

    /**
     * Resolve the alert
     */
    public function resolve(string $resolutionNotes = null, int $userId = null): bool
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $userId ?? auth()->id(),
            'resolution_notes' => $resolutionNotes
        ]);

        return true;
    }

    /**
     * Mark alert as in progress
     */
    public function markInProgress(): bool
    {
        return $this->update(['status' => 'in_progress']);
    }

    /**
     * Escalate alert priority
     */
    public function escalate(): bool
    {
        $priorities = ['low', 'medium', 'high', 'critical'];
        $currentIndex = array_search($this->priority, $priorities);
        
        if ($currentIndex !== false && $currentIndex < count($priorities) - 1) {
            return $this->update(['priority' => $priorities[$currentIndex + 1]]);
        }

        return false;
    }

    /**
     * Get alert age in hours
     */
    public function getAgeInHours(): int
    {
        return $this->created_at->diffInHours(now());
    }

    /**
     * Get time until due in hours
     */
    public function getHoursUntilDue(): ?int
    {
        if (!$this->due_date) {
            return null;
        }

        return now()->diffInHours($this->due_date, false);
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColor(): string
    {
        return match($this->priority) {
            'critical' => '#ff4d4f',
            'high' => '#ff7a45',
            'medium' => '#faad14',
            'low' => '#52c41a',
            default => '#d9d9d9'
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'open' => '#ff4d4f',
            'in_progress' => '#faad14',
            'resolved' => '#52c41a',
            'closed' => '#d9d9d9',
            default => '#d9d9d9'
        ];
    }

    /**
     * Create alert for missing document
     */
    public static function createMissingDocumentAlert(Product $product, string $documentType): self
    {
        return self::create([
            'product_id' => $product->id,
            'type' => 'missing_document',
            'priority' => 'medium',
            'title' => "Missing Document: {$documentType}",
            'message' => "Required document '{$documentType}' is missing for product {$product->code}",
            'primary_responsible_department' => $product->primary_owner_department,
            'due_date' => now()->addDays(7),
            'status' => 'open'
        ]);
    }

    /**
     * Create alert for document expiry
     */
    public static function createDocumentExpiryAlert(Document $document): self
    {
        return self::create([
            'document_id' => $document->id,
            'product_id' => $document->product_id,
            'type' => 'document_expiry',
            'priority' => 'high',
            'title' => "Document Expiring: {$document->name}",
            'message' => "Document '{$document->name}' is expiring on {$document->deadline?->format('Y-m-d')}",
            'primary_responsible_department' => $document->primary_owner_department,
            'secondary_involved_departments' => $document->secondary_access_departments,
            'due_date' => $document->deadline,
            'status' => 'open'
        ]);
    }

    /**
     * Create alert for low compliance
     */
    public static function createLowComplianceAlert(Product $product): self
    {
        return self::create([
            'product_id' => $product->id,
            'type' => 'low_compliance',
            'priority' => 'high',
            'title' => "Low Compliance: {$product->code}",
            'message' => "Product {$product->code} has compliance percentage of {$product->compliance_percentage}%",
            'primary_responsible_department' => $product->primary_owner_department,
            'due_date' => now()->addDays(3),
            'status' => 'open'
        ]);
    }
}