<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LarkSyncStatus extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'lark_sync_status';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'lark_record_id',
        'last_sync_at',
        'sync_status',
        'error_message',
        'retry_count',
        'metadata'
    ];

    protected $casts = [
        'last_sync_at' => 'datetime',
        'retry_count' => 'integer',
        'metadata' => 'array'
    ];

    /**
     * Scope successful syncs
     */
    public function scopeSuccessful($query)
    {
        return $query->where('sync_status', 'success');
    }

    /**
     * Scope failed syncs
     */
    public function scopeFailed($query)
    {
        return $query->where('sync_status', 'failed');
    }

    /**
     * Scope pending syncs
     */
    public function scopePending($query)
    {
        return $query->where('sync_status', 'pending');
    }

    /**
     * Scope by entity type
     */
    public function scopeByEntityType($query, string $entityType)
    {
        return $query->where('entity_type', $entityType);
    }

    /**
     * Scope syncs needing retry
     */
    public function scopeNeedsRetry($query, int $maxRetries = 3)
    {
        return $query->where('sync_status', 'failed')
            ->where('retry_count', '<', $maxRetries);
    }

    /**
     * Mark sync as successful
     */
    public function markAsSuccessful(?string $larkRecordId = null): bool
    {
        return $this->update([
            'sync_status' => 'success',
            'last_sync_at' => now(),
            'error_message' => null,
            'lark_record_id' => $larkRecordId ?? $this->lark_record_id
        ]);
    }

    /**
     * Mark sync as failed
     */
    public function markAsFailed(string $errorMessage): bool
    {
        return $this->update([
            'sync_status' => 'failed',
            'error_message' => $errorMessage,
            'retry_count' => $this->retry_count + 1
        ]);
    }

    /**
     * Reset retry count
     */
    public function resetRetryCount(): bool
    {
        return $this->update(['retry_count' => 0]);
    }

    /**
     * Check if max retries reached
     */
    public function hasMaxRetriesReached(int $maxRetries = 3): bool
    {
        return $this->retry_count >= $maxRetries;
    }

    /**
     * Get sync status for entity
     */
    public static function getForEntity(string $entityType, string $entityId): ?self
    {
        return self::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->first();
    }

    /**
     * Create or update sync status
     */
    public static function createOrUpdate(string $entityType, string $entityId, array $data): self
    {
        return self::updateOrCreate(
            [
                'entity_type' => $entityType,
                'entity_id' => $entityId
            ],
            $data
        );
    }
}