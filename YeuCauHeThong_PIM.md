# YÊU CẦU HỆ THỐNG PIM (PRODUCT INFORMATION MANAGEMENT)

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Mục đích
Xây dựng hệ thống quản lý thông tin sản phẩm tập trung, cho phép các phòng ban quản lý tài liệu, thông tin sản phẩm và lô hàng một cách có tổ chức và bảo mật.

### 1.2 Phạm vi
- Quản lý thông tin sản phẩm và lô hàng
- Quản lý tài liệu đa dạng (văn bản, hình ảnh, video, file)
- Phân quyền theo phòng ban
- Quản lý phiên bản tài liệu
- Giao diện quản trị và người dùng

## 2. QUẢN LÝ PHÒNG BAN

### 2.1 Danh sách phòng ban
| STT | Mã phòng ban | Tên phòng ban | Mô tả |
|-----|--------------|---------------|-------|
| 1   | RND          | Research & Development | Phòng nghiên cứu và phát triển |
| 2   | MKT          | Marketing | Phòng Marketing |
| 3   | ECOM         | E-commerce | Phòng Thương mại điện tử |
| 4   | PUR          | Purchasing | Phòng Mua hàng |
| 5   | LEG          | Legal | Phòng Pháp chế |
| 6   | WH           | Warehouse | Phòng Kho |
| 7   | COM          | Communication | Phòng Truyền thông |

### 2.2 Chức năng quản lý phòng ban
- Thêm/sửa/xóa phòng ban
- Quản lý danh sách nhân viên theo phòng ban
- Phân quyền truy cập tài liệu theo phòng ban

## 3. QUẢN LÝ SẢN PHẨM

### 3.1 Thông tin sản phẩm
```
- Mã SKU (duy nhất, tự động sinh hoặc nhập thủ công)
- Tên sản phẩm
- Mô tả ngắn gọn
- Danh mục sản phẩm
- Trạng thái (Đang phát triển, Đang bán, Ngừng bán)
- Ngày tạo
- Người tạo
- Ngày cập nhật cuối
- Người cập nhật cuối
```

### 3.2 Chức năng
- Thêm/sửa/xóa sản phẩm
- Tìm kiếm sản phẩm theo SKU, tên
- Xem lịch sử thay đổi
- Liên kết với lô hàng và tài liệu

## 4. QUẢN LÝ LÔ HÀNG

### 4.1 Thông tin lô hàng
```
- Mã lô hàng (duy nhất)
- SKU sản phẩm (liên kết)
- Số lượng
- Ngày sản xuất
- Hạn sử dụng
- Nhà cung cấp
- Số hợp đồng
- Giá nhập
- Trạng thái (Đang vận chuyển, Đã nhập kho, Đã xuất kho)
- Ghi chú
```

### 4.2 Chức năng
- Thêm/sửa lô hàng
- Liên kết tự động với tài liệu bắt buộc
- Theo dõi trạng thái lô hàng
- Báo cáo tồn kho theo lô

## 5. QUẢN LÝ TÀI LIỆU

### 5.1 Cấu trúc phân loại tài liệu

#### Cấp 1 - Theo phòng ban:
1. **RnD** - Research & Development
2. **Marketing** - Marketing
3. **ECOM** - E-commerce  
4. **Purchasing** - Mua hàng
5. **Legal** - Pháp chế
6. **Warehouse** - Kho
7. **Communication** - Truyền thông

#### Cấp 2 - Theo loại tài liệu:
1. **Thông tin sản phẩm**
2. **Hình ảnh/Video gốc**
3. **Giấy tờ sản phẩm**
4. **Giấy tờ về các lô hàng**
5. **Giấy tờ mua hàng**
6. **Giấy tờ bán hàng**
7. **Content Marketing**
8. **Content Truyền thông**
9. **Thông tin mô tả**

### 5.2 Chi tiết danh mục tài liệu

