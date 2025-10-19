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
        Schema::create('alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id')->nullable();
            $table->uuid('document_id')->nullable();
            $table->uuid('batch_id')->nullable();
            $table->enum('type', ['missing_document', 'document_expiry', 'compliance_issue', 'deadline_approaching']);
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('primary_responsible_department', 10);
            $table->json('secondary_involved_departments')->nullable();
            $table->string('title', 255);
            $table->text('message');
            $table->timestamp('due_date')->nullable();
            $table->enum('status', ['pending', 'acknowledged', 'in_progress', 'resolved', 'dismissed'])->default('pending');
            $table->integer('response_time_hours')->nullable(); // For metrics
            $table->foreignId('acknowledged_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('batch_id')->references('id')->on('batches')->onDelete('cascade');
            $table->foreign('primary_responsible_department')->references('code')->on('departments');
            
            $table->index(['primary_responsible_department', 'status']);
            $table->index(['priority', 'status']);
            $table->index(['due_date', 'status']);
            $table->index(['product_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
