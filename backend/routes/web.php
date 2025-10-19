<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add a login route to prevent route not found errors
Route::get('/login', function () {
    return response()->json([
        'message' => 'This is an API-only application. Please use /api/auth/login endpoint.'
    ], 200);
})->name('login');
