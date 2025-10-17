# PIM System - Tech Stack Specification

## Tổng quan Architecture
```
Frontend (React + Ant Design) ↔ REST API ↔ Backend (Laravel + Filament) ↔ Database + Local Storage
```

## Backend Architecture

### Core Framework: Laravel 10+
**AI Agent Implementation Guidelines:**

#### 1. Project Setup Commands
```bash
# Khởi tạo Laravel project
composer create-project laravel/laravel pim-backend
cd pim-backend

# Cài đặt dependencies cần thiết
composer require filament/filament:"^3.0"
composer require spatie/laravel-permission
composer require spatie/laravel-activitylog
composer require league/flysystem-aws-s3-v3
```

#### 2. Database Configuration
```php
// config/database.php - Cấu hình database connection
'default' => env('DB_CONNECTION', 'mysql'),

'connections' => [
    'mysql' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'database' => env('DB_DATABASE', 'pim_database'),
        'username' => env('DB_USERNAME', 'forge'),
        'password' => env('DB_PASSWORD', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'strict' => true,
    ],
]
```

#### 3. Model Structure Standards
```php
// app/Models/Product.php - Mẫu Model chuẩn
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category_id',
        'status',
        'attributes',
    ];

    protected $casts = [
        'attributes' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'description'])
            ->logOnlyDirty();
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
```

### Filament Admin Panel

#### 1. Installation & Configuration
```php
// Sau khi cài đặt Filament, tạo user admin
php artisan make:filament-user

// app/Providers/Filament/AdminPanelProvider.php
<?php

namespace App\Providers\Filament;

use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Amber,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Pages\Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
                Widgets\FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
```

#### 2. Resource Creation Template
```php
// app/Filament/Resources/ProductResource.php
<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-cube';
    protected static ?string $navigationGroup = 'Product Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('code')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(100),
                Forms\Components\Textarea::make('description')
                    ->rows(3),
                Forms\Components\Select::make('category_id')
                    ->relationship('category', 'name')
                    ->required(),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ])
                    ->default('draft'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'draft',
                        'success' => 'active',
                        'danger' => 'inactive',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'active' => 'Active',
                        'inactive' => 'Inactive',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'view' => Pages\ViewProduct::route('/{record}'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
```

### API Development Standards

#### 1. API Controller Template
```php
// app/Http/Controllers/Api/ProductController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category']);
        
        // Filtering
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Searching
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }
        
        // Pagination
        $products = $query->paginate($request->get('per_page', 15));
        
        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:products',
            'category_id' => 'required|exists:categories,id',
            'status' => 'in:draft,active,inactive',
        ]);

        $product = Product::create($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $product->load('category'),
            'message' => 'Product created successfully'
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $product->load(['category'])
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:products,code,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'status' => 'in:draft,active,inactive',
        ]);

        $product->update($request->all());
        
        return response()->json([
            'success' => true,
            'data' => $product->load('category'),
            'message' => 'Product updated successfully'
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}
```

#### 2. API Routes Configuration
```php
// routes/api.php
<?php

use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    // Authentication routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::apiResource('categories', CategoryController::class);
        
        // Bulk operations
        Route::post('/products/bulk-delete', [ProductController::class, 'bulkDelete']);
        Route::post('/products/bulk-update', [ProductController::class, 'bulkUpdate']);
        
        // Export/Import
        Route::get('/products/export', [ProductController::class, 'export']);
        Route::post('/products/import', [ProductController::class, 'import']);
    });
});
```

### Local Storage Integration

#### 1. Storage Configuration
```php
// config/filesystems.php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'throw' => false,
    ],

    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
        'throw' => false,
    ],

    'products' => [
        'driver' => 'local',
        'root' => storage_path('app/products'),
        'url' => env('APP_URL').'/storage/products',
        'visibility' => 'public',
    ],
],
```

#### 2. File Upload Service
```php
// app/Services/FileUploadService.php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    public function uploadProductImage(UploadedFile $file, string $productCode): array
    {
        $filename = Str::uuid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = "products/{$productCode}/images/{$filename}";
        
        Storage::disk('public')->putFileAs(
            "products/{$productCode}/images",
            $file,
            $filename
        );
        
        return [
            'filename' => $filename,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    public function uploadProductDocument(UploadedFile $file, string $productCode): array
    {
        $filename = Str::uuid() . '_' . $file->getClientOriginalName();
        $path = "products/{$productCode}/documents/{$filename}";
        
        Storage::disk('local')->putFileAs(
            "products/{$productCode}/documents",
            $file,
            $filename
        );
        
        return [
            'filename' => $filename,
            'path' => $path,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    public function deleteFile(string $path, string $disk = 'public'): bool
    {
        return Storage::disk($disk)->delete($path);
    }
}
```

