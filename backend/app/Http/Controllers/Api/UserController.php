<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get current user profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['department']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'department' => $user->department,
                'department' => $user->department,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'roles' => $user->getRoleNames()
            ]
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ]
        ]);

        try {
            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh(['department'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile'
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        try {
            $user->update([
                'password' => Hash::make($validated['password'])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password'
            ], 500);
        }
    }

    /**
     * Get users in department (for managers)
     */
    public function departmentUsers(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if user has permission to view department users
        if (!$user->can('view_department_users')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $users = User::where('department', $user->department)
            ->with(['department', 'roles'])
            ->get()
            ->map(function ($departmentUser) {
                return [
                    'id' => $departmentUser->id,
                    'name' => $departmentUser->name,
                    'email' => $departmentUser->email,
                    'roles' => $departmentUser->getRoleNames(),
                    'created_at' => $departmentUser->created_at,
                    'email_verified_at' => $departmentUser->email_verified_at
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $users,
            'meta' => [
                'department' => $user->department,
                'total' => $users->count()
            ]
        ]);
    }

    /**
     * Search users across departments (for admins)
     */
    public function search(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if user has permission to search all users
        if (!$user->can('search_all_users')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $request->validate([
            'q' => 'required|string|min:2',
            'department' => 'nullable|string|exists:departments,code'
        ]);

        $query = User::query()->with(['department', 'roles']);
        $searchTerm = $request->input('q');

        $query->where(function($q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('email', 'like', "%{$searchTerm}%");
        });

        if ($request->has('department')) {
            $query->where('department', $request->input('department'));
        }

        $users = $query->get()->map(function ($foundUser) {
            return [
                'id' => $foundUser->id,
                'name' => $foundUser->name,
                'email' => $foundUser->email,
                'department' => $foundUser->department_code,
                'department' => $foundUser->department,
                'roles' => $foundUser->getRoleNames(),
                'created_at' => $foundUser->created_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users,
            'meta' => [
                'query' => $searchTerm,
                'total' => $users->count(),
                'department_filter' => $request->input('department')
            ]
        ]);
    }

    /**
     * Get user activity summary
     */
    public function activitySummary(Request $request): JsonResponse
    {
        $user = $request->user();

        $summary = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'department' => $user->department
            ],
            'recent_activities' => $user->activities()
                ->with(['subject', 'causer'])
                ->latest()
                ->limit(20)
                ->get(),
            'stats' => [
                'total_activities' => $user->activities()->count(),
                'today_activities' => $user->activities()
                    ->whereDate('created_at', today())
                    ->count(),
                'this_week_activities' => $user->activities()
                    ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->count()
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    /**
     * Get user permissions
     */
    public function permissions(Request $request): JsonResponse
    {
        $user = $request->user();

        $permissions = [
            'direct_permissions' => $user->getDirectPermissions()->pluck('name'),
            'role_permissions' => $user->getPermissionsViaRoles()->pluck('name'),
            'all_permissions' => $user->getAllPermissions()->pluck('name'),
            'roles' => $user->getRoleNames()
        ];

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }

    /**
     * Get user dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentCode = $user->department;

        // Get counts for user's department involvement
        $dashboard = [
            'user_info' => [
                'name' => $user->name,
                'department' => $user->department,
                'roles' => $user->getRoleNames()
            ],
            'quick_stats' => [
                'products_accessible' => \App\Models\Product::accessibleByDepartment($departmentCode)->count(),
                'documents_accessible' => \App\Models\Document::accessibleByDepartment($departmentCode)->count(),
                'alerts_assigned' => \App\Models\Alert::forDepartment($departmentCode)->where('status', '!=', 'resolved')->count(),
                'recent_activities' => $user->activities()->count()
            ],
            'recent_alerts' => \App\Models\Alert::forDepartment($departmentCode)
                ->where('status', '!=', 'resolved')
                ->with(['product', 'document'])
                ->orderBy('priority', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
            'recent_activities' => $user->activities()
                ->with(['subject'])
                ->latest()
                ->limit(10)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $dashboard
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout'
            ], 500);
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        try {
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out from all devices successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout from all devices'
            ], 500);
        }
    }

    /**
     * Get user's active sessions
     */
    public function activeSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $sessions = $user->tokens()->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
                'is_current' => $token->id === request()->user()->currentAccessToken()->id
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $sessions,
            'meta' => [
                'total' => $sessions->count()
            ]
        ]);
    }

    /**
     * Revoke specific session
     */
    public function revokeSession(Request $request, string $tokenId): JsonResponse
    {
        $user = $request->user();
        
        $token = $user->tokens()->find($tokenId);
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found'
            ], 404);
        }

        // Don't allow revoking current session
        if ($token->id === $user->currentAccessToken()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot revoke current session. Use logout instead.'
            ], 422);
        }

        try {
            $token->delete();

            return response()->json([
                'success' => true,
                'message' => 'Session revoked successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke session'
            ], 500);
        }
    }
}