| Phòng ban | Phân loại tài liệu | Định dạng | Tên tài liệu | Bắt buộc | Mô tả |
|-----------|-------------------|-----------|--------------|----------|-------|
| **RnD** |
| RnD | Thông tin sản phẩm | Văn bản | Mô tả sản phẩm chi tiết | ✓ | Bao gồm: Thông tin chung, Dạng bào chế, Thành phần, Công dụng, Hướng dẫn sử dụng, Bảo quản, Lý do phát triển, Sản phẩm tương tự, USP |
| RnD | Hình ảnh/Video gốc | File | Market sản phẩm, ảnh gốc | ✓ | Hình ảnh chất lượng cao của sản phẩm |
| RnD | Giấy tờ sản phẩm | File | Giấy công bố | | Giấy công bố sản phẩm |
| RnD | Giấy tờ sản phẩm | File | Giấy phép quảng cáo | | Giấy phép quảng cáo sản phẩm |
| RnD | Giấy tờ sản phẩm | File | Đăng ký lưu hành | | Giấy đăng ký lưu hành |
| **Mua hàng** |
| Purchasing | Giấy tờ về các lô hàng | File | Hợp đồng mua bán | ✓ | Hợp đồng với nhà cung cấp |
| Purchasing | Giấy tờ về các lô hàng | File | Hóa đơn | ✓ | Hóa đơn mua hàng |
| Purchasing | Giấy tờ về các lô hàng | File | Packing list | | Danh sách đóng gói |
| Purchasing | Giấy tờ về các lô hàng | File | Tờ khai hải quan | | TKHQ |
| Purchasing | Giấy tờ về các lô hàng | File | Giấy chứng nhận xuất xứ | | GCN xuất xứ |
| Purchasing | Giấy tờ về các lô hàng | File | Vận đơn | | Vận đơn vận chuyển |
| Purchasing | Giấy tờ về các lô hàng | File | Đơn đặt hàng | ✓ | Đơn đặt hàng |
| Purchasing | Giấy tờ về các lô hàng | File | Biên bản nhập kho | ✓ | Biên bản nhập kho |
| **E-commerce** |
| ECOM | Thông tin mô tả ECOM | File | Thông tin mô tả sản phẩm trên các nền tảng | | Mô tả cho website, app |
| ECOM | Hình ảnh/Video mô tả | File | Hình ảnh/Video mô tả sản phẩm trên các nền tảng | ✓ | Hình ảnh cho ecommerce |
| ECOM | Nội dung truyền thông | File | Nội dung đăng tải trên các kênh truyền thông | ✓ | Content cho mạng xã hội |
| **Marketing** |
| Marketing | Thông tin mô tả MKT | File | Thông tin mô tả sản phẩm | | Thông tin cho marketing |
| Marketing | Content MKT | File | Ảnh chụp | ✓ | Ảnh chụp sản phẩm |
| Marketing | Content MKT | File | Ảnh thiết kế | ✓ | Ảnh thiết kế đồ họa |
| Marketing | Content MKT | File | Video | | Video quảng cáo |
| Marketing | Content MKT | File | Nội dung quảng cáo | ✓ | Script, slogan quảng cáo |
| **Truyền thông** |
| Communication | Content truyền thông | File | Ảnh | | Ảnh cho PR |
| Communication | Content truyền thông | File | Video | | Video cho PR |

### 5.3 Thuộc tính tài liệu
```
- ID tài liệu (duy nhất)
- Tên tài liệu
- Loại tài liệu (văn bản, hình ảnh, video, file)
- Phòng ban sở hữu
- Danh mục (cấp 1, cấp 2)
- SKU sản phẩm liên quan
- Mã lô hàng liên quan (nếu có)
- Đường dẫn file/nội dung
- Phiên bản (version)
- Trạng thái (Draft, Published, Archived)
- Bắt buộc (có/không)
- Ngày tạo
- Người tạo
- Ngày cập nhật
- Người cập nhật
- Ghi chú
```

### 5.4 Quản lý phiên bản (Version Control)
- Tự động tạo phiên bản mới khi cập nhật
- Lưu trữ lịch sử thay đổi
- Cho phép xem và khôi phục phiên bản cũ
- So sánh giữa các phiên bản

## 6. HỆ THỐNG PHÂN QUYỀN

### 6.1 Vai trò và quyền hạn

#### 6.1.1 Super Admin
- Toàn quyền trên hệ thống
- Quản lý phòng ban, người dùng
- Cấu hình hệ thống
- Xem tất cả tài liệu

#### 6.1.2 Department Admin
- Quản lý tài liệu của phòng ban
- Thêm/sửa/xóa tài liệu phòng ban
- Phân quyền cho nhân viên trong phòng
- Xem báo cáo phòng ban

#### 6.1.3 Department User
- Xem tài liệu của phòng ban
- Thêm/sửa tài liệu (theo phân quyền)
- Upload file
- Tạo version mới

#### 6.1.4 View Only
- Chỉ xem tài liệu được phân quyền
- Không thể chỉnh sửa

### 6.2 Ma trận phân quyền

