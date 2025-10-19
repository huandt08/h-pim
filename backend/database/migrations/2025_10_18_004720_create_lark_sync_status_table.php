<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lark_sync_status', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('table_name'); // products_overview, dept_alert_monitor, dept_performance
            $table->string('record_id')->nullable(); // ID of the synced record
            $table->json('record_data'); // Actual data that was synced
            $table->enum('sync_type', ['create', 'update', 'delete']);
            $table->enum('status', ['pending', 'success', 'failed', 'retrying'])->default('pending');
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamps();
            
            $table->index(['table_name', 'status']);
            $table->index(['status', 'next_retry_at']);
            $table->index('last_sync_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lark_sync_status');
    }
};
