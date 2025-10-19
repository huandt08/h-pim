<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'manage_users',
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            'view_department_users',
            'search_all_users',
            
            // Product management
            'manage_products',
            'view_products',
            'create_products',
            'edit_products',
            'delete_products',
            'approve_products',
            'reject_products',
            
            // Document management
            'manage_documents',
            'view_documents',
            'create_documents',
            'edit_documents',
            'delete_documents',
            'approve_documents',
            'reject_documents',
            'upload_documents',
            'download_documents',
            
            // Batch management
            'manage_batches',
            'view_batches',
            'create_batches',
            'edit_batches',
            'delete_batches',
            'approve_batches',
            'reject_batches',
            'quality_control_batches',
            
            // Alert management
            'manage_alerts',
            'view_alerts',
            'create_alerts',
            'edit_alerts',
            'delete_alerts',
            'resolve_alerts',
            'escalate_alerts',
            
            // Department management
            'manage_departments',
            'view_departments',
            'view_department_metrics',
            'view_department_workload',
            'transfer_ownership',
            
            // Dashboard and reports
            'view_dashboard',
            'view_reports',
            'export_data',
            'import_data',
            
            // System administration
            'system_settings',
            'manage_permissions',
            'manage_roles',
            'view_logs',
            'backup_system',
            'restore_system',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Super Admin - has all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->syncPermissions(Permission::all());

        // Admin - most permissions except system settings
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $adminPermissions = [
            'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_department_users', 'search_all_users',
            'manage_products', 'view_products', 'create_products', 'edit_products', 'delete_products',
            'approve_products', 'reject_products',
            'manage_documents', 'view_documents', 'create_documents', 'edit_documents', 'delete_documents',
            'approve_documents', 'reject_documents', 'upload_documents', 'download_documents',
            'manage_batches', 'view_batches', 'create_batches', 'edit_batches', 'delete_batches',
            'approve_batches', 'reject_batches', 'quality_control_batches',
            'manage_alerts', 'view_alerts', 'create_alerts', 'edit_alerts', 'delete_alerts',
            'resolve_alerts', 'escalate_alerts',
            'manage_departments', 'view_departments', 'view_department_metrics', 'view_department_workload',
            'transfer_ownership',
            'view_dashboard', 'view_reports', 'export_data', 'import_data',
            'manage_permissions', 'manage_roles'
        ];
        $admin->syncPermissions($adminPermissions);

        // Manager - department-level management
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $managerPermissions = [
            'view_users', 'view_department_users',
            'manage_products', 'view_products', 'create_products', 'edit_products',
            'approve_products', 'reject_products',
            'manage_documents', 'view_documents', 'create_documents', 'edit_documents',
            'approve_documents', 'reject_documents', 'upload_documents', 'download_documents',
            'manage_batches', 'view_batches', 'create_batches', 'edit_batches',
            'approve_batches', 'reject_batches', 'quality_control_batches',
            'manage_alerts', 'view_alerts', 'create_alerts', 'edit_alerts',
            'resolve_alerts', 'escalate_alerts',
            'view_departments', 'view_department_metrics', 'view_department_workload',
            'view_dashboard', 'view_reports', 'export_data'
        ];
        $manager->syncPermissions($managerPermissions);

        // User - basic access
        $user = Role::firstOrCreate(['name' => 'user']);
        $userPermissions = [
            'view_products', 'create_products', 'edit_products',
            'view_documents', 'create_documents', 'edit_documents',
            'upload_documents', 'download_documents',
            'view_batches', 'create_batches', 'edit_batches',
            'view_alerts', 'create_alerts',
            'view_dashboard'
        ];
        $user->syncPermissions($userPermissions);

        // Viewer - read-only access
        $viewer = Role::firstOrCreate(['name' => 'viewer']);
        $viewerPermissions = [
            'view_products',
            'view_documents', 'download_documents',
            'view_batches',
            'view_alerts',
            'view_dashboard'
        ];
        $viewer->syncPermissions($viewerPermissions);

        // Quality Control - specialized role for batch quality management
        $qc = Role::firstOrCreate(['name' => 'quality-control']);
        $qcPermissions = [
            'view_products',
            'view_documents', 'download_documents',
            'view_batches', 'edit_batches', 'quality_control_batches',
            'approve_batches', 'reject_batches',
            'view_alerts', 'create_alerts', 'resolve_alerts',
            'view_dashboard'
        ];
        $qc->syncPermissions($qcPermissions);

        // Assign roles to existing users
        $adminUser = User::where('email', 'admin@pim.com')->first();
        if ($adminUser) {
            $adminUser->assignRole('super-admin');
        }

        // Create some sample users with different roles if they don't exist
        $sampleUsers = [
            [
                'name' => 'John Manager',
                'email' => 'manager@pim.com',
                'password' => bcrypt('password123'),
                'department' => 'RND',
                'role' => 'manager',
                'email_verified_at' => now()
            ],
            [
                'name' => 'Jane User',
                'email' => 'user@pim.com',
                'password' => bcrypt('password123'),
                'department' => 'WH',
                'role' => 'user',
                'email_verified_at' => now()
            ],
            [
                'name' => 'QC Specialist',
                'email' => 'qc@pim.com',
                'password' => bcrypt('password123'),
                'department' => 'RND',
                'role' => 'quality-control',
                'email_verified_at' => now()
            ],
            [
                'name' => 'Marketing Viewer',
                'email' => 'viewer@pim.com',
                'password' => bcrypt('password123'),
                'department' => 'MKT',
                'role' => 'viewer',
                'email_verified_at' => now()
            ]
        ];

        foreach ($sampleUsers as $userData) {
            $user = User::where('email', $userData['email'])->first();
            if (!$user) {
                $role = $userData['role'];
                unset($userData['role']);
                
                $user = User::create($userData);
                $user->assignRole($role);
            }
        }

        $this->command->info('Permissions and roles created successfully!');
        $this->command->info('Sample users created with different roles:');
        $this->command->info('- admin@pim.com (super-admin)');
        $this->command->info('- manager@pim.com (manager)');
        $this->command->info('- user@pim.com (user)');
        $this->command->info('- qc@pim.com (quality-control)');
        $this->command->info('- viewer@pim.com (viewer)');
    }
}