| Chức năng | Super Admin | Dept Admin | Dept User | View Only |
|-----------|-------------|------------|-----------|-----------|
| Quản lý phòng ban | ✓ | ✗ | ✗ | ✗ |
| Quản lý sản phẩm | ✓ | ✓ | ✓ | ✗ |
| Quản lý lô hàng | ✓ | ✓ | ✓ | ✗ |
| Xem tài liệu phòng ban | ✓ | ✓ | ✓ | ✓ |
| Sửa tài liệu phòng ban | ✓ | ✓ | ✓ | ✗ |
| Xem tài liệu phòng ban khác | ✓ | ✗ | ✗ | ✗ |
| Quản lý người dùng | ✓ | ✓ | ✗ | ✗ |

## 7. GIAO DIỆN NGƯỜI DÙNG

### 7.1 Giao diện quản trị (Admin Panel)

#### 7.1.1 Dashboard với Alert Center
**A. Tổng quan hệ thống**
- Số lượng sản phẩm, lô hàng, tài liệu
- Hoạt động gần đây
- Thống kê người dùng online

**B. Alert Center (Trung tâm cảnh báo)**
```
┌─ ALERT CENTER ────────────────────────────────────┐
│ 🔴 Critical: 3    ⚠️ Warning: 8    ℹ️ Info: 12      │
│                                                   │
│ 📋 Latest Alerts:                                │
│ • SKU001 - Thiếu hợp đồng mua bán (3 ngày)       │
│ • SKU025 - Giấy công bố hết hạn hôm nay          │
│ • SKU038 - Cần cập nhật ảnh sản phẩm             │
│                                                   │
│ [View All Alerts] [Generate Report] [Settings]    │
└───────────────────────────────────────────────────┘
```

**C. Biểu đồ thống kê**
- Chart tuân thủ tài liệu theo thời gian
- Pie chart phân bố cảnh báo theo phòng ban  
- Timeline xử lý cảnh báo

**D. Quick Actions**
- Gửi reminder hàng loạt
- Export báo cáo
- Cấu hình rule kiểm tra

#### 7.1.2 Quản lý phòng ban
- Danh sách phòng ban
- Thêm/sửa/xóa phòng ban
- Quản lý nhân viên theo phòng ban

#### 7.1.3 Quản lý sản phẩm
- Danh sách sản phẩm với filter, search
- Form thêm/sửa sản phẩm
- Xem chi tiết sản phẩm và tài liệu liên quan

#### 7.1.4 Quản lý lô hàng
- Danh sách lô hàng với filter theo ngày, trạng thái
- Form thêm/sửa lô hàng
- Liên kết với tài liệu bắt buộc

#### 7.1.5 Quản lý tài liệu
- Cây thư mục theo phòng ban và danh mục
- Upload/download file
- Quản lý version
- Preview file (hình ảnh, PDF)

#### 7.1.6 Quản lý người dùng
- Danh sách người dùng
- Phân quyền theo phòng ban
- Lịch sử hoạt động

### 7.2 Giao diện người dùng (User Portal)

#### 7.2.1 Dashboard người dùng với Task Manager
**A. Tổng quan cá nhân**
- Tài liệu gần đây đã xem/chỉnh sửa
- Thống kê hoạt động của bản thân
- Shortcut đến các chức năng thường dùng

**B. My Tasks (Nhiệm vụ của tôi)**
```
┌─ MY TASKS ────────────────────────────────────────┐
│ 🔥 Urgent (3):                                    │
│ • SKU001: Upload hợp đồng mua bán (Quá hạn 2 ngày) │
│ • SKU002: Cập nhật mô tả sản phẩm (Hôm nay)       │
│                                                   │
│ ⏰ This Week (5):                                 │  
│ • SKU003: Review giấy phép quảng cáo              │
│ • SKU004: Upload ảnh sản phẩm mới                 │
│                                                   │
│ [Mark as Done] [Request Extension] [View Details]  │
└───────────────────────────────────────────────────┘
```

**C. Notifications Center**
- Thông báo real-time
- Lọc theo mức độ ưu tiên
- Đánh dấu đã đọc/chưa đọc

**D. Quick Stats**
- Completion rate của bản thân
- So sánh với trung bình phòng ban
- Achievement badges

#### 7.2.2 Quản lý sản phẩm
- Xem danh sách sản phẩm được phân quyền
- Thêm/sửa thông tin sản phẩm
- Upload tài liệu sản phẩm

#### 7.2.3 Quản lý lô hàng
- Xem danh sách lô hàng
- Cập nhật thông tin lô hàng
- Upload tài liệu lô hàng

