# YÊU CẦU HỆ THỐNG PIM (PRODUCT INFORMATION MANAGEMENT)

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Mục đích
Xây dựng hệ thống quản lý thông tin sản phẩm tập trung, cho phép các phòng ban quản lý tài liệu, thông tin sản phẩm và lô hàng một cách có tổ chức và bảo mật.

### 1.2 Phạm vi hệ thống
**HỆ THỐNG QUẢN LÝ THÔNG TIN VÀ TÀI LIỆU - KHÔNG PHẢI HỆ THỐNG QUẢN LÝ KHO**

✅ **Những gì hệ thống QUẢN LÝ:**
- Thông tin sản phẩm và mô tả chi tiết
- Tài liệu đa dạng (văn bản, hình ảnh, video, file)  
- Thông tin kho (tên, địa chỉ, người phụ trách)
- Thông tin lô hàng (mã lô, ngày sản xuất, hạn sử dụng)
- Phân quyền truy cập tài liệu theo phòng ban
- Version control và lịch sử thay đổi tài liệu
- Giao diện quản trị và người dùng

❌ **Những gì hệ thống KHÔNG QUẢN LÝ:**
- Số lượng tồn kho thực tế
- Xuất nhập kho và vận hành kho bãi  
- Chuyển hàng giữa các kho
- Kiểm kê và đếm hàng
- Quản lý vị trí vật lý trong kho
- Quy trình logistics và vận chuyển

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
- Thương hiệu
- Mô tả sản phẩm
- Thông tin chung
- Quy cách
- Thành phần
- Công dụng
- HDSD
- Bảo quản
- Lý do phát triển sản phẩm & Xu hướng thị trường
- Sản phẩm tương tự
- Ưu điểm cạnh tranh/USP
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

## 4. QUẢN LÝ KHO

### 4.1 Thông tin kho (Chỉ để phân loại tài liệu)
```
- Mã kho (duy nhất)
- Tên kho  
- Loại kho (Kho chính, Kho phụ, Kho bán lẻ, Kho online)
- Địa chỉ kho
- Người phụ trách kho
- Trạng thái (Hoạt động, Tạm đóng)
- Ghi chú
```

### 4.2 Mục đích quản lý kho trong hệ thống PIM
- **Phân loại tài liệu theo kho**: Tài liệu thuộc kho nào
- **Phân quyền truy cập**: User chỉ thấy tài liệu kho được phân quyền
- **Tổ chức thông tin**: Dễ dàng tìm kiếm tài liệu theo kho
- **Báo cáo**: Thống kê tài liệu theo từng kho

## 5. QUẢN LÝ LÔ HÀNG (Thông tin để quản lý tài liệu)

### 5.1 Thông tin lô hàng
```
- Mã lô hàng (duy nhất)
- SKU sản phẩm (liên kết)
- Mã kho (để phân loại tài liệu)
- Ngày sản xuất
- Hạn sử dụng
- Nhà cung cấp
- Số hợp đồng
- Trạng thái (Active, Expired, Discontinued)
- Ghi chú
- Ngày tạo record
- Người tạo
```

**Lưu ý**: Thông tin lô hàng chỉ phục vụ việc quản lý tài liệu, không quản lý số lượng hay vận hành kho.

### 5.2 Mục đích quản lý lô hàng trong PIM
- **Liên kết tài liệu với lô hàng cụ thể**: Mỗi lô có tài liệu riêng
- **Theo dõi tài liệu bắt buộc**: Kiểm tra tài liệu theo lô hàng
- **Phân loại theo kho**: Tài liệu thuộc lô hàng ở kho nào  
- **Cảnh báo hết hạn tài liệu**: Khi lô hàng sắp hết hạn

### 5.3 Báo cáo thông tin (Không phải báo cáo nghiệp vụ)
- **Báo cáo tài liệu theo kho**: Thống kê tài liệu của từng kho
- **Báo cáo tài liệu theo lô hàng**: Tài liệu thiếu của lô hàng nào  
- **Cảnh báo tài liệu sắp hết hạn**: Khi lô hàng gần hết hạn
- **Dashboard tổng quan**: Tình trạng tài liệu theo kho và lô hàng

## 6. QUẢN LÝ TÀI LIỆU

### 6.1 Cấu trúc phân loại tài liệu

#### Mô hình phân quyền tài liệu
**Nguyên tắc**: Mỗi loại tài liệu có một **phòng ban chủ quản** (Primary Owner) và có thể có các **phòng ban có quyền truy cập** (Secondary Access).

#### Danh mục loại tài liệu

| STT | Loại tài liệu | Mô tả |
|-----|---------------|-------|
| 1 | **Thông tin sản phẩm** | Mô tả chi tiết, thành phần, công dụng |
| 2 | **Hình ảnh/Video gốc** | Hình ảnh chất lượng cao, video gốc |
| 3 | **Giấy tờ sản phẩm** | Giấy công bố, phép quảng cáo, đăng ký lưu hành |
| 4 | **Giấy tờ về lô hàng** | Hợp đồng, hóa đơn, biên bản nhập kho |
| 5 | **Content Marketing** | Ảnh thiết kế, video quảng cáo, nội dung MKT |
| 6 | **Content E-commerce** | Mô tả sản phẩm trên nền tảng, hình ảnh ECOM |
| 7 | **Content Truyền thông** | Ảnh/video cho PR, thông cáo báo chí |
| 8 | **Tài liệu pháp lý** | Hợp đồng, giấy tờ pháp lý |
| 9 | **Tài liệu kho bãi** | Biên bản xuất/nhập kho, báo cáo tồn kho |

### 6.2 Ma trận phân quyền tài liệu chi tiết

#### Quy tắc phân quyền:
- **Phòng ban chủ quản**: Có quyền Create, Read, Update, Delete
- **Phòng ban có quyền truy cập**: Có quyền Read, Comment (có thể Update theo cấu hình)
- **Tài liệu bắt buộc**: Phải được upload trong thời hạn quy định

