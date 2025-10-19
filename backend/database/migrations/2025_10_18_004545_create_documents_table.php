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
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 255);
            $table->enum('type', ['text', 'file', 'image', 'video']);
            $table->string('category', 100); // product_info, images_videos, product_docs, batch_docs, marketing_content, ecommerce_content, communication_content, legal_docs, warehouse_docs
            $table->string('primary_owner_department', 10);
            $table->json('secondary_access_departments')->nullable();
            $table->enum('access_level', ['read', 'read_comment', 'read_edit'])->default('read');
            $table->uuid('product_id')->nullable();
            $table->uuid('batch_id')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->integer('version')->default(1);
            $table->boolean('is_required')->default(false);
            $table->timestamp('deadline')->nullable();
            $table->enum('status', ['draft', 'active', 'archived', 'expired'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('primary_owner_department')->references('code')->on('departments');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('batch_id')->references('id')->on('batches')->onDelete('cascade');
            
            $table->index(['product_id', 'category']);
            $table->index(['primary_owner_department', 'status']);
            $table->index(['deadline', 'status']);
            $table->index(['is_required', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