#### 7.2.4 Thư viện tài liệu
- Duyệt tài liệu theo cây thư mục
- Tìm kiếm tài liệu
- Download/preview file
- Xem lịch sử version

## 8. YÊU CẦU KỸ THUẬT

### 8.1 Yêu cầu chức năng

#### 8.1.1 Upload và quản lý file
- Hỗ trợ đa dạng định dạng: PDF, DOC, XLS, JPG, PNG, MP4, etc.
- Giới hạn kích thước file
- Kiểm tra virus
- Tự động tạo thumbnail cho hình ảnh
- Preview file online

#### 8.1.2 Tìm kiếm và filter
- Tìm kiếm full-text trong tài liệu
- Filter theo phòng ban, loại tài liệu, ngày tạo
- Tìm kiếm nâng cao với nhiều điều kiện

#### 8.1.3 Hệ thống tự động kiểm tra tài liệu định kỳ

##### 8.1.3.1 Mục đích
- Đảm bảo các tài liệu bắt buộc luôn được cập nhật đầy đủ
- Tự động phát hiện tài liệu thiếu hoặc hết hạn
- Gửi cảnh báo và nhắc nhở khi cần thiết

##### 8.1.3.2 Cơ chế hoạt động

**A. Scheduler tự động (Cron Jobs)**
```
- Daily Check (00:00 hàng ngày): Kiểm tra tài liệu hết hạn trong ngày
- Weekly Report (Chủ nhật 08:00): Báo cáo tổng hợp tình trạng tài liệu
- Monthly Audit (Ngày 1 hàng tháng): Kiểm tra toàn diện hệ thống
- Real-time Check: Khi thêm sản phẩm/lô hàng mới
```

**B. Quy tắc kiểm tra tài liệu**
1. **Tài liệu bắt buộc theo sản phẩm**
   - Kiểm tra sản phẩm có đầy đủ tài liệu bắt buộc không
   - Xác định tài liệu nào còn thiếu dựa trên danh mục

2. **Tài liệu bắt buộc theo lô hàng**
   - Mỗi lô hàng mới phải có đủ tài liệu bắt buộc
   - Kiểm tra trong vòng X ngày sau khi tạo lô hàng

3. **Tài liệu có thời hạn hiệu lực**
   - Giấy phép quảng cáo, đăng ký lưu hành có ngày hết hạn
   - Cảnh báo trước 30, 15, 7, 1 ngày hết hạn

**C. Ma trận kiểm tra theo đối tượng**

| Đối tượng | Tài liệu bắt buộc | Thời gian check | Cảnh báo |
|-----------|-------------------|-----------------|----------|
| **Sản phẩm mới** |
| - | Mô tả sản phẩm (RnD) | Ngay khi tạo | Ngay lập tức |
| - | Market sản phẩm, ảnh gốc (RnD) | Trong 24h | Sau 24h |
| **Lô hàng mới** |
| - | Hợp đồng mua bán | Trong 3 ngày | Sau 3 ngày |
| - | Hóa đơn | Trong 5 ngày | Sau 5 ngày |
| - | Đơn đặt hàng | Ngay khi tạo | Ngay lập tức |
| - | Biên bản nhập kho | Trong 7 ngày | Sau 7 ngày |
| **Tài liệu có thời hạn** |
| - | Giấy công bố | 30 ngày trước hết hạn | 30,15,7,1 ngày |
| - | Giấy phép quảng cáo | 30 ngày trước hết hạn | 30,15,7,1 ngày |
| - | Đăng ký lưu hành | 60 ngày trước hết hạn | 60,30,15,7,1 ngày |

**D. Cấu hình linh hoạt**
```json
{
  "document_check_rules": {
    "product_mandatory_docs": {
      "RnD": {
        "mo_ta_san_pham": {
          "required": true,
          "check_after_hours": 0,
          "reminder_intervals": [0]
        },
        "anh_goc_san_pham": {
          "required": true,
          "check_after_hours": 24,
          "reminder_intervals": [24, 48, 72]
        }
      }
    },
    "batch_mandatory_docs": {
      "Purchasing": {
        "hop_dong_mua_ban": {
          "required": true,
          "check_after_hours": 72,
          "reminder_intervals": [72, 96, 120]
        }
      }
    },
    "expiry_docs": {
      "giay_cong_bo": {
        "alert_before_days": [30, 15, 7, 1]
      }
    }
  }
}
```

##### 8.1.3.3 Hệ thống cảnh báo và thông báo