| Loại tài liệu | Tên tài liệu cụ thể | Định dạng | Chủ quản | Quyền truy cập | Bắt buộc | Thời hạn | Mô tả |
|---------------|---------------------|-----------|----------|---------------|----------|---------|-------|
| **Thông tin sản phẩm** |
| Thông tin sản phẩm | Mô tả sản phẩm chi tiết | Văn bản | RND | MKT, ECOM | ✓ | Ngay khi tạo | Thông tin chung, thành phần, công dụng, HDSD |
| Thông tin sản phẩm | Thông số kỹ thuật | Văn bản | RND | MKT, ECOM, WH | ✓ | 24h | Quy cách, khối lượng, kích thước |
| **Hình ảnh/Video gốc** |
| Hình ảnh/Video gốc | Ảnh sản phẩm gốc | File | RND | MKT, ECOM, COM | ✓ | 24h | Hình ảnh chất lượng cao |
| Hình ảnh/Video gốc | Video giới thiệu | File | RND | MKT, ECOM, COM | | 72h | Video demo sản phẩm |
| **Giấy tờ sản phẩm** |
| Giấy tờ sản phẩm | Giấy công bố | File | RND | LEG | | 30 ngày | Giấy công bố sản phẩm |
| Giấy tờ sản phẩm | Giấy phép quảng cáo | File | RND | LEG, MKT | | 30 ngày | Giấy phép quảng cáo |
| Giấy tờ sản phẩm | Đăng ký lưu hành | File | RND | LEG | | 60 ngày | Giấy đăng ký lưu hành |
| **Giấy tờ về lô hàng** |
| Giấy tờ về lô hàng | Hợp đồng mua bán | File | PUR | WH, LEG | ✓ | 3 ngày | Hợp đồng với NCC |
| Giấy tờ về lô hàng | Hóa đơn | File | PUR | WH, LEG | ✓ | 5 ngày | Hóa đơn mua hàng |
| Giấy tờ về lô hàng | Đơn đặt hàng | File | PUR | WH | ✓ | Ngay khi tạo | Purchase Order |
| Giấy tờ về lô hàng | Biên bản nhập kho | File | WH | PUR | ✓ | 7 ngày | Biên bản nhập kho |
| Giấy tờ về lô hàng | Packing list | File | PUR | WH | | 5 ngày | Danh sách đóng gói |
| Giấy tờ về lô hàng | Vận đơn | File | PUR | WH | | 7 ngày | Vận đơn vận chuyển |
| **Content Marketing** |
| Content Marketing | Ảnh chụp sản phẩm | File | MKT | ECOM, COM | ✓ | 48h | Ảnh chụp chuyên nghiệp |
| Content Marketing | Ảnh thiết kế | File | MKT | ECOM, COM | ✓ | 72h | Ảnh thiết kế đồ họa |
| Content Marketing | Video quảng cáo | File | MKT | ECOM, COM | | 7 ngày | Video marketing |
| Content Marketing | Script quảng cáo | Văn bản | MKT | ECOM, COM | ✓ | 48h | Nội dung quảng cáo |
| **Content E-commerce** |
| Content E-commerce | Mô tả sản phẩm web | Văn bản | ECOM | MKT | ✓ | 48h | Mô tả cho website |
| Content E-commerce | Hình ảnh ECOM | File | ECOM | MKT | ✓ | 72h | Ảnh cho nền tảng bán hàng |
| **Content Truyền thông** |
| Content Truyền thông | Ảnh PR | File | COM | MKT | | 48h | Ảnh cho quan hệ công chúng |
| Content Truyền thông | Video PR | File | COM | MKT | | 72h | Video cho truyền thông |
| Content Truyền thông | Thông cáo báo chí | Văn bản | COM | MKT, LEG | | 24h | Press release |

### 6.3 Thuộc tính tài liệu
```
- ID tài liệu (duy nhất)
- Tên tài liệu
- Loại tài liệu (văn bản, hình ảnh, video, file)
- Phòng ban chủ quản (Primary Owner)
- Danh sách phòng ban có quyền truy cập (Secondary Access)
- Cấp độ quyền truy cập (Read Only, Read+Comment, Read+Edit)
- Danh mục tài liệu
- SKU sản phẩm liên quan
- Mã lô hàng liên quan (nếu có)
- Đường dẫn file/nội dung
- Phiên bản (version)
- Trạng thái (Active, Archived)
- Bắt buộc (có/không)
- Thời hạn hoàn thành (nếu bắt buộc)
- Ngày tạo
- Người tạo
- Ngày cập nhật cuối
- Người cập nhật cuối
- Ghi chú
```

### 6.4 Quản lý phiên bản (Version Control) đơn giản

#### 6.4.1 Workflow phiên bản theo phân quyền
**A. Primary Owner:**
- Toàn quyền tạo, sửa, xóa tài liệu
- Quản lý phân quyền cho phòng ban khác

**B. Secondary Access:**
- **Read Only**: Chỉ xem và tải xuống
- **Read + Comment**: Xem, tải xuống, và để lại comment
- **Read + Edit**: Xem, tải xuống, và chỉnh sửa trực tiếp

#### 6.4.2 Tính năng Version Control
- **Auto-versioning**: Tự động tạo version mới khi có thay đổi
- **Simple edit**: Chỉnh sửa trực tiếp, không cần approval
- **Rollback capability**: Khôi phục version trước đó
- **Change tracking**: Theo dõi chi tiết từng thay đổi và người thực hiện
- **Lock mechanism**: Tránh xung đột khi nhiều người cùng chỉnh sửa

#### 6.4.3 Notification System
- **Real-time alerts** khi có version mới
- **Change notifications** tới tất cả người có quyền truy cập
- **Deadline reminders** cho tài liệu bắt buộc

## 7. HỆ THỐNG PHÂN QUYỀN

### 7.1 Vai trò và quyền hạn theo mô hình Primary Owner + Secondary Access

#### 7.1.1 Super Admin
- Toàn quyền trên hệ thống
- Quản lý phòng ban, người dùng
- Cấu hình hệ thống và phân quyền
- Xem tất cả tài liệu
- Thiết lập quy tắc Primary Owner và Secondary Access

#### 7.1.2 Department Admin (Primary Owner)
**Với tài liệu phòng ban chủ quản:**
- Toàn quyền: Create, Read, Update, Delete
- Phân quyền cho phòng ban khác truy cập
- Cấu hình mức độ quyền truy cập

**Với tài liệu có quyền truy cập:**
- Read, Comment, Edit (theo cấu hình được phân quyền)

#### 7.1.3 Department User (Primary Owner)
**Với tài liệu phòng ban chủ quản:**
- Create, Read, Update, Disable
- Upload và quản lý version

