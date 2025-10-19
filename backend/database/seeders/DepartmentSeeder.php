<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'code' => 'RND',
                'name' => 'Research & Development',
                'description' => 'Product research, development, and innovation',
                'responsibilities' => json_encode([
                    'Product development and formulation',
                    'Product testing and quality assurance',
                    'Technical documentation creation',
                    'Product specification management',
                    'Innovation and improvement initiatives'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'MKT',
                'name' => 'Marketing',
                'description' => 'Marketing strategy, campaigns, and content creation',
                'responsibilities' => json_encode([
                    'Marketing strategy development',
                    'Content creation and management',
                    'Brand management',
                    'Market research and analysis',
                    'Campaign planning and execution'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ECOM',
                'name' => 'E-commerce',
                'description' => 'E-commerce operations and online sales',
                'responsibilities' => json_encode([
                    'E-commerce platform management',
                    'Online product listing and optimization',
                    'Digital sales strategy',
                    'Customer experience optimization',
                    'Online marketplace management'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'PUR',
                'name' => 'Purchasing',
                'description' => 'Procurement and supplier management',
                'responsibilities' => json_encode([
                    'Supplier sourcing and management',
                    'Purchase order management',
                    'Cost negotiation and optimization',
                    'Quality control coordination',
                    'Inventory planning support'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'LEG',
                'name' => 'Legal',
                'description' => 'Legal compliance and documentation',
                'responsibilities' => json_encode([
                    'Regulatory compliance management',
                    'Legal document review and approval',
                    'Licensing and certification',
                    'Risk assessment and mitigation',
                    'Contract management'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'WH',
                'name' => 'Warehouse',
                'description' => 'Warehouse operations and inventory management',
                'responsibilities' => json_encode([
                    'Inventory management and tracking',
                    'Warehouse operations optimization',
                    'Stock level monitoring',
                    'Distribution and logistics coordination',
                    'Quality control in storage'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'COM',
                'name' => 'Communication',
                'description' => 'External communications and public relations',
                'responsibilities' => json_encode([
                    'Public relations management',
                    'External communication strategy',
                    'Media relations and press releases',
                    'Corporate communication',
                    'Stakeholder communication'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('departments')->insert($departments);
    }
}
