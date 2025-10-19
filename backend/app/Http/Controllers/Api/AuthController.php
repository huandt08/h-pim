<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated'
            ], 401);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Log login activity
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('User logged in');

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department,
                    'role' => $user->role,
                    'cross_department_access' => $user->cross_department_access ? json_decode($user->cross_department_access) : null,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'department' => 'required|string|in:RND,MKT,ECOM,PUR,LEG,WH,COM',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department' => $request->department,
            'role' => 'member', // Default role
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Log registration activity
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('User registered');

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department,
                    'role' => $user->role,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Log logout activity
        activity()
            ->performedOn($user)
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('User logged out');

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department,
                    'role' => $user->role,
                    'cross_department_access' => $user->cross_department_access ? json_decode($user->cross_department_access) : null,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]
        ]);
    }
}