**Với tài liệu có quyền truy cập:**
- Read, Comment, Edit (theo cấu hình được phân quyền)

#### 7.1.4 Cross-Department User (Secondary Access)
**Quyền hạn theo cấu hình:**
- **Read Only**: Chỉ xem và download
- **Read + Comment**: Xem, download, comment
- **Read + Edit**: Xem, download, chỉnh sửa trực tiếp

#### 7.1.5 View Only
- Xem tài liệu được phân quyền cụ thể
- Không có quyền tải xuống hoặc chỉnh sửa
- Thường dùng cho external stakeholders

### 7.2 Ma trận phân quyền chi tiết

#### 7.2.1 Quyền hệ thống cơ bản
| Chức năng | Super Admin | Dept Admin | Dept User | Cross-Dept User | View Only |
|-----------|-------------|------------|-----------|-----------------|-----------|
| Quản lý phòng ban | ✓ | ✗ | ✗ | ✗ | ✗ |
| Quản lý người dùng | ✓ | ✓* | ✗ | ✗ | ✗ |
| Cấu hình hệ thống | ✓ | ✗ | ✗ | ✗ | ✗ |
| Xem dashboard tổng quan | ✓ | ✓ | ✓ | ✓** | ✗ |

#### 7.2.2 Quyền quản lý thông tin sản phẩm, kho và lô hàng  
| Chức năng | Super Admin | Primary Owner | Secondary Access | View Only |
|-----------|-------------|---------------|------------------|-----------|
| Tạo sản phẩm mới | ✓ | ✓ | ✗ | ✗ |
| Chỉnh sửa thông tin sản phẩm | ✓ | ✓ | ✓* | ✗ |
| Xóa sản phẩm | ✓ | ✓** | ✗ | ✗ |
| Xem thông tin sản phẩm | ✓ | ✓ | ✓ | ✓*** |
| Quản lý thông tin kho | ✓ | ✓**** | ✗ | ✗ |
| Xem thông tin kho | ✓ | ✓ | ✓ | ✓*** |
| Tạo thông tin lô hàng | ✓ | ✓ | ✗ | ✗ |
| Cập nhật thông tin lô hàng | ✓ | ✓ | ✓* | ✗ |

#### 7.2.3 Quyền quản lý tài liệu (theo Primary/Secondary Model)
| Chức năng | Super Admin | Primary Owner | Secondary (R) | Secondary (R+C) | Secondary (R+E) |
|-----------|-------------|---------------|---------------|----------------|-----------------|
| Tạo tài liệu mới | ✓ | ✓ | ✗ | ✗ | ✗ |
| Upload file | ✓ | ✓ | ✗ | ✗ | ✓ |
| Chỉnh sửa nội dung | ✓ | ✓ | ✗ | ✗ | ✓ |
| Xóa tài liệu | ✓ | ✓ | ✗ | ✗ | ✗ |
| Xem tài liệu | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tải xuống | ✓ | ✓ | ✓ | ✓ | ✓ |
| Comment/Feedback | ✓ | ✓ | ✗ | ✓ | ✓ |
| Phân quyền truy cập | ✓ | ✓ | ✗ | ✗ | ✗ |

**Chú thích:**
- `*` Nếu có quyền Read+Edit
- `**` Cần confirm từ Super Admin nếu có tài liệu liên quan
- `***` Theo danh sách được phân quyền
- `****` Chỉ kho thuộc phòng ban mình quản lý

## 8. GIAO DIỆN NGƯỜI DÙNG

### 8.1 Giao diện quản trị (Admin Panel)

#### 8.1.1 Dashboard với Alert Center
**A. Tổng quan hệ thống**
- Số lượng sản phẩm, lô hàng, tài liệu
- Hoạt động gần đây
- Thống kê người dùng online

**B. Alert Center (Trung tâm cảnh báo)**
```
┌─ ALERT CENTER ────────────────────────────────────┐
│ 🔴 Critical: 3    ⚠️ Warning: 8    ℹ️ Info: 12      │
│                                                   │
│ 📋 Latest Alerts với phân công rõ ràng:           │
│ • [PUR] SKU001 - Thiếu hợp đồng mua bán (3 ngày) │
│ • [RND] SKU025 - Giấy công bố hết hạn hôm nay     │
│ • [MKT] SKU038 - Cần cập nhật ảnh sản phẩm        │
│                                                   │
│ [Filter by Department] [Assign Tasks] [Escalate]  │
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

#### 8.1.2 Quản lý phòng ban
- Danh sách phòng ban
- Thêm/sửa/xóa phòng ban
- Quản lý nhân viên theo phòng ban

#### 8.1.3 Quản lý kho (Chỉ thông tin cơ bản)
- Danh sách kho với thông tin cơ bản
- Thêm/sửa/xóa thông tin kho  
- Phân quyền truy cập tài liệu theo kho

#### 8.1.4 Quản lý sản phẩm
- Danh sách sản phẩm với filter, search
- Form thêm/sửa sản phẩm
- Xem chi tiết sản phẩm và tài liệu liên quan

#### 8.1.5 Quản lý lô hàng (Chỉ thông tin tài liệu)
- Danh sách lô hàng với filter theo kho, sản phẩm
- Form thêm/sửa thông tin lô hàng
- Liên kết với tài liệu bắt buộc theo lô hàng
- Theo dõi tình trạng tài liệu của lô hàng

#### 8.1.6 Quản lý tài liệu với Cross-Department Access
**A. Document Tree View**
```
📁 Tài liệu theo phòng ban
├── 📂 RND (Primary Owner) - 125 tài liệu
│   ├── 📄 Thông tin sản phẩm (🔓 MKT, ECOM có thể xem)  
│   └── 📄 Giấy tờ sản phẩm (🔓 LEG có thể xem)
├── 📂 MKT (Primary Owner) - 89 tài liệu  
│   ├── 📄 Content Marketing (🔓 ECOM, COM có thể xem)
│   └── 📄 Script quảng cáo (🔓 ECOM, COM có thể edit)
└── 📂 Cross-Access View - Tài liệu tôi có quyền truy cập
    ├── 📄 Từ RND: Thông tin sản phẩm (Read Only)
    └── 📄 Từ MKT: Content Marketing (Read + Comment)
