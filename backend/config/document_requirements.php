<?php

return [
    /**
     * Document Requirements Matrix theo Implementation Plan
     * 
     * Định nghĩa danh sách tài liệu bắt buộc/không bắt buộc cho từng phòng ban
     * Separate từ việc quản lý file upload thực tế
     */
    'categories' => [
        'product_info' => [
            'name' => 'Thông tin sản phẩm',
            'description' => 'Thông tin cơ bản về sản phẩm (SKU, tên, mô tả, thành phần, công dụng, HDSD)',
            'primary_owner' => 'RND',
            'secondary_access' => ['MKT', 'ECOM'],
            'is_required' => true,
            'deadline_days' => 0, // Ngay khi tạo
            'file_types' => ['pdf', 'doc', 'docx'],
            'max_file_size_mb' => 10,
        ],
        
        'product_images_videos' => [
            'name' => 'Hình ảnh/Video gốc',
            'description' => 'Hình ảnh và video gốc của sản phẩm chất lượng cao',
            'primary_owner' => 'RND',
            'secondary_access' => ['MKT', 'ECOM', 'COM'],
            'is_required' => true,
            'deadline_days' => 1, // 24h
            'file_types' => ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'avi'],
            'max_file_size_mb' => 100,
        ],
        
        'product_certificates' => [
            'name' => 'Giấy tờ sản phẩm',
            'description' => 'Giấy chứng nhận, giấy phép, chứng chỉ chất lượng sản phẩm',
            'primary_owner' => 'RND',
            'secondary_access' => ['LEG'],
            'is_required' => false,
            'deadline_days' => 45, // 30-60 ngày
            'file_types' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_file_size_mb' => 10,
        ],
        
        'batch_documents' => [
            'name' => 'Giấy tờ lô hàng',
            'description' => 'Chứng từ nhập khẩu, CO, Bill of Lading, Invoice, Packing List',
            'primary_owner' => 'PUR',
            'secondary_access' => ['WH', 'LEG'],
            'is_required' => true,
            'deadline_days' => 5, // 3-7 ngày
            'file_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
            'max_file_size_mb' => 15,
        ],
        
        'marketing_content' => [
            'name' => 'Content Marketing',
            'description' => 'Nội dung marketing, brochure, catalog, video quảng cáo',
            'primary_owner' => 'MKT',
            'secondary_access' => ['ECOM', 'COM'],
            'is_required' => true,
            'deadline_days' => 3, // 48-72h
            'file_types' => ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'mp4', 'mov'],
            'max_file_size_mb' => 50,
        ],
        
        'ecommerce_content' => [
            'name' => 'Content E-commerce',
            'description' => 'Mô tả sản phẩm cho website, hình ảnh banner, content bán hàng online',
            'primary_owner' => 'ECOM',
            'secondary_access' => ['MKT'],
            'is_required' => true,
            'deadline_days' => 3, // 48-72h
            'file_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
            'max_file_size_mb' => 20,
        ],
        
        'communication_content' => [
            'name' => 'Content Truyền thông',
            'description' => 'Press release, bài viết PR, content social media',
            'primary_owner' => 'COM',
            'secondary_access' => ['MKT'],
            'is_required' => false,
            'deadline_days' => 2, // 24-72h
            'file_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'mp4'],
            'max_file_size_mb' => 30,
        ],
        
        'legal_documents' => [
            'name' => 'Tài liệu pháp lý',
            'description' => 'Hợp đồng, thỏa thuận pháp lý, giấy phép kinh doanh liên quan',
            'primary_owner' => 'LEG',
            'secondary_access' => ['RND', 'PUR'],
            'is_required' => false,
            'deadline_days' => null, // Variable
            'file_types' => ['pdf', 'doc', 'docx'],
            'max_file_size_mb' => 10,
        ],
        
        'warehouse_documents' => [
            'name' => 'Tài liệu kho bãi',
            'description' => 'Phiếu nhập kho, phiếu xuất kho, báo cáo tồn kho',
            'primary_owner' => 'WH',
            'secondary_access' => ['PUR'],
            'is_required' => true,
            'deadline_days' => 7, // 7 ngày
            'file_types' => ['pdf', 'xls', 'xlsx', 'doc', 'docx'],
            'max_file_size_mb' => 5,
        ],
    ],

    /**
     * Department codes mapping
     */
    'departments' => [
        'RND' => 'Research & Development',
        'MKT' => 'Marketing',
        'ECOM' => 'E-commerce', 
        'PUR' => 'Purchasing',
        'LEG' => 'Legal',
        'WH' => 'Warehouse',
        'COM' => 'Communication',
    ],

    /**
     * Document requirement rules by product type or department
     */
    'requirement_rules' => [
        // Tất cả sản phẩm đều cần các tài liệu cơ bản
        'all_products' => [
            'required_categories' => [
                'product_info',
                'product_images_videos',
            ]
        ],
        
        // Sản phẩm nhập khẩu cần thêm tài liệu lô hàng
        'imported_products' => [
            'additional_required' => [
                'batch_documents',
                'legal_documents', // Override: required for imported products
            ]
        ],
        
        // Sản phẩm có marketing campaign
        'marketing_products' => [
            'additional_required' => [
                'marketing_content',
                'ecommerce_content',
            ]
        ],
        
        // Rules theo department chính của sản phẩm
        'by_primary_department' => [
            'RND' => [
                'required_categories' => [
                    'product_info',
                    'product_images_videos',
                    'product_certificates',
                ]
            ],
            'PUR' => [
                'required_categories' => [
                    'batch_documents',
                    'warehouse_documents',
                ]
            ],
            'MKT' => [
                'required_categories' => [
                    'marketing_content',
                    'ecommerce_content',
                ]
            ],
            'ECOM' => [
                'required_categories' => [
                    'ecommerce_content',
                ]
            ],
            'LEG' => [
                'required_categories' => [
                    'legal_documents',
                ]
            ],
            'WH' => [
                'required_categories' => [
                    'warehouse_documents',
                ]
            ],
            'COM' => [
                'required_categories' => [
                    'communication_content',
                ]
            ],
        ]
    ],

    /**
     * Access level definitions
     */
    'access_levels' => [
        'read' => 'Chỉ xem',
        'read_comment' => 'Xem và comment',
        'read_edit' => 'Xem, comment và chỉnh sửa',
        'full_control' => 'Toàn quyền (Primary Owner)',
    ],

    /**
     * Priority levels for document requirements
     */
    'priority_levels' => [
        'critical' => [
            'name' => 'Bắt buộc ngay',
            'deadline_days' => 0,
            'categories' => ['product_info']
        ],
        'high' => [
            'name' => 'Ưu tiên cao',
            'deadline_days' => 3,
            'categories' => ['product_images_videos', 'batch_documents', 'marketing_content', 'ecommerce_content']
        ],
        'medium' => [
            'name' => 'Ưu tiên trung bình',
            'deadline_days' => 7,
            'categories' => ['warehouse_documents']
        ],
        'low' => [
            'name' => 'Ưu tiên thấp',
            'deadline_days' => 30,
            'categories' => ['product_certificates', 'communication_content', 'legal_documents']
        ],
    ],
];