## Frontend Architecture

### Core Framework: React 18+

#### 1. Project Setup Commands
```bash
# Khởi tạo React project với Vite
npm create vite@latest pim-frontend -- --template react-ts
cd pim-frontend

# Cài đặt dependencies
npm install antd @ant-design/icons
npm install axios react-router-dom
npm install @tanstack/react-query
npm install zustand
npm install dayjs
npm install @types/node --save-dev
```

#### 2. Project Structure
```
src/
├── components/           # Reusable components
│   ├── common/          # Common UI components
│   ├── forms/           # Form components
│   └── layouts/         # Layout components
├── pages/               # Page components
│   ├── products/        # Product management pages
│   ├── categories/      # Category management pages
│   └── dashboard/       # Dashboard pages
├── services/            # API services
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── utils/               # Utility functions
├── hooks/               # Custom hooks
└── constants/           # Application constants
```

### Ant Design Implementation Standards

#### 1. Theme Configuration
```tsx
// src/App.tsx
import { ConfigProvider, theme } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Button: {
            borderRadius: 6,
          },
          Input: {
            borderRadius: 6,
          },
          Table: {
            borderRadius: 8,
          },
        },
      }}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
```

#### 2. Layout Component Template
```tsx
// src/components/layouts/MainLayout.tsx
import React from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  ProductOutlined,
  FolderOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/products',
      icon: <ProductOutlined />,
      label: 'Products',
      onClick: () => navigate('/products'),
    },
    {
      key: '/categories',
      icon: <FolderOutlined />,
      label: 'Categories',
      onClick: () => navigate('/categories'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        theme="light"
        width={250}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h2>PIM System</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Breadcrumb />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
```

#### 3. Data Table Component Template
```tsx
// src/components/common/DataTable.tsx
import React from 'react';
import { Table, Button, Space, Input, Select, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Search } = Input;
const { Option } = Select;

interface DataTableProps extends TableProps<any> {
  title?: string;
  showAddButton?: boolean;
  onAdd?: () => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    onChange?: (value: string) => void;
  }>;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  showAddButton = true,
  onAdd,
  searchValue,
  onSearch,
  filters = [],
  ...tableProps
}) => {
  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16 
        }}>
          {title && <h2>{title}</h2>}
          {showAddButton && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAdd}
            >
              Add New
            </Button>
          )}
        </div>
        
        <Space style={{ marginBottom: 16 }}>
          {onSearch && (
            <Search
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              onSearch={onSearch}
              style={{ width: 250 }}
            />
          )}
          
          {filters.map((filter) => (
            <Select
              key={filter.key}
              placeholder={filter.label}
              value={filter.value}
              onChange={filter.onChange}
              style={{ width: 150 }}
              allowClear
            >
              {filter.options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          ))}
        </Space>
      </div>
      
      <Table
        {...tableProps}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
          ...tableProps.pagination,
        }}
      />
    </Card>
  );
};

export default DataTable;
```

#### 4. Form Component Template
```tsx
// src/components/forms/ProductForm.tsx
import React from 'react';
import { Form, Input, Select, Button, Row, Col, Upload, message } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import type { Product, Category } from '../../types';

const { TextArea } = Input;
const { Option } = Select;

interface ProductFormProps {
  initialValues?: Partial<Product>;
  categories: Category[];
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  categories,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      message.success('Product saved successfully');
      if (!initialValues) {
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to save product');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="code"
            label="Product Code"
            rules={[{ required: true, message: 'Please enter product code' }]}
          >
            <Input placeholder="Enter product code" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="draft">Draft</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <TextArea rows={4} placeholder="Enter product description" />
      </Form.Item>

      <Form.Item name="images" label="Product Images">
        <Upload
          multiple
          listType="picture"
          beforeUpload={() => false}
        >
          <Button icon={<UploadOutlined />}>Upload Images</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<SaveOutlined />}
          loading={loading}
          size="large"
        >
          Save Product
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;
```

### API Integration & State Management