```

**B. Advanced Features**
- **Smart filtering**: Lọc theo quyền truy cập (Own/Primary/Secondary)
- **Permission indicators**: Icon hiển thị mức độ quyền hạn
- **Collaboration panel**: Theo dõi hoạt động cross-department
- **Version comparison**: So sánh versions với highlight changes

#### 8.1.7 Quản lý phân quyền Cross-Department
**A. Permission Management Matrix**
- Thiết lập Primary Owner cho từng loại tài liệu
- Cấu hình Secondary Access (Read/Comment/Edit) 
- Bulk permission assignment
- Permission inheritance rules

**B. Access Control Panel**
- Quản lý quyền truy cập theo phòng ban
- Thiết lập default permissions cho loại tài liệu
- Monitor hoạt động cross-department
- Notification settings

### 8.2 Giao diện người dùng (User Portal)

#### 8.2.1 Dashboard người dùng với Task Manager
**A. Tổng quan cá nhân**
- Tài liệu gần đây đã xem/chỉnh sửa
- Thống kê hoạt động của bản thân
- Shortcut đến các chức năng thường dùng

**B. My Tasks với phân công rõ ràng theo phòng ban**
```
┌─ MY TASKS - PHÒNG MUA HÀNG (PUR) ────────────────┐
│ 🔥 Urgent Tasks - Tôi chịu trách nhiệm (3):       │
│ • [PUR→WH,LEG] SKU001: Upload hợp đồng mua bán    │
│   (Quá hạn 2 ngày) - Primary Owner               │
│ • [PUR] SKU002: Cập nhật đơn đặt hàng (Hôm nay)  │
│                                                   │
│ ⏰ This Week - Tasks của tôi (5):                 │  
│ • [PUR] SKU003: Hoàn thiện hóa đơn mua hàng       │
│ • [PUR] SKU004: Cập nhật thông tin nhà cung cấp   │
│                                                   │
│ 👁️ Tasks tôi có quyền xem (Secondary Access):      │
│ • [RND→PUR] SKU005: Review thông tin sản phẩm     │
│   (RnD chủ quản, PUR có quyền comment)           │
│                                                   │
│ [My Department Only] [All Access] [Escalate]      │
└───────────────────────────────────────────────────┘
```

**C. Cross-Department Activity Center**
```
┌─ RECENT ACTIVITIES ───────────────────────────────┐
│ � Documents I Can Edit:                          │
│ • MKT Content: SKU001 Marketing materials         │
│ • RnD Info: SKU002 Product descriptions           │
│                                                   │
│ � Recently Viewed:                               │
│ • Legal docs from LEG department                  │
│ • Warehouse reports from WH                       │
│                                                   │
│ 💬 Comments & Discussions:                        │
│ • 3 new comments on SKU005                        │
│                                                   │
│ [View All] [Filter by Department] [Search]        │
└───────────────────────────────────────────────────┘
```

**D. Enhanced Quick Stats**
- **Primary Owner Performance**: Documents owned và completion rate
- **Secondary Access Activity**: Contributions to other departments 
- **Cross-Department Score**: Collaboration effectiveness
- **Response Time**: Thời gian phản hồi requests trung bình

#### 8.2.2 Quản lý sản phẩm
- Xem danh sách sản phẩm được phân quyền
- Thêm/sửa thông tin sản phẩm
- Upload tài liệu sản phẩm

#### 8.2.3 Quản lý kho (theo phân quyền)
- Xem thông tin kho được phân quyền
- Theo dõi tài liệu thuộc kho

#### 8.2.4 Quản lý lô hàng (thông tin tài liệu)
- Xem danh sách lô hàng theo kho được phân quyền
- Cập nhật thông tin lô hàng
- Upload tài liệu cho lô hàng
- Theo dõi tình trạng tài liệu của lô hàng

#### 8.2.5 Thư viện tài liệu Cross-Department
**A. Multi-View Document Library**
```
📚 MY DOCUMENT LIBRARY

┌─ VIEW MODES ──────────────────────────────────────┐
│ [📁 By Department] [🏷️ By Category] [⏰ By Due Date] │
│ [🔒 By Permission] [👤 By Owner] [📊 By Status]     │
└───────────────────────────────────────────────────┘

┌─ DOCUMENTS I OWN (Primary) ──────────────────────┐
│ 📄 SKU001_Contract.pdf        PUR → WH, LEG      │
│ 📄 SKU002_Invoice.pdf         PUR → WH           │  
│ 📸 Product_Photo_A.jpg        MKT → ECOM, COM    │
└───────────────────────────────────────────────────┘

