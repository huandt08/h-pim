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
        Schema::table('users', function (Blueprint $table) {
            $table->string('department', 10)->after('email')->nullable();
            $table->enum('role', ['super_admin', 'department_admin', 'department_user', 'cross_department_user', 'view_only'])->default('department_user')->after('department');
            $table->json('cross_department_access')->nullable()->after('role'); // For cross-department users
            $table->boolean('is_active')->default(true)->after('cross_department_access');
            
            $table->foreign('department')->references('code')->on('departments')->onDelete('set null');
            $table->index(['department', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department']);
            $table->dropIndex(['department', 'role']);
            $table->dropColumn(['department', 'role', 'cross_department_access', 'is_active']);
        });
    }
};
