<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Batch;
use App\Models\Product;
use Carbon\Carbon;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all products to assign batches to
        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->warn('No products found. Please run ProductSeeder first.');
            return;
        }

        // Sample suppliers
        $suppliers = [
            'Công ty TNHH ABC Manufacturing',
            'Nhà máy sản xuất XYZ',
            'Công ty Cổ phần DEF Industries',
            'Xí nghiệp sản xuất GHI',
            'Công ty TNHH JKL Production',
            'Nhà máy MNO Co., Ltd',
            'Công ty Cổ phần PQR Manufacturing',
            'Xí nghiệp STU Industries',
            'Công ty TNHH VWX Production',
            'Nhà máy YZ Manufacturing'
        ];

        // Sample units
        $units = ['pieces', 'kg', 'liters', 'boxes', 'bottles', 'packets'];

        // Sample warehouse notes
        $warehouseNotes = [
            'Bảo quản nơi khô ráo, thoáng mát',
            'Tránh ánh nắng trực tiếp',
            'Bảo quản ở nhiệt độ từ 15-25°C',
            'Để xa tầm tay trẻ em',
            'Không được để đông lạnh',
            'Bảo quản trong điều kiện bình thường',
            'Tránh độ ẩm cao',
            'Lưu trữ theo quy định FIFO',
            'Kiểm tra định kỳ hạn sử dụng',
            'Bảo quản theo hướng dẫn nhà sản xuất'
        ];

        // Sample batch statuses
        $statuses = ['incoming', 'stored', 'shipped', 'expired'];

        $batches = [];

        for ($i = 1; $i <= 20; $i++) {
            $product = $products->random();
            $productionDate = Carbon::now()->subDays(rand(1, 365));
            $expiryDate = $productionDate->copy()->addDays(rand(180, 1095)); // 6 months to 3 years shelf life
            
            // Generate batch number based on product code and date
            $batchNumber = strtoupper($product->code) . '-' . $productionDate->format('Ymd') . '-' . str_pad($i, 3, '0', STR_PAD_LEFT);
            
            // Determine status based on dates
            $status = 'stored'; // Default status
            if ($expiryDate->isPast()) {
                $status = 'expired';
            } elseif (rand(0, 100) < 20) { // 20% chance of being shipped
                $status = 'shipped';
            } elseif (rand(0, 100) < 10) { // 10% chance of being incoming
                $status = 'incoming';
            }

            $batches[] = [
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'batch_number' => $batchNumber,
                'product_id' => $product->id,
                'production_date' => $productionDate->format('Y-m-d'),
                'expiry_date' => $expiryDate->format('Y-m-d'),
                'quantity' => rand(50, 5000),
                'unit' => $units[array_rand($units)],
                'supplier' => $suppliers[array_rand($suppliers)],
                'warehouse_notes' => $warehouseNotes[array_rand($warehouseNotes)],
                'status' => $status,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all batches at once for better performance
        Batch::insert($batches);

        $this->command->info('Created 20 batch records successfully!');
        
        // Display some statistics
        $totalBatches = Batch::count();
        $expiredBatches = Batch::where('status', 'expired')->count();
        $storedBatches = Batch::where('status', 'stored')->count();
        $shippedBatches = Batch::where('status', 'shipped')->count();
        $incomingBatches = Batch::where('status', 'incoming')->count();
        
        $this->command->table(
            ['Status', 'Count'],
            [
                ['Total Batches', $totalBatches],
                ['Stored', $storedBatches],
                ['Shipped', $shippedBatches],
                ['Incoming', $incomingBatches],
                ['Expired', $expiredBatches],
            ]
        );
    }
}