┌─ DOCUMENTS I CAN ACCESS (Secondary) ─────────────┐
│ 📋 Product_Description.docx   RND → [Read+Edit]   │
│ 🎬 Marketing_Video.mp4        MKT → [Read Only]   │
│ 📊 Compliance_Report.xlsx     LEG → [Read+Comment]│
└───────────────────────────────────────────────────┘
```

**B. Smart Features**
- **Permission-based filtering**: Tự động lọc theo quyền truy cập
- **Cross-reference linking**: Liên kết tài liệu liên quan giữa phòng ban
- **Collaborative preview**: Multi-user preview với real-time comments
- **Smart notifications**: Alerts khi có updates từ documents được follow

## 9. YÊU CẦU KỸ THUẬT

### 9.1 Yêu cầu chức năng

#### 9.1.1 Upload và quản lý file
- Hỗ trợ đa dạng định dạng: PDF, DOC, XLS, JPG, PNG, MP4, etc.
- Giới hạn kích thước file
- Kiểm tra virus
- Tự động tạo thumbnail cho hình ảnh
- Preview file online

#### 9.1.2 Tìm kiếm và filter
- Tìm kiếm full-text trong tài liệu
- Filter theo phòng ban, loại tài liệu, ngày tạo
- Tìm kiếm nâng cao với nhiều điều kiện

#### 9.1.3 Hệ thống tự động kiểm tra tài liệu định kỳ

##### 9.1.3.1 Mục đích
- Đảm bảo các tài liệu bắt buộc luôn được cập nhật đầy đủ
- Tự động phát hiện tài liệu thiếu hoặc hết hạn
- Gửi cảnh báo và nhắc nhở khi cần thiết

##### 9.1.3.2 Cơ chế hoạt động

**A. Scheduler tự động (Cron Jobs)**
```
- Daily Check (00:00 hàng ngày): Kiểm tra tài liệu hết hạn trong ngày
- Weekly Report (Chủ nhật 08:00): Báo cáo tổng hợp tình trạng tài liệu
- Monthly Audit (Ngày 1 hàng tháng): Kiểm tra toàn diện hệ thống
- Real-time Check: Khi thêm sản phẩm/lô hàng mới
```

**B. Quy tắc kiểm tra tài liệu**
1. **Kiểm tra completeness thông tin sản phẩm**
   - Kiểm tra các trường thông tin bắt buộc đã được điền đầy đủ chưa
   - Xác định trường nào còn thiếu hoặc chưa hoàn thiện
   - Cảnh báo khi thông tin không đủ chi tiết

2. **Tài liệu bắt buộc theo sản phẩm**
   - Kiểm tra sản phẩm có đầy đủ tài liệu bắt buộc không
   - Xác định tài liệu nào còn thiếu dựa trên danh mục

3. **Tài liệu bắt buộc theo lô hàng**
   - Mỗi lô hàng mới phải có đủ tài liệu bắt buộc
   - Kiểm tra trong vòng X ngày sau khi tạo lô hàng

4. **Tài liệu có thời hạn hiệu lực**
   - Giấy phép quảng cáo, đăng ký lưu hành có ngày hết hạn
   - Cảnh báo trước 30, 15, 7, 1 ngày hết hạn

**C. Ma trận kiểm tra theo đối tượng**

| Đối tượng | Tài liệu/Thông tin bắt buộc | Thời gian check | Cảnh báo |
|-----------|---------------------------|-----------------|----------|
| **Thông tin sản phẩm cơ bản** |
| - | Thương hiệu | Ngay khi tạo | Ngay lập tức |
| - | Mô tả sản phẩm | Ngay khi tạo | Ngay lập tức |
| - | Thông tin chung | Trong 2h | Sau 2h |
| - | Quy cách | Trong 4h | Sau 4h |
| - | Thành phần | Trong 6h | Sau 6h |
| - | Công dụng | Trong 8h | Sau 8h |
| - | HDSD (Hướng dẫn sử dụng) | Trong 12h | Sau 12h |
| - | Bảo quản | Trong 12h | Sau 12h |
| **Thông tin sản phẩm mở rộng** |
| - | Lý do phát triển sản phẩm & Xu hướng thị trường | Trong 24h | Sau 24h |
| - | Sản phẩm tương tự | Trong 48h | Sau 48h |
| - | Ưu điểm cạnh tranh/USP | Trong 72h | Sau 72h |
| **Tài liệu sản phẩm** |
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
    "product_info_fields": {
      "basic_info": {
        "thuong_hieu": {
          "required": true,
          "check_after_hours": 0,
          "reminder_intervals": [0, 1, 2],
          "validation_rules": ["not_empty", "min_length:2"]
        },
        "mo_ta_san_pham": {
          "required": true,
          "check_after_hours": 0,
          "reminder_intervals": [0, 1, 2],
          "validation_rules": ["not_empty", "min_length:10"]
        },
        "thong_tin_chung": {
          "required": true,
          "check_after_hours": 2,
          "reminder_intervals": [2, 4, 8],
          "validation_rules": ["not_empty", "min_length:20"]
        },
        "quy_cach": {
          "required": true,
          "check_after_hours": 4,
          "reminder_intervals": [4, 8, 12],
          "validation_rules": ["not_empty", "contains_unit"]
        },
        "thanh_phan": {
          "required": true,
          "check_after_hours": 6,
          "reminder_intervals": [6, 12, 18],
          "validation_rules": ["not_empty", "min_length:15"]
        },
        "cong_dung": {
          "required": true,
          "check_after_hours": 8,
          "reminder_intervals": [8, 16, 24],
          "validation_rules": ["not_empty", "min_length:20"]
        },
        "hdsd": {
          "required": true,
          "check_after_hours": 12,
          "reminder_intervals": [12, 24, 36],
          "validation_rules": ["not_empty", "contains_steps"]
        },
        "bao_quan": {
          "required": true,
          "check_after_hours": 12,
          "reminder_intervals": [12, 24, 36],
          "validation_rules": ["not_empty", "contains_conditions"]
        }
      },
      "extended_info": {
        "ly_do_phat_trien": {
          "required": true,
          "check_after_hours": 24,
          "reminder_intervals": [24, 48, 72],
          "validation_rules": ["not_empty", "min_length:50"]
        },
        "san_pham_tuong_tu": {
          "required": true,
          "check_after_hours": 48,
          "reminder_intervals": [48, 96, 144],
          "validation_rules": ["not_empty", "has_comparison"]
        },
        "usp_canh_tranh": {
          "required": true,
          "check_after_hours": 72,
          "reminder_intervals": [72, 144, 216],
          "validation_rules": ["not_empty", "min_length:30", "has_unique_points"]
        }
      }
    },
    "product_mandatory_docs": {
      "RnD": {
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

**E. Chi tiết Validation Rules cho thông tin sản phẩm**

| Trường thông tin | Rule | Mô tả | Ví dụ fail | Ví dụ pass |
|------------------|------|--------|------------|------------|
| **Thương hiệu** | `not_empty` | Không được để trống | "" | "ABC Brand" |
| | `min_length:2` | Tối thiểu 2 ký tự | "A" | "AB" |
| **Mô tả sản phẩm** | `not_empty` | Không được để trống | "" | "Sản phẩm chăm sóc da..." |
| | `min_length:10` | Tối thiểu 10 ký tự | "Kem dưỡng" | "Kem dưỡng ẩm cho da khô" |
| **Thông tin chung** | `not_empty` | Không được để trống | "" | "Sản phẩm dành cho..." |
| | `min_length:20` | Tối thiểu 20 ký tự | "Cho da khô" | "Sản phẩm dành cho da khô, giúp cung cấp độ ẩm" |
| **Quy cách** | `not_empty` | Không được để trống | "" | "Tube 50ml" |
| | `contains_unit` | Phải có đơn vị đo | "Tube 50" | "Tube 50ml" hoặc "Hộp 100g" |
| **Thành phần** | `not_empty` | Không được để trống | "" | "Aqua, Glycerin, ..." |
| | `min_length:15` | Tối thiểu 15 ký tự | "Nước, dầu" | "Aqua, Glycerin, Cetyl Alcohol" |
| **Công dụng** | `not_empty` | Không được để trống | "" | "Dưỡng ẩm cho da" |
| | `min_length:20` | Tối thiểu 20 ký tự | "Dưỡng ẩm" | "Dưỡng ẩm sâu, làm mềm mượt da" |
| **HDSD** | `not_empty` | Không được để trống | "" | "Bước 1: Làm sạch da..." |
| | `contains_steps` | Phải có các bước | "Thoa lên da" | "Bước 1: Làm sạch, Bước 2: Thoa đều" |
| **Bảo quản** | `not_empty` | Không được để trống | "" | "Nơi khô ráo, thoáng mát" |
| | `contains_conditions` | Phải có điều kiện | "Để ở nơi khô" | "Nhiệt độ dưới 30°C, tránh ánh sáng trực tiếp" |
| **Lý do phát triển** | `not_empty` | Không được để trống | "" | "Đáp ứng nhu cầu thị trường..." |
| | `min_length:50` | Tối thiểu 50 ký tự | "Nhu cầu cao" | "Đáp ứng nhu cầu ngày càng tăng về sản phẩm chăm sóc da tự nhiên" |
| **Sản phẩm tương tự** | `not_empty` | Không được để trống | "" | "Brand X - Product Y: giá 200k..." |
| | `has_comparison` | Phải có so sánh | "Có sản phẩm khác" | "Brand X - Product Y: giá 200k, chất lượng tương đương nhưng không có vitamin E" |
| **USP/Ưu điểm** | `not_empty` | Không được để trống | "" | "Công thức độc quyền..." |
| | `min_length:30` | Tối thiểu 30 ký tự | "Tốt nhất" | "Công thức độc quyền với vitamin E từ thiên nhiên" |
| | `has_unique_points` | Phải có điểm khác biệt | "Sản phẩm tốt" | "Duy nhất chứa 15% vitamin E, thấm nhanh trong 30 giây" |

**F. Logic kiểm tra tự động**
```python
def validate_product_field(field_name, value, rules):
    """
    Validate product field theo rules đã định nghĩa
    """
    errors = []
    
    # Check not_empty
    if "not_empty" in rules and (not value or value.strip() == ""):
        errors.append(f"{field_name} không được để trống")
    
    # Check min_length
    for rule in rules:
        if rule.startswith("min_length:"):
            min_len = int(rule.split(":")[1])
            if len(value.strip()) < min_len:
                errors.append(f"{field_name} phải có tối thiểu {min_len} ký tự")
    
    # Check specific rules
    if "contains_unit" in rules:
        units = ["ml", "g", "kg", "l", "mg", "gam", "lít", "viên", "gói", "hộp"]
        if not any(unit in value.lower() for unit in units):
            errors.append(f"{field_name} phải có đơn vị đo (ml, g, kg, etc.)")
    
    if "contains_steps" in rules:
        step_indicators = ["bước", "step", "1.", "2.", "đầu tiên", "sau đó", "cuối cùng"]
        if not any(indicator in value.lower() for indicator in step_indicators):
            errors.append(f"{field_name} phải có các bước hướng dẫn rõ ràng")
    
    if "contains_conditions" in rules:
        conditions = ["nhiệt độ", "độ ẩm", "tránh", "nơi", "°c", "khô", "ẩm", "mát"]
        if not any(condition in value.lower() for condition in conditions):
            errors.append(f"{field_name} phải có điều kiện bảo quản cụ thể")
    
    return errors

# Example usage
def check_product_completeness(product_id):
    """
    Kiểm tra tính đầy đủ của thông tin sản phẩm
    """
    product = get_product_by_id(product_id)
    validation_config = get_validation_config()
    
    all_errors = []
    warnings = []
    
    # Check basic info fields
    for field_name, config in validation_config["basic_info"].items():
        field_value = getattr(product, field_name, "")
        rules = config.get("validation_rules", [])
        
        errors = validate_product_field(field_name, field_value, rules)
        if errors:
            check_time = config["check_after_hours"] 
            if product.created_hours_ago > check_time:
                all_errors.extend(errors)
            else:
                warnings.extend(errors)
    
    return {
        "product_id": product_id,
        "errors": all_errors,
        "warnings": warnings,
        "completeness_score": calculate_completeness_score(product),
        "next_check": calculate_next_check_time(product)
    }
```

##### 9.1.3.3 Hệ thống cảnh báo và thông báo theo phòng ban

**A. Cấp độ cảnh báo với phân công rõ ràng**
- **Critical (Đỏ)**: Tài liệu bắt buộc quá hạn → Gửi cho Primary Owner + Department Admin
- **Warning (Vàng)**: Sắp đến hạn cập nhật → Gửi cho Primary Owner + Secondary Access  
- **Info (Xanh)**: Nhắc nhở cập nhật → Gửi cho Primary Owner

**B. Kênh thông báo với định tuyến theo phòng ban**
1. **In-app Notification**
   - Hiển thị trên dashboard theo phòng ban
   - Badge riêng cho Primary Owner vs Secondary Access
   - Filter notification theo department

2. **Email Notification - Smart Routing**
   - **Primary Owner**: Nhận tất cả alerts liên quan đến tài liệu phòng ban chủ quản
   - **Secondary Access**: Chỉ nhận alerts của tài liệu có quyền truy cập
   - **Department Admin**: Nhận summary alerts của toàn phòng ban
   - **Cross-Department**: Nhận alerts khi có impact đến phòng ban khác

3. **SMS (Optional)**
   - Chỉ gửi cho Primary Owner khi Critical
   - Bao gồm mã phòng ban trong tin nhắn: "[PUR-CRITICAL] SKU001..."

4. **Lark Bot Notification**
   - Group chat riêng cho từng phòng ban
   - @mention specific người phụ trách
   - Thread discussion cho mỗi alert

**C. Template thông báo**

*Ví dụ Email Template với thông tin sản phẩm:*
```
Subject: [PIM-RND] Cảnh báo thông tin sản phẩm & tài liệu - SKU: ABC123

Xin chào [Tên người dùng] - Phòng Nghiên cứu & Phát triển,

Hệ thống PIM phát hiện các vấn đề sau thuộc trách nhiệm của phòng ban bạn:

🔴 CRITICAL - THÔNG TIN SẢN PHẨM THIẾU (RND CHỊU TRÁCH NHIỆM):
- SKU: ABC123 - "Kem dưỡng ẩm ABC"
  ❌ Thiếu trường "Thành phần": Quá hạn 2 giờ (phải hoàn thành trong 6h)
  ❌ Thiếu trường "Công dụng": Quá hạn 4 giờ (phải hoàn thành trong 8h)
  → Completeness Score: 60% (cần đạt 100%)
  → Người phụ trách: Nguyễn Văn C (RND)

🔴 CRITICAL - TÀI LIỆU THIẾU (RND CHỊU TRÁCH NHIỆM):
- SKU: ABC123: Thiếu "Ảnh sản phẩm gốc" (Quá hạn 6 giờ)
  → Hạn chót đã qua: 17/10/2025 18:00

⚠️ WARNING - THÔNG TIN SẢN PHẨM SẮP ĐẾN HẠN:
- SKU: ABC123: "Lý do phát triển & Xu hướng thị trường" cần hoàn thành trong 2 giờ
- SKU: ABC123: "Sản phẩm tương tự" cần hoàn thành trong 8 giờ

📄 THÔNG TIN LIÊN QUAN:
- Phòng Marketing (MKT) đang chờ thông tin để tạo content
- Phòng E-commerce (ECOM) cần "Mô tả sản phẩm" để đăng bán
  → Người phụ trách: Trần Thị B (RND)
  → Phòng liên quan: Legal (LEG) cần được thông báo

📧 Thông báo đã được gửi đến:
- Chủ quản (Primary Owner): Phòng Mua hàng
- Có quyền truy cập (Secondary): Phòng Kho, Phòng Pháp chế
- Department Admin: [Tên Admin]

Vui lòng truy cập hệ thống để cập nhật: [Link]

Trân trọng,
Hệ thống PIM
```

##### 9.1.3.4 Dashboard cảnh báo

**A. Widget tổng quan với Product Completeness**
```
┌─ PRODUCT INFORMATION COMPLETENESS ───────────────┐
│                                                  │
│ 📊 Tổng quan thông tin sản phẩm:                 │
│ • Hoàn thiện 100%: 45 sản phẩm (75%)            │
│ • Thiếu thông tin:  12 sản phẩm (20%)            │
│ • Mới tạo/Draft:     3 sản phẩm (5%)             │
│                                                  │
│ 🔥 Critical Info Missing:                        │
│ • Thương hiệu: 2 sản phẩm                        │
│ • Thành phần: 5 sản phẩm                         │
│ • Công dụng: 3 sản phẩm                          │
│                                                  │
│ ⏰ Upcoming Deadlines:                           │
│ • SKU123: Lý do phát triển (còn 2h)             │
│ • SKU456: USP/Ưu điểm (còn 5h)                  │
└──────────────────────────────────────────────────┘

┌─ DOCUMENT ALERTS ────────────────────────────────┐
│ 🔴 Critical: 8   ⚠️ Warning: 15   ℹ️ Info: 23     │
│                                                  │
│ Top Issues by Category:                          │
│ • Product Info Missing: 8                        │
│ • Document Missing: 12                           │
│ • Expiry Soon: 6                                 │
└──────────────────────────────────────────────────┘
```

- Biểu đồ completeness score theo thời gian
- Heatmap thiếu thông tin theo phòng ban
- Progress tracking cho từng sản phẩm mới

**B. Danh sách chi tiết với Product Info Status**
- **Filter mới**: Theo completeness level (0-25%, 26-50%, 51-75%, 76-100%)
- **Filter theo field**: Thiếu trường nào (Thương hiệu, Thành phần, etc.)
- **Sort theo**: Completeness score, thời gian tạo, deadline
- **Color coding**: 
  - 🔴 Red: Completeness < 50%
  - 🟡 Yellow: Completeness 50-80%
  - 🟢 Green: Completeness > 80%

**Sample List View:**
| SKU | Tên sản phẩm | Completeness | Missing Fields | Days Since Created | Priority |
|-----|--------------|--------------|----------------|-------------------|----------|
| ABC123 | Kem dưỡng ABC | 🔴 40% | Thành phần, Công dụng, HDSD | 3 days | 🔥 High |
| XYZ456 | Serum XYZ | 🟡 75% | USP, Sản phẩm tương tự | 1 day | ⚠️ Medium |
| DEF789 | Toner DEF | 🟢 95% | Lý do phát triển | 5 hours | ℹ️ Low |

**C. Báo cáo định kỳ**
- Weekly Summary Report
- Monthly Compliance Report  
- Quarterly Trend Analysis

#### 9.1.4 Tích hợp Lark Base - Đẩy dữ liệu báo cáo tự động

##### 9.1.4.1 Mục đích tích hợp
- Đồng bộ dữ liệu báo cáo từ PIM sang Lark Base
- Tạo dashboard trực quan trên Lark Base cho leadership
- Chia sẻ báo cáo real-time với stakeholders
- Tận dụng tính năng collaboration của Lark Suite

##### 9.1.4.2 Kiến trúc tích hợp

**A. Lark Base API Integration**
```
PIM System → API Gateway → Lark Base API → Lark Base Tables
```

**B. Authentication & Security**
- Sử dụng Lark App Credentials (App ID + App Secret)
- OAuth 2.0 flow cho authorization
- API Rate limiting và retry mechanism
- Encryption dữ liệu khi truyền

##### 9.1.4.3 Cấu trúc dữ liệu trên Lark Base

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

##### 9.1.4.4 Lịch đồng bộ dữ liệu

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

##### 9.1.4.5 API Workflow

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

##### 9.1.4.6 Cấu hình tích hợp

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

##### 9.1.4.7 Dashboard trên Lark Base

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

#### 9.1.5 Notification system đơn giản
- Thông báo khi có tài liệu mới được tạo/cập nhật
- Nhắc nhở cập nhật tài liệu bắt buộc theo deadline
- Alert khi có thay đổi trong tài liệu có quyền truy cập
- Integration với hệ thống kiểm tra tự động
- **Push notifications qua Lark Bot**

#### 9.1.6 Backup và bảo mật
- Sao lưu dữ liệu định kỳ
- Mã hóa file nhạy cảm
- Log hoạt động người dùng
- Two-factor authentication

### 9.2 Yêu cầu phi chức năng

#### 9.2.1 Hiệu năng
- Thời gian tải trang < 3 giây
- Hỗ trợ đồng thời 100+ người dùng
- Upload file < 30 giây cho file 100MB

#### 9.2.2 Khả năng mở rộng
- Architecture microservices
- Database có thể scale horizontal
- API RESTful cho tích hợp

#### 9.2.3 Tương thích
- Responsive design cho mobile
- Hỗ trợ các trình duyệt chính
- API cho mobile app

## 10. BÁO CÁO VÀ THỐNG KÊ

### 10.1 Báo cáo tự động kiểm tra tài liệu

#### 10.1.1 Báo cáo hàng ngày (Daily Report)
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
- SKU001: [PUR] Thiếu hợp đồng mua bán (Quá hạn 3 ngày) - Phòng Mua hàng
- SKU002: [RND] Giấy công bố hết hạn hôm nay - Phòng Nghiên cứu & Phát triển

⚠️ WARNING (Sắp đến hạn):
- SKU003: [RND→MKT] Giấy phép quảng cáo hết hạn sau 7 ngày - RnD chủ quản, MKT cần biết
```

