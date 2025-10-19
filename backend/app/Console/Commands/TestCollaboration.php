<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DepartmentService;

class TestCollaboration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:collaboration';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test collaboration matrix functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing collaboration matrix...');
        
        try {
            $service = new DepartmentService();
            $result = $service->getDepartmentCollaboration();
            
            $this->info('Result structure:');
            $this->line(json_encode($result, JSON_PRETTY_PRINT));
            
            $this->info("\nSummary:");
            $this->line("Matrix count: " . count($result['matrix'] ?? []));
            $this->line("Summary exists: " . (isset($result['summary']) ? 'Yes' : 'No'));
            $this->line("Departments count: " . count($result['departments'] ?? []));
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error("File: " . $e->getFile());
            $this->error("Line: " . $e->getLine());
        }
    }
}
