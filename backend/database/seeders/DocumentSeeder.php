<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Product;
use App\Models\Batch;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DocumentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some products and batches for reference
        $products = Product::take(10)->get();
        $batches = Batch::take(15)->get();

        // Document types and categories
        $documentTypes = [
            'specification' => ['Specification', 'Technical Specification', 'Product Specification'],
            'test_report' => ['Test Report', 'Quality Test', 'Lab Test Report'],
            'certificate' => ['Certificate', 'Quality Certificate', 'Compliance Certificate'],
            'manual' => ['User Manual', 'Installation Guide', 'Maintenance Guide'],
            'contract' => ['Contract', 'Agreement', 'Purchase Order'],
            'report' => ['Report', 'Analysis Report', 'Audit Report'],
            'procedure' => ['SOP', 'Work Instruction', 'Process Document'],
            'invoice' => ['Invoice', 'Receipt', 'Bill'],
            'batch_record' => ['Batch Record', 'Production Record', 'Quality Record'],
            'checklist' => ['Checklist', 'Inspection Checklist', 'Quality Checklist']
        ];

        $categories = [
            'quality_control',
            'production',
            'regulatory',
            'technical',
            'commercial',
            'safety',
            'environmental',
            'training',
            'maintenance',
            'batch_documentation'
        ];

        $departments = ['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM'];

        $documents = [];

        // Product-related documents
        foreach ($products as $index => $product) {
            // Technical Specification
            $documents[] = [
                'id' => Str::uuid(),
                'name' => "Technical Specification - {$product->name}",
                'type' => 'file',
                'category' => 'technical',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['MKT', 'PUR']),
                'access_level' => 'read',
                'product_id' => $product->id,
                'batch_id' => null,
                'file_path' => "documents/specifications/tech_spec_{$product->id}.pdf",
                'file_size' => rand(500000, 2000000),
                'mime_type' => 'application/pdf',
                'version' => 1,
                'is_required' => true,
                'deadline' => now()->addMonths(rand(1, 12)),
                'status' => 'active',
                'notes' => "Technical specification document for {$product->name}",
                'created_at' => now()->subDays(rand(1, 90)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ];

            // User Manual
            $documents[] = [
                'id' => Str::uuid(),
                'name' => "User Manual - {$product->name}",
                'type' => 'file',
                'category' => 'technical',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['MKT', 'COM']),
                'access_level' => 'read_edit',
                'product_id' => $product->id,
                'batch_id' => null,
                'file_path' => "documents/manuals/user_manual_{$product->id}.pdf",
                'file_size' => rand(1000000, 5000000),
                'mime_type' => 'application/pdf',
                'version' => rand(1, 3),
                'is_required' => true,
                'deadline' => now()->addMonths(rand(3, 18)),
                'status' => 'active',
                'notes' => "Comprehensive user manual for {$product->name}",
                'created_at' => now()->subDays(rand(1, 90)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ];

            // Quality Certificate
            if ($index % 2 == 0) {
                $documents[] = [
                    'id' => Str::uuid(),
                    'name' => "Quality Certificate - {$product->name}",
                    'type' => 'file',
                    'category' => 'quality_control',
                    'primary_owner_department' => 'RND',
                    'secondary_access_departments' => json_encode(['LEG', 'MKT']),
                    'access_level' => 'read',
                    'product_id' => $product->id,
                    'batch_id' => null,
                    'file_path' => "documents/certificates/quality_cert_{$product->id}.pdf",
                    'file_size' => rand(200000, 800000),
                    'mime_type' => 'application/pdf',
                    'version' => 1,
                    'is_required' => true,
                    'deadline' => now()->addYear(),
                    'status' => 'active',
                    'notes' => "ISO quality certificate for {$product->name}",
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now()->subDays(rand(0, 30)),
                ];
            }
        }

        // Batch-related documents
        foreach ($batches as $index => $batch) {
            // Batch Production Record
            $documents[] = [
                'id' => Str::uuid(),
                'name' => "Batch Record - {$batch->batch_number}",
                'type' => 'file',
                'category' => 'batch_documentation',
                'primary_owner_department' => 'WH',
                'secondary_access_departments' => json_encode(['RND', 'PUR']),
                'access_level' => 'read_edit',
                'product_id' => $batch->product_id,
                'batch_id' => $batch->id,
                'file_path' => "documents/batch_records/batch_record_{$batch->id}.pdf",
                'file_size' => rand(300000, 1500000),
                'mime_type' => 'application/pdf',
                'version' => rand(1, 2),
                'is_required' => true,
                'deadline' => $batch->expiry_date ? $batch->expiry_date->subMonths(1) : now()->addMonths(6),
                'status' => 'active',
                'notes' => "Production record for batch {$batch->batch_number}",
                'created_at' => $batch->created_at,
                'updated_at' => now()->subDays(rand(0, 15)),
            ];

            // Quality Test Report
            $documents[] = [
                'id' => Str::uuid(),
                'name' => "Quality Test Report - {$batch->batch_number}",
                'type' => 'file',
                'category' => 'quality_control',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['WH', 'LEG']),
                'access_level' => 'read',
                'product_id' => $batch->product_id,
                'batch_id' => $batch->id,
                'file_path' => "documents/test_reports/quality_test_{$batch->id}.pdf",
                'file_size' => rand(400000, 1200000),
                'mime_type' => 'application/pdf',
                'version' => 1,
                'is_required' => true,
                'deadline' => now()->addMonths(3),
                'status' => 'active',
                'notes' => "Quality control test results for batch {$batch->batch_number}",
                'created_at' => $batch->created_at->addDays(1),
                'updated_at' => now()->subDays(rand(0, 10)),
            ];

            // Batch Certificate of Analysis (CoA)
            if ($index % 3 == 0) {
                $documents[] = [
                    'id' => Str::uuid(),
                    'name' => "Certificate of Analysis - {$batch->batch_number}",
                    'type' => 'file',
                    'category' => 'quality_control',
                    'primary_owner_department' => 'RND',
                    'secondary_access_departments' => json_encode(['WH', 'MKT', 'LEG']),
                    'access_level' => 'read',
                    'product_id' => $batch->product_id,
                    'batch_id' => $batch->id,
                    'file_path' => "documents/certificates/coa_{$batch->id}.pdf",
                    'file_size' => rand(250000, 900000),
                    'mime_type' => 'application/pdf',
                    'version' => 1,
                    'is_required' => true,
                    'deadline' => $batch->expiry_date ?? now()->addYear(),
                    'status' => 'active',
                    'notes' => "Certificate of Analysis confirming quality standards for batch {$batch->batch_number}",
                    'created_at' => $batch->created_at->addDays(2),
                    'updated_at' => now()->subDays(rand(0, 5)),
                ];
            }

            // Packaging Checklist
            if ($index % 4 == 0) {
                $documents[] = [
                    'id' => Str::uuid(),
                    'name' => "Packaging Checklist - {$batch->batch_number}",
                    'type' => 'file',
                    'category' => 'production',
                    'primary_owner_department' => 'WH',
                    'secondary_access_departments' => json_encode(['RND']),
                    'access_level' => 'read_edit',
                    'product_id' => $batch->product_id,
                    'batch_id' => $batch->id,
                    'file_path' => "documents/checklists/packaging_checklist_{$batch->id}.xlsx",
                    'file_size' => rand(50000, 200000),
                    'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'version' => rand(1, 2),
                    'is_required' => false,
                    'deadline' => now()->addMonths(2),
                    'status' => 'active',
                    'notes' => "Packaging quality checklist for batch {$batch->batch_number}",
                    'created_at' => $batch->created_at->addDays(rand(1, 3)),
                    'updated_at' => now()->subDays(rand(0, 7)),
                ];
            }
        }

        // General company documents
        $generalDocs = [
            [
                'name' => 'Quality Management System Manual',
                'type' => 'file',
                'category' => 'quality_control',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['LEG', 'WH', 'MKT']),
                'access_level' => 'read',
                'file_path' => 'documents/manuals/qms_manual.pdf',
                'file_size' => 5500000,
                'mime_type' => 'application/pdf',
                'is_required' => true,
                'deadline' => now()->addYear(),
                'notes' => 'Comprehensive quality management system documentation'
            ],
            [
                'name' => 'Standard Operating Procedures',
                'type' => 'file',
                'category' => 'production',
                'primary_owner_department' => 'WH',
                'secondary_access_departments' => json_encode(['RND', 'PUR']),
                'access_level' => 'read_edit',
                'file_path' => 'documents/procedures/sop_production.pdf',
                'file_size' => 3200000,
                'mime_type' => 'application/pdf',
                'is_required' => true,
                'deadline' => now()->addMonths(6),
                'notes' => 'Standard operating procedures for production processes'
            ],
            [
                'name' => 'Supplier Quality Agreement Template',
                'type' => 'file',
                'category' => 'commercial',
                'primary_owner_department' => 'PUR',
                'secondary_access_departments' => json_encode(['LEG', 'RND']),
                'access_level' => 'read_edit',
                'file_path' => 'documents/contracts/supplier_qa_template.docx',
                'file_size' => 450000,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'is_required' => false,
                'deadline' => now()->addMonths(8),
                'notes' => 'Template for supplier quality agreements'
            ],
            [
                'name' => 'Safety Data Sheets Compilation',
                'type' => 'file',
                'category' => 'safety',
                'primary_owner_department' => 'LEG',
                'secondary_access_departments' => json_encode(['RND', 'WH', 'PUR']),
                'access_level' => 'read',
                'file_path' => 'documents/safety/sds_compilation.pdf',
                'file_size' => 8900000,
                'mime_type' => 'application/pdf',
                'is_required' => true,
                'deadline' => now()->addMonths(3),
                'notes' => 'Collection of safety data sheets for all materials'
            ],
            [
                'name' => 'Environmental Impact Assessment',
                'type' => 'file',
                'category' => 'environmental',
                'primary_owner_department' => 'LEG',
                'secondary_access_departments' => json_encode(['RND', 'WH']),
                'access_level' => 'read',
                'file_path' => 'documents/environmental/eia_report.pdf',
                'file_size' => 6700000,
                'mime_type' => 'application/pdf',
                'is_required' => true,
                'deadline' => now()->addYear(),
                'notes' => 'Environmental impact assessment for company operations'
            ],
            [
                'name' => 'Training Materials - GMP',
                'type' => 'file',
                'category' => 'training',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['WH', 'PUR']),
                'access_level' => 'read',
                'file_path' => 'documents/training/gmp_training.pptx',
                'file_size' => 15600000,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'is_required' => false,
                'deadline' => now()->addMonths(4),
                'notes' => 'Good Manufacturing Practice training materials'
            ],
            [
                'name' => 'Maintenance Schedule Template',
                'type' => 'file',
                'category' => 'maintenance',
                'primary_owner_department' => 'WH',
                'secondary_access_departments' => json_encode(['RND']),
                'access_level' => 'read_edit',
                'file_path' => 'documents/maintenance/maintenance_schedule.xlsx',
                'file_size' => 280000,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'is_required' => false,
                'deadline' => now()->addMonths(12),
                'notes' => 'Template for equipment maintenance scheduling'
            ],
            [
                'name' => 'Audit Checklist - Internal',
                'type' => 'file',
                'category' => 'quality_control',
                'primary_owner_department' => 'RND',
                'secondary_access_departments' => json_encode(['LEG', 'WH']),
                'access_level' => 'read_edit',
                'file_path' => 'documents/audits/internal_audit_checklist.xlsx',
                'file_size' => 320000,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'is_required' => true,
                'deadline' => now()->addMonths(2),
                'notes' => 'Internal audit checklist for quality management system'
            ],
        ];

        foreach ($generalDocs as $docData) {
            $documents[] = array_merge([
                'id' => Str::uuid(),
                'product_id' => null,
                'batch_id' => null,
                'version' => 1,
                'status' => 'active',
                'created_at' => now()->subDays(rand(10, 120)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ], $docData);
        }

        // Some expired/near deadline documents
        for ($i = 0; $i < 5; $i++) {
            $documents[] = [
                'id' => Str::uuid(),
                'name' => "Expired Certificate " . ($i + 1),
                'type' => 'file',
                'category' => 'regulatory',
                'primary_owner_department' => $departments[array_rand($departments)],
                'secondary_access_departments' => json_encode([$departments[array_rand($departments)]]),
                'access_level' => 'read',
                'product_id' => null,
                'batch_id' => null,
                'file_path' => "documents/expired/expired_cert_" . ($i + 1) . ".pdf",
                'file_size' => rand(200000, 800000),
                'mime_type' => 'application/pdf',
                'version' => 1,
                'is_required' => true,
                'deadline' => now()->subDays(rand(1, 30)), // Expired
                'status' => 'expired',
                'notes' => "Certificate that has expired and needs renewal",
                'created_at' => now()->subDays(rand(180, 365)),
                'updated_at' => now()->subDays(rand(30, 90)),
            ];
        }

        // Insert all documents
        foreach (array_chunk($documents, 50) as $chunk) {
            Document::insert($chunk);
        }

        $this->command->info('Created ' . count($documents) . ' diverse documents including batch documentation.');
    }
}