**A. Cấp độ cảnh báo**
- **Critical (Đỏ)**: Tài liệu bắt buộc quá hạn
- **Warning (Vàng)**: Sắp đến hạn cập nhật
- **Info (Xanh)**: Nhắc nhở cập nhật

**B. Kênh thông báo**
1. **In-app Notification**
   - Hiển thị trên dashboard
   - Popup khi đăng nhập
   - Badge số lượng cảnh báo

2. **Email Notification**
   - Gửi cho người phụ trách
   - CC cho Department Admin
   - Escalation cho cấp trên

3. **SMS (Optional)**
   - Cho cảnh báo Critical
   - Chỉ gửi trong giờ hành chính

**C. Template thông báo**

*Ví dụ Email Template:*
```
Subject: [PIM] Cảnh báo tài liệu - SKU: ABC123

Xin chào [Tên người dùng],

Hệ thống PIM phát hiện các vấn đề sau cần được xử lý:

CRITICAL:
- Sản phẩm ABC123: Thiếu "Hợp đồng mua bán" cho lô hàng LH001 (Quá hạn 2 ngày)

WARNING: 
- Sản phẩm ABC123: "Giấy công bố" sẽ hết hạn sau 7 ngày (25/10/2025)

Vui lòng truy cập hệ thống để cập nhật: [Link]

Trân trọng,
Hệ thống PIM
```

##### 8.1.3.4 Dashboard cảnh báo

**A. Widget tổng quan**
- Tổng số cảnh báo theo mức độ
- Biểu đồ xu hướng theo thời gian
- Top 5 sản phẩm có nhiều cảnh báo nhất

**B. Danh sách chi tiết**
- Filter theo mức độ, phòng ban, loại tài liệu
- Sort theo ngày tạo, mức độ ưu tiên
- Action buttons: Xem chi tiết, Đánh dấu đã xử lý

**C. Báo cáo định kỳ**
- Weekly Summary Report
- Monthly Compliance Report  
- Quarterly Trend Analysis

#### 8.1.4 Tích hợp Lark Base - Đẩy dữ liệu báo cáo tự động

##### 8.1.4.1 Mục đích tích hợp
- Đồng bộ dữ liệu báo cáo từ PIM sang Lark Base
- Tạo dashboard trực quan trên Lark Base cho leadership
- Chia sẻ báo cáo real-time với stakeholders
- Tận dụng tính năng collaboration của Lark Suite

##### 8.1.4.2 Kiến trúc tích hợp

**A. Lark Base API Integration**
```
PIM System → API Gateway → Lark Base API → Lark Base Tables
```

**B. Authentication & Security**
- Sử dụng Lark App Credentials (App ID + App Secret)
- OAuth 2.0 flow cho authorization
- API Rate limiting và retry mechanism
- Encryption dữ liệu khi truyền

##### 8.1.4.3 Cấu trúc dữ liệu trên Lark Base

**A. Bảng chính (Main Tables)**

**1. Products Summary Table**
| Field | Type | Description |
|-------|------|-------------|
| sku | Text | Mã sản phẩm |
| product_name | Text | Tên sản phẩm |
| department | Select | Phòng ban chủ quản |
| status | Select | Trạng thái sản phẩm |
| total_docs | Number | Tổng số tài liệu |
| required_docs | Number | Tài liệu bắt buộc |
| missing_docs | Number | Tài liệu thiếu |
| compliance_rate | Number | Tỷ lệ tuân thủ (%) |
| last_updated | DateTime | Cập nhật cuối |
| alerts_count | Number | Số cảnh báo hiện tại |

**2. Daily Alerts Table**
| Field | Type | Description |
|-------|------|-------------|
| date | Date | Ngày báo cáo |
| sku | Text | Mã sản phẩm |
| department | Select | Phòng ban |
| alert_type | Select | Loại cảnh báo (Critical/Warning/Info) |
| document_type | Text | Loại tài liệu |
| alert_message | Text | Nội dung cảnh báo |
| due_date | Date | Ngày đến hạn |
| days_overdue | Number | Số ngày quá hạn |
| assigned_to | Text | Người phụ trách |
| status | Select | Trạng thái xử lý |

**3. Department Performance Table**
| Field | Type | Description |
|-------|------|-------------|
| report_date | Date | Ngày báo cáo |
| department | Select | Phòng ban |
| total_products | Number | Tổng sản phẩm quản lý |
| compliant_products | Number | Sản phẩm tuân thủ |
| compliance_score | Number | Điểm tuân thủ |
| critical_alerts | Number | Cảnh báo Critical |
| warning_alerts | Number | Cảnh báo Warning |
| avg_response_time | Number | Thời gian phản hồi TB (giờ) |
| trend | Select | Xu hướng (↗️ Tăng/→ Không đổi/↘️ Giảm) |