#### 1. API Service Setup
```tsx
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 2. Product Service
```tsx
// src/services/productService.ts
import { apiClient } from './api';
import type { Product, ProductFilters } from '../types';

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
    const response = await apiClient.get('/products', { params: filters });
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await apiClient.post('/products', data);
    return response.data.data;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post('/products/bulk-delete', { ids });
  },
};
```

#### 3. Zustand Store Setup
```tsx
// src/stores/productStore.ts
import { create } from 'zustand';
import { productService } from '../services/productService';
import type { Product, ProductFilters } from '../types';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  
  // Actions
  fetchProducts: () => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  setPagination: (pagination: Partial<ProductStore['pagination']>) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    current: 1,
    pageSize: 15,
    total: 0,
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const response = await productService.getProducts({
        ...filters,
        page: pagination.current,
        per_page: pagination.pageSize,
      });
      
      set({
        products: response.data,
        pagination: {
          ...pagination,
          total: response.meta.total,
          current: response.meta.current_page,
        },
        loading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  createProduct: async (data) => {
    set({ loading: true });
    try {
      await productService.createProduct(data);
      await get().fetchProducts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create product',
        loading: false 
      });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true });
    try {
      await productService.updateProduct(id, data);
      await get().fetchProducts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update product',
        loading: false 
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await productService.deleteProduct(id);
      await get().fetchProducts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete product',
        loading: false 
      });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, current: 1 },
    }));
  },

  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },
}));
```

#### 4. React Query Integration (Alternative)
```tsx
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import type { ProductFilters } from '../types';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
```

### TypeScript Definitions

#### 1. Core Types
```tsx
// src/types/index.ts
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Product extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  category_id: string;
  category?: Category;
  status: 'draft' | 'active' | 'inactive';
  attributes?: Record<string, any>;
  images?: ProductImage[];
  documents?: ProductDocument[];
}

export interface Category extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
  products_count?: number;
}

export interface ProductImage extends BaseEntity {
  product_id: string;
  filename: string;
  path: string;
  url: string;
  alt_text?: string;
  sort_order: number;
}

export interface ProductDocument extends BaseEntity {
  product_id: string;
  filename: string;
  path: string;
  file_type: string;
  file_size: number;
  description?: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

## Development Guidelines cho AI Agent

### 1. Code Generation Rules
- **Luôn sử dụng TypeScript** cho frontend React
- **Tuân thủ PSR-12** coding standard cho PHP/Laravel
- **Sử dụng Ant Design components** thay vì tự tạo UI components
- **Implement proper error handling** ở cả frontend và backend
- **Follow RESTful API conventions** cho tất cả endpoints

### 2. Database Migration Templates
```php
// Mẫu migration cho products table
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->uuid('category_id');
            $table->enum('status', ['draft', 'active', 'inactive'])->default('draft');
            $table->json('attributes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('category_id')->references('id')->on('categories');
            $table->index(['status', 'category_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
```

### 3. Testing Requirements
```php
// Backend Test Template
<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_product(): void
    {
        $category = Category::factory()->create();
        
        $response = $this->postJson('/api/products', [
            'name' => 'Test Product',
            'code' => 'TEST001',
            'category_id' => $category->id,
            'status' => 'draft',
        ]);

        $response->assertStatus(201)
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'name' => 'Test Product',
                        'code' => 'TEST001',
                    ]
                ]);
    }
}
```

### 4. Frontend Testing Template
```tsx
// src/components/__tests__/ProductForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductForm from '../forms/ProductForm';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const mockCategories = [
  { id: '1', name: 'Category 1', code: 'CAT1' },
];

describe('ProductForm', () => {
  it('should render form fields correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm 
          categories={mockCategories}
          onSubmit={jest.fn()}
        />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Product Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('should submit form with correct data', async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    
    render(
      <QueryClientProvider client={queryClient}>
        <ProductForm 
          categories={mockCategories}
          onSubmit={mockOnSubmit}
        />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'Test Product' }
    });
    
    fireEvent.click(screen.getByText('Save Product'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product'
        })
      );
    });
  });
});
```

### 5. Environment Configuration

#### Backend (.env template)
```env
APP_NAME="PIM System"
APP_ENV=local
APP_KEY=base64:your-app-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pim_database
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

#### Frontend (.env template)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME="PIM System"
VITE_UPLOAD_MAX_SIZE=10485760
```

## Deployment Instructions

### 1. Backend Deployment
```bash
# Production setup commands
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link
```

### 2. Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Docker Configuration
```dockerfile
# Dockerfile for Laravel backend
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . /var/www

# Install dependencies
RUN composer install

# Set permissions
RUN chown -R www-data:www-data /var/www
```

Tài liệu này cung cấp framework hoàn chỉnh để AI agent có thể:
1. Thiết lập và phát triển backend Laravel với Filament
2. Xây dựng frontend React với Ant Design 
3. Tích hợp API và quản lý state
4. Thực hiện testing và deployment
5. Tuân thủ best practices cho cả hai môi trường

Mỗi section bao gồm code examples cụ thể và hướng dẫn implementation chi tiết để AI agent có thể thực hiện tasks một cách chính xác và nhất quán.