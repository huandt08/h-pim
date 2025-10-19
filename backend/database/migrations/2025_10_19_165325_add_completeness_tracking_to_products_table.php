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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('completeness_score', 5, 2)->default(0)->comment('Điểm completeness từ 0-100');
            $table->json('missing_fields')->nullable()->comment('Danh sách trường đang thiếu');
            $table->json('validation_errors')->nullable()->comment('Chi tiết lỗi validation');
            $table->timestamp('last_completeness_check')->nullable()->comment('Lần kiểm tra completeness cuối');
            $table->json('field_completion_status')->nullable()->comment('Trạng thái hoàn thành từng trường');
            $table->integer('completion_deadline_hours')->nullable()->comment('Số giờ deadline để hoàn thành');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'completeness_score',
                'missing_fields',
                'validation_errors',
                'last_completeness_check',
                'field_completion_status',
                'completion_deadline_hours'
            ]);
        });
    }
};