**4. Document Expiry Tracking**
| Field | Type | Description |
|-------|------|-------------|
| sku | Text | Mã sản phẩm |
| document_name | Text | Tên tài liệu |
| document_type | Select | Loại tài liệu |
| current_expiry | Date | Ngày hết hạn hiện tại |
| days_to_expiry | Number | Số ngày còn lại |
| renewal_status | Select | Trạng thái gia hạn |
| responsible_person | Text | Người phụ trách |
| department | Select | Phòng ban |

##### 8.1.4.4 Lịch đồng bộ dữ liệu

**A. Real-time Sync (Đồng bộ thời gian thực)**
- Khi có cảnh báo mới: Ngay lập tức push vào Daily Alerts Table
- Khi cập nhật tài liệu: Update compliance rate trong Products Summary

**B. Scheduled Sync (Đồng bộ theo lịch)**
```
- Hourly (mỗi giờ): Update alert counts và status changes
- Daily (00:30 AM): Full sync tất cả tables
- Weekly (Chủ nhật 01:00 AM): Historical data và trends
- Monthly (Ngày 1, 02:00 AM): Archive old data, cleanup
```

##### 8.1.4.5 API Workflow

**A. Data Push Process**
```python
# Ví dụ API call structure
def push_to_lark_base(table_name, data):
    """
    Push data to specific Lark Base table
    """
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'table_id': TABLE_MAPPING[table_name],
        'records': format_data_for_lark(data)
    }
    
    response = requests.post(
        f'{LARK_BASE_API_URL}/tables/{table_id}/records',
        headers=headers,
        json=payload
    )
    
    return handle_response(response)
```

**B. Error Handling & Retry Logic**
- Retry mechanism: 3 lần với exponential backoff
- Fallback: Lưu vào queue để retry sau
- Logging: Ghi log tất cả API calls và errors
- Monitoring: Alert khi fail rate > 5%

##### 8.1.4.6 Cấu hình tích hợp

**A. Lark Base Configuration**
```json
{
  "lark_config": {
    "app_id": "cli_xxxxxxxxxxxxx",
    "app_secret": "xxxxxxxxxxxxxxxxxxxx",
    "base_token": "bascnxxxxxxxxxxxxxxxxxx",
    "tables": {
      "products_summary": "tblxxxxxxxxx",
      "daily_alerts": "tblxxxxxxxxx", 
      "dept_performance": "tblxxxxxxxxx",
      "doc_expiry": "tblxxxxxxxxx"
    },
    "sync_settings": {
      "realtime_enabled": true,
      "batch_size": 100,
      "retry_attempts": 3,
      "timeout_seconds": 30
    }
  }
}
```

**B. Field Mapping Configuration**
```json
{
  "field_mappings": {
    "products_summary": {
      "sku": "fldxxxxxxxxx",
      "product_name": "fldxxxxxxxxx",
      "compliance_rate": "fldxxxxxxxxx"
    }
  }
}
```

##### 8.1.4.7 Dashboard trên Lark Base

**A. Executive Dashboard**
- Biểu đồ tổng quan compliance rate
- Heat map cảnh báo theo phòng ban
- Trend analysis theo tháng
- Top 10 sản phẩm có vấn đề

**B. Department Dashboard**  
- Performance score của từng phòng ban
- Ranking phòng ban theo compliance
- Breakdown alerts theo loại tài liệu
- Action items cần xử lý

**C. Operational Dashboard**
- Danh sách real-time alerts
- Document expiry calendar view
- Task assignment và tracking
- SLA monitoring

#### 8.1.5 Notification và workflow
- Thông báo khi có tài liệu mới
- Nhắc nhở cập nhật tài liệu bắt buộc
- Workflow phê duyệt tài liệu
- Integration với hệ thống kiểm tra tự động
- **Push notifications qua Lark Bot**

#### 8.1.6 Backup và bảo mật
- Sao lưu dữ liệu định kỳ
- Mã hóa file nhạy cảm
- Log hoạt động người dùng
- Two-factor authentication

### 8.2 Yêu cầu phi chức năng

#### 8.2.1 Hiệu năng
- Thời gian tải trang < 3 giây
- Hỗ trợ đồng thời 100+ người dùng
- Upload file < 30 giây cho file 100MB

