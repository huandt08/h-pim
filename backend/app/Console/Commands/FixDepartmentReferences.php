<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixDepartmentReferences extends Command
{
    protected $signature = 'fix:department-references';
    protected $description = 'Fix department_code references to department';

    public function handle()
    {
        $files = [
            'app/Http/Controllers/Api/ProductController.php',
            'app/Http/Controllers/Api/DocumentController.php', 
            'app/Http/Controllers/Api/DepartmentController.php',
            'app/Http/Controllers/Api/AlertController.php',
            'app/Http/Controllers/Api/UserController.php',
        ];

        foreach ($files as $file) {
            $path = base_path($file);
            if (file_exists($path)) {
                $content = file_get_contents($path);
                
                // Replace $user->department_code with $user->department
                $content = str_replace('$user->department_code', '$user->department', $content);
                
                // Replace User::where('department_code' with User::where('department'
                $content = str_replace("User::where('department_code'", "User::where('department'", $content);
                
                // Replace where('department_code' with where('department'
                $content = str_replace("where('department_code'", "where('department'", $content);
                
                // Replace 'department_code' => with 'department' =>
                $content = str_replace("'department_code' =>", "'department' =>", $content);
                
                file_put_contents($path, $content);
                $this->info("Fixed: $file");
            }
        }
        
        $this->info('All department references fixed!');
        return 0;
    }
}
