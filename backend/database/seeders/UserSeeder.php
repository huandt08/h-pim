<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create test users for each department
        $users = [
            [
                'name' => 'R&D Manager',
                'email' => 'rnd@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'RND',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Marketing Manager',
                'email' => 'mkt@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'MKT',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'E-commerce Manager',
                'email' => 'ecom@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'ECOM',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Purchasing Manager',
                'email' => 'pur@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'PUR',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Legal Manager',
                'email' => 'legal@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'LEG',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Warehouse Manager',
                'email' => 'wh@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'WH',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Communications Manager',
                'email' => 'com@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'COM',
                'role' => 'department_admin',
                'email_verified_at' => now(),
                'is_active' => true,
            ],
            [
                'name' => 'Super Admin',
                'email' => 'admin@pim.com',
                'password' => Hash::make('password123'),
                'department' => 'RND',
                'role' => 'super_admin',
                'cross_department_access' => json_encode(['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM']),
                'email_verified_at' => now(),
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