#### 8.2.2 Khả năng mở rộng
- Architecture microservices
- Database có thể scale horizontal
- API RESTful cho tích hợp

#### 8.2.3 Tương thích
- Responsive design cho mobile
- Hỗ trợ các trình duyệt chính
- API cho mobile app

## 9. BÁO CÁO VÀ THỐNG KÊ

### 9.1 Báo cáo tự động kiểm tra tài liệu

#### 9.1.1 Báo cáo hàng ngày (Daily Report)
**A. Cảnh báo trong ngày**
- Danh sách tài liệu hết hạn hôm nay
- Tài liệu bắt buộc chưa được cập nhật
- Lô hàng mới cần hoàn thiện tài liệu

**B. Thống kê nhanh**
```
📊 THỐNG KÊ NGÀY [Date]
┌─────────────────────────────────────┐
│ Critical Alerts:     5              │
│ Warning Alerts:      12             │
│ Documents Due Today: 3              │
│ Overdue Documents:   2              │
└─────────────────────────────────────┘

🔴 CRITICAL (Cần xử lý ngay):
- SKU001: Thiếu hợp đồng mua bán (Quá hạn 3 ngày)
- SKU002: Giấy công bố hết hạn hôm nay

⚠️ WARNING (Sắp đến hạn):
- SKU003: Giấy phép quảng cáo hết hạn sau 7 ngày
```

#### 9.1.2 Báo cáo tuần (Weekly Report)
**A. Tổng hợp tình trạng theo phòng ban**

| Phòng ban | Sản phẩm quản lý | Tài liệu thiếu | Tỷ lệ hoàn thành | Xu hướng |
|-----------|------------------|----------------|------------------|----------|
| RnD | 25 | 3 | 88% | ↗️ +5% |
| Marketing | 20 | 1 | 95% | ↗️ +2% |
| ECOM | 18 | 2 | 89% | ↘️ -3% |
| Purchasing | 30 | 5 | 83% | → 0% |

**B. Top vấn đề cần chú ý**
1. Phòng Mua hàng: 5 lô hàng thiếu biên bản nhập kho
2. RnD: 3 sản phẩm mới chưa có mô tả chi tiết
3. ECOM: 2 sản phẩm thiếu content marketing

#### 9.1.3 Báo cáo tháng (Monthly Report)
**A. Compliance Score theo phòng ban**
- Điểm tuân thủ từ 0-100
- So sánh với tháng trước
- Ranking các phòng ban

**B. Xu hướng và phân tích**
- Biểu đồ số lượng cảnh báo theo thời gian
- Các loại tài liệu thường bị thiếu nhất
- Thời gian trung bình xử lý cảnh báo

#### 9.1.4 Báo cáo đặc biệt (Special Reports)

**A. Audit Report (Quarterly)**
- Kiểm tra toàn diện tất cả tài liệu
- Phát hiện dữ liệu bất thường
- Đề xuất cải thiện quy trình

**B. Performance Report**
- Hiệu suất xử lý của từng phòng ban
- Thời gian phản hồi trung bình
- KPI tuân thủ tài liệu

### 9.2 Báo cáo cho quản lý
- Báo cáo tình trạng tài liệu theo phòng ban
- Thống kê số lượng sản phẩm, lô hàng  
- Báo cáo hoạt động người dùng
- Báo cáo tài liệu thiếu/chưa cập nhật
- **Dashboard cảnh báo real-time**
- **Compliance score theo KPI**

### 9.3 Dashboard analytics
- Biểu đồ tăng trưởng số lượng tài liệu
- Top tài liệu được truy cập nhiều nhất
- Thống kê theo thời gian thực

### 9.4 Báo cáo trên Lark Base

#### 9.4.1 Executive Reports (Báo cáo điều hành)
**A. Real-time Executive Dashboard**
- **Overall Compliance Score**: Điểm tuân thủ tổng thể của công ty
- **Department Rankings**: Xếp hạng các phòng ban theo performance
- **Critical Issues Heat Map**: Bản đồ nhiệt các vấn đề quan trọng
- **Trend Analysis**: Phân tích xu hướng 3-6 tháng

**B. Monthly Board Report**
```
📊 BÁO CÁO THÁNG [Tháng/Năm] - LARK BASE DASHBOARD

┌─ TỔNG QUAN ─────────────────────────────────────┐
│ Compliance Score:     87% (↗️ +3% vs tháng trước) │
│ Critical Alerts:      12 (↘️ -5 vs tháng trước)   │
│ Documents Processed:  1,247                      │
│ Response Time Avg:    2.3 hours                  │
└─────────────────────────────────────────────────┘

TOP PERFORMERS:
🥇 Marketing: 95% compliance
🥈 ECOM: 92% compliance  
🥉 RnD: 89% compliance

ATTENTION NEEDED:
⚠️ Purchasing: 78% compliance
⚠️ Warehouse: 81% compliance
```