#### 10.1.2 Báo cáo tuần (Weekly Report)
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

#### 10.1.3 Báo cáo tháng (Monthly Report)
**A. Compliance Score theo phòng ban**
- Điểm tuân thủ từ 0-100
- So sánh với tháng trước
- Ranking các phòng ban

**B. Xu hướng và phân tích**
- Biểu đồ số lượng cảnh báo theo thời gian
- Các loại tài liệu thường bị thiếu nhất
- Thời gian trung bình xử lý cảnh báo

#### 10.1.4 Báo cáo đặc biệt (Special Reports)

**A. Audit Report (Quarterly)**
- Kiểm tra toàn diện tất cả tài liệu
- Phát hiện dữ liệu bất thường
- Đề xuất cải thiện quy trình

**B. Performance Report**
- Hiệu suất xử lý của từng phòng ban
- Thời gian phản hồi trung bình
- KPI tuân thủ tài liệu

### 10.2 Báo cáo cho quản lý
- Báo cáo tình trạng tài liệu theo phòng ban
- Thống kê số lượng sản phẩm, lô hàng  
- Báo cáo hoạt động người dùng
- Báo cáo tài liệu thiếu/chưa cập nhật
- **Dashboard cảnh báo real-time**
- **Compliance score theo KPI**

### 10.3 Dashboard analytics
- Biểu đồ tăng trưởng số lượng tài liệu
- Top tài liệu được truy cập nhiều nhất
- Thống kê theo thời gian thực

### 10.4 Báo cáo trên Lark Base

#### 10.4.1 Executive Reports (Báo cáo điều hành)
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

#### 10.4.2 Operational Dashboards
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

#### 10.4.3 Automated Reporting Features

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
- Real-time document sharing
- Cross-department visibility và comments

#### 10.4.4 Sample Lark Base Views

**A. "Management Overview" View**
```
Department | Products | Compliance | Critical | Trend | Action
-----------|----------|------------|----------|-------|--------
Marketing  |    25    |    95%     |    0     |  ↗️    | -
ECOM       |    18    |    92%     |    1     |  ↗️    | Review
RnD        |    22    |    89%     |    2     |  →     | Follow-up
Purchasing |    30    |    78%     |    5     |  ↘️    | Urgent
```

**B. "Alert Monitor" View với phân công rõ ràng**  
```
Priority | SKU   | Document Missing     | Responsible Dept | Owner      | Secondary Access | Days Overdue | Status
---------|-------|---------------------|------------------|------------|------------------|--------------|--------
🔴 High   | P001  | Hợp đồng mua bán    | PUR (Primary)    | Minh.NT    | WH, LEG          |      3       | In Progress
🔴 High   | P025  | Giấy công bố        | RND (Primary)    | Linh.VT    | LEG              |      1       | Pending  
⚠️ Medium | P038  | Ảnh sản phẩm        | MKT (Primary)    | Duc.LM     | ECOM, COM        |      0       | New
⚠️ Medium | P040  | Content ECOM        | ECOM (Primary)   | Mai.HT     | MKT              |      2       | Assigned
```

**C. "Department Responsibility" View**
```
Department | Primary Owner Tasks | Secondary Access Tasks | Overdue | This Week | Total Workload
-----------|-------------------|------------------------|---------|-----------|---------------
PUR        |         8         |          3             |    2    |     6     |      High
RND        |        12         |          5             |    1    |     8     |     Medium  
MKT        |         6         |          8             |    0    |     4     |      Low
ECOM       |         4         |          6             |    1    |     3     |      Low
```

#### 10.4.5 Integration Benefits
✅ **Real-time visibility** cho leadership
✅ **Collaborative workflow** giữa các phòng ban  
✅ **Mobile access** qua Lark mobile app
✅ **Automated notifications** và reminders
✅ **Historical tracking** và trend analysis
✅ **Easy sharing** với external stakeholders
✅ **No additional training** - sử dụng Lark có sẵn

## 11. ROADMAP TRIỂN KHAI

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
- Simple notification system
- Mobile responsive design
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

## 12. KẾT LUẬN

Hệ thống PIM này cung cấp giải pháp **quản lý thông tin và tài liệu sản phẩm tập trung**, không phải hệ thống quản lý kho, đảm bảo:

- **Tổ chức thông tin**: Cấu trúc rõ ràng theo phòng ban, kho và loại tài liệu
- **Quản lý tài liệu hiệu quả**: Version control, lịch sử thay đổi, phân quyền chặt chẽ
- **Theo dõi tuân thủ**: Kiểm tra tự động tài liệu bắt buộc, cảnh báo hết hạn
- **Phân quyền linh hoạt**: Primary Owner + Secondary Access model
- **Tích hợp Lark Base**: Báo cáo và dashboard real-time cho leadership
- **Giao diện thân thiện**: Admin panel và user portal trực quan

**Phạm vi rõ ràng:**
- ✅ Quản lý **THÔNG TIN** sản phẩm, kho, lô hàng
- ✅ Quản lý **TÀI LIỆU** và version control  
- ❌ Không quản lý số lượng, xuất nhập kho, vận hành

Hệ thống này giúp doanh nghiệp quản lý thông tin sản phẩm một cách **chuyên nghiệp, có tổ chức và tuân thủ quy định**.