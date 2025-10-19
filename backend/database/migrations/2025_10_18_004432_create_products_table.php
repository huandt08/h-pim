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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 100)->unique(); // SKU
            $table->string('name', 255);
            $table->string('brand', 255)->nullable();
            $table->text('description')->nullable();
            $table->text('detailed_description')->nullable();
            $table->text('specifications')->nullable(); // Quy cách
            $table->text('ingredients')->nullable(); // Thành phần
            $table->text('usage')->nullable(); // Công dụng
            $table->text('instructions')->nullable(); // HDSD
            $table->text('storage')->nullable(); // Bảo quản
            $table->text('development_reason')->nullable(); // Lý do phát triển
            $table->text('similar_products')->nullable(); // Sản phẩm tương tự
            $table->text('usp')->nullable(); // Unique Selling Points
            $table->string('primary_owner_department', 10);
            $table->json('secondary_access_departments')->nullable();
            $table->enum('status', ['development', 'active', 'discontinued'])->default('development');
            $table->decimal('compliance_percentage', 5, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('primary_owner_department')->references('code')->on('departments');
            $table->index(['primary_owner_department', 'status']);
            $table->index('compliance_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