#### 9.4.2 Operational Dashboards
**A. Department Manager View**
- Performance của phòng ban so với target
- Danh sách action items cần xử lý
- Team member performance tracking
- Document pipeline status

**B. Team Lead View**
- Task assignment và progress tracking
- Individual performance metrics
- Workload balancing
- Training needs identification

#### 9.4.3 Automated Reporting Features

**A. Smart Alerts trên Lark**
- Bot notification khi có critical issues
- Weekly summary gửi qua Lark Chat
- @mention automatic cho responsible persons
- Calendar integration cho due dates

**B. Interactive Reports**
- Drill-down capability từ tổng quan đến chi tiết
- Filter và sort real-time trên Lark Base
- Export to Excel/PDF từ Lark Base
- Comment và discussion threads

**C. Collaboration Features**
- Task assignment directly từ Lark Base
- Status updates sync ngược lại PIM
- Document approval workflow
- Cross-department visibility

#### 9.4.4 Sample Lark Base Views

**A. "Management Overview" View**
```
Department | Products | Compliance | Critical | Trend | Action
-----------|----------|------------|----------|-------|--------
Marketing  |    25    |    95%     |    0     |  ↗️    | -
ECOM       |    18    |    92%     |    1     |  ↗️    | Review
RnD        |    22    |    89%     |    2     |  →     | Follow-up
Purchasing |    30    |    78%     |    5     |  ↘️    | Urgent
```

**B. "Alert Monitor" View**  
```
Priority | SKU   | Document Missing    | Days Overdue | Owner    | Status
---------|-------|-------------------|--------------|----------|--------
🔴 High   | P001  | Hợp đồng mua bán   |      3       | Minh.NT  | In Progress
🔴 High   | P025  | Giấy công bố       |      1       | Linh.VT  | Pending
⚠️ Medium | P038  | Ảnh sản phẩm       |      0       | Duc.LM   | New
```

#### 9.4.5 Integration Benefits
✅ **Real-time visibility** cho leadership
✅ **Collaborative workflow** giữa các phòng ban  
✅ **Mobile access** qua Lark mobile app
✅ **Automated notifications** và reminders
✅ **Historical tracking** và trend analysis
✅ **Easy sharing** với external stakeholders
✅ **No additional training** - sử dụng Lark có sẵn

## 10. ROADMAP TRIỂN KHAI

### Phase 1 (2-3 tháng)
- Core system: Quản lý phòng ban, sản phẩm, lô hàng
- Basic document management
- User authentication và authorization
- Admin panel cơ bản
- **Basic automatic document check (daily)**

### Phase 2 (1-2 tháng)
- Version control cho tài liệu
- Advanced search và filter
- User portal
- File preview
- **Advanced alert system với multiple channels**
- **Dashboard cảnh báo real-time**

### Phase 3 (1-2 tháng)
- Workflow và notification
- Mobile responsive
- **Comprehensive reporting system**
- **Configurable check rules**
- **Lark Base API integration - Basic sync**
- API development

### Phase 4 (1-2 tháng)
- Performance optimization
- Security enhancement
- **Advanced Lark Base features**: Interactive dashboards, Bot notifications
- **Real-time collaboration** trên Lark Base
- Mobile app (optional)

### Phase 5 (1 tháng)
- **Executive reporting** và analytics trên Lark Base
- **Cross-system integration** (ERP, CRM nếu cần)
- Advanced monitoring và alerting
- System optimization và fine-tuning

## 11. KẾT LUẬN

Hệ thống PIM này sẽ cung cấp một giải pháp toàn diện cho việc quản lý thông tin sản phẩm và tài liệu, đảm bảo:

- **Tổ chức**: Cấu trúc rõ ràng theo phòng ban và loại tài liệu
- **Bảo mật**: Phân quyền chặt chẽ theo phòng ban
- **Truy xuất**: Version control và lịch sử thay đổi
- **Hiệu quả**: Giao diện thân thiện, tìm kiếm mạnh mẽ
- **Mở rộng**: Architecture linh hoạt cho tương lai

Hệ thống này sẽ giúp doanh nghiệp quản lý thông tin sản phẩm một cách chuyên nghiệp và hiệu quả.