<?php

namespace App\Console\Commands;

use App\Models\Document;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DocumentStats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documents:stats';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Display document statistics';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== DOCUMENT STATISTICS ===');
        $this->line('Total documents: ' . Document::count());
        $this->newLine();
        
        $this->info('By Category:');
        $categories = Document::select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();
        
        foreach ($categories as $cat) {
            $this->line("  {$cat->category}: {$cat->count}");
        }
        $this->newLine();
        
        $this->info('By Type:');
        $types = Document::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get();
        
        foreach ($types as $type) {
            $this->line("  {$type->type}: {$type->count}");
        }
        $this->newLine();
        
        $this->info('Special Categories:');
        $this->line('  Batch-related docs: ' . Document::whereNotNull('batch_id')->count());
        $this->line('  Product-related docs: ' . Document::whereNotNull('product_id')->count());
        $this->line('  General company docs: ' . Document::whereNull('batch_id')->whereNull('product_id')->count());
        $this->line('  Required docs: ' . Document::where('is_required', true)->count());
        $this->line('  Expired docs: ' . Document::where('status', 'expired')->count());
        $this->newLine();
        
        $this->info('Recent batch documents (sample):');
        $batchDocs = Document::with('batch')->whereNotNull('batch_id')->take(5)->get();
        foreach ($batchDocs as $doc) {
            $batchNumber = $doc->batch ? $doc->batch->batch_number : 'N/A';
            $this->line("  {$doc->name} (Batch: {$batchNumber})");
        }
        
        return Command::SUCCESS;
    }
}
