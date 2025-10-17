# TÍCH HỢP LARK BASE CHO HỆ THỐNG PIM - CẬP NHẬT MỚI NHẤT

## 1. TỔNG QUAN TÍCH HỢP

### 1.1 Mục đích tích hợp theo mô hình Primary Owner + Secondary Access
- **Báo cáo thời gian thực**: Đẩy dữ liệu từ PIM sang Lark Base với phân quyền rõ ràng theo phòng ban
- **Department Responsibility Tracking**: Theo dõi trách nhiệm từng phòng ban (Primary Owner vs Secondary Access)
- **Smart Notifications**: Thông báo có định tuyến theo phòng ban chịu trách nhiệm
- **Executive Visibility**: Dashboard cấp cao với phân tích cross-department collaboration
- **Mobile Access**: Truy cập báo cáo và nhận thông báo qua Lark mobile app

### 1.2 Kiến trúc tổng thể mới
```
┌─────────────┐    Smart API   ┌─────────────┐    Dept-based  ┌─────────────┐
│ PIM System  │ ──────────────→ │ Lark Base   │ ──────────────→ │ Lark Bot    │
│ (Dept-aware)│                │ Tables      │   Notifications │ (Per Dept)  │
└─────────────┘                └─────────────┘                └─────────────┘
       │                              │                              │
       │   Department-based           │      Department-specific     │
       ▼   Sync Rules                 ▼      Dashboard Views        ▼
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│ Background  │                │ Executive   │                │ Dept Chat   │
│ Jobs        │                │ Dashboard   │                │ Groups      │
│ + Routing   │                │ + Dept Views│                │ + @mentions │
└─────────────┘                └─────────────┘                └─────────────┘
```

## 2. CẤU TRÚC LARK BASE THEO MÔ HÌNH MỚI

### 2.1 Danh sách các Base và Table

#### Base: "PIM Department Compliance Dashboard"

**Table 1: Products Overview với Department Responsibility** (`tbl_products_overview`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| sku | Single Line Text | Mã SKU sản phẩm | `fld_sku` |
| product_name | Single Line Text | Tên sản phẩm | `fld_product_name` |
| primary_owner_dept | Single Select | Phòng ban chủ quản (Primary Owner) | `fld_primary_dept` |
| secondary_access_depts | Multiple Select | Phòng ban có quyền truy cập | `fld_secondary_depts` |
| product_status | Single Select | Active/Development/Discontinued | `fld_product_status` |
| total_documents | Number | Tổng số tài liệu | `fld_total_docs` |
| required_documents | Number | Tài liệu bắt buộc | `fld_required_docs` |
| completed_documents | Number | Tài liệu đã hoàn thành | `fld_completed_docs` |
| compliance_percentage | Number | % Tuân thủ | `fld_compliance_pct` |
| critical_alerts | Number | Cảnh báo Critical cần xử lý ngay | `fld_critical_alerts` |
| warning_alerts | Number | Cảnh báo Warning sắp đến hạn | `fld_warning_alerts` |
| responsible_person | Single Line Text | Người phụ trách chính | `fld_responsible_person` |
| last_updated | Date | Ngày cập nhật cuối | `fld_last_updated` |
| next_review_date | Date | Ngày review tiếp theo | `fld_next_review` |

**Table 2: Department Alert Monitor** (`tbl_dept_alert_monitor`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| alert_id | Single Line Text | ID cảnh báo duy nhất | `fld_alert_id` |
| created_date | Date | Ngày tạo cảnh báo | `fld_created_date` |
| priority | Single Select | Critical/Warning/Info | `fld_priority` |
| sku | Link to Records | Liên kết đến Products | `fld_sku_link` |
| responsible_department | Single Select | Phòng ban chịu trách nhiệm chính | `fld_responsible_dept` |
| involved_departments | Multiple Select | Phòng ban liên quan (Secondary) | `fld_involved_depts` |
| document_type | Single Line Text | Loại tài liệu thiếu/hết hạn | `fld_doc_type` |
| alert_message | Long Text | Nội dung cảnh báo chi tiết | `fld_alert_message` |
| due_date | Date | Ngày đến hạn | `fld_due_date` |
| days_overdue | Number | Số ngày quá hạn | `fld_days_overdue` |
| primary_assigned | Single Line Text | Người phụ trách chính (Primary Owner) | `fld_primary_assigned` |
| secondary_notified | Multiple Select | Người được thông báo (Secondary Access) | `fld_secondary_notified` |
| status | Single Select | New/Assigned/In Progress/Resolved/Escalated | `fld_status` |
| escalation_level | Single Select | None/Department Admin/Super Admin | `fld_escalation` |
| resolution_notes | Long Text | Ghi chú xử lý | `fld_resolution` |

**Table 3: Department Performance Tracking** (`tbl_dept_performance`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| report_date | Date | Ngày báo cáo | `fld_report_date` |
| department | Single Select | Phòng ban | `fld_department` |
| primary_owner_products | Number | Sản phẩm làm Primary Owner | `fld_primary_products` |
| secondary_access_products | Number | Sản phẩm có Secondary Access | `fld_secondary_products` |
| total_responsibilities | Number | Tổng trách nhiệm | `fld_total_responsibilities` |
| compliant_primary | Number | Primary tasks tuân thủ | `fld_compliant_primary` |
| compliant_secondary | Number | Secondary tasks tuân thủ | `fld_compliant_secondary` |
| overall_compliance_score | Number | Điểm tuân thủ tổng thể (0-100) | `fld_overall_compliance` |
| primary_compliance_score | Number | Điểm tuân thủ Primary Owner | `fld_primary_compliance` |
| secondary_compliance_score | Number | Điểm tuân thủ Secondary Access | `fld_secondary_compliance` |
| critical_alerts_primary | Number | Critical alerts (Primary) | `fld_critical_primary` |
| critical_alerts_secondary | Number | Critical alerts (Secondary) | `fld_critical_secondary` |
| avg_response_time | Number | TG phản hồi TB (giờ) | `fld_avg_response` |
| cross_dept_collaboration | Number | Điểm hợp tác liên phòng ban | `fld_collaboration_score` |
| trend_direction | Single Select | ↗️ Improving/→ Stable/↘️ Declining | `fld_trend` |
| improvement_actions | Long Text | Hành động cải thiện | `fld_actions` |

**Table 4: Cross-Department Document Tracking** (`tbl_cross_dept_docs`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| sku | Link to Records | Liên kết đến Products | `fld_sku_link` |
| document_name | Single Line Text | Tên tài liệu | `fld_doc_name` |
| document_type | Single Select | Loại tài liệu | `fld_doc_type` |
| primary_owner_dept | Single Select | Phòng ban chủ quản | `fld_primary_dept` |
| secondary_access_depts | Multiple Select | Phòng ban có quyền truy cập | `fld_secondary_depts` |
| current_expiry_date | Date | Ngày hết hạn hiện tại | `fld_current_expiry` |
| renewal_due_date | Date | Ngày cần gia hạn | `fld_renewal_due` |
| days_to_expiry | Formula | Số ngày còn lại | `fld_days_to_expiry` |
| renewal_status | Single Select | Not Started/In Progress/Completed | `fld_renewal_status` |
| primary_responsible | Single Line Text | Người phụ trách chính | `fld_primary_responsible` |
| secondary_stakeholders | Multiple Select | Stakeholders từ phòng ban khác | `fld_secondary_stakeholders` |
| impact_departments | Multiple Select | Phòng ban bị ảnh hưởng nếu hết hạn | `fld_impact_depts` |
| renewal_cost | Number | Chi phí gia hạn | `fld_renewal_cost` |
| vendor_contact | Single Line Text | Liên hệ nhà cung cấp | `fld_vendor_contact` |

**Table 5: Department Workload Management** (`tbl_dept_workload`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| department | Single Select | Phòng ban | `fld_department` |
| week_starting | Date | Tuần bắt đầu | `fld_week_start` |
| primary_tasks_total | Number | Tổng tasks Primary Owner | `fld_primary_total` |
| primary_tasks_urgent | Number | Tasks Primary Owner khẩn cấp | `fld_primary_urgent` |
| primary_tasks_overdue | Number | Tasks Primary Owner quá hạn | `fld_primary_overdue` |
| secondary_tasks_total | Number | Tổng tasks Secondary Access | `fld_secondary_total` |
| secondary_tasks_urgent | Number | Tasks Secondary Access khẩn cấp | `fld_secondary_urgent` |
| cross_dept_requests | Number | Yêu cầu từ phòng ban khác | `fld_cross_requests` |
| workload_status | Single Select | Light/Normal/Heavy/Overloaded | `fld_workload_status` |
| team_capacity | Number | Sức chứa team (%) | `fld_team_capacity` |
| recommended_actions | Long Text | Đề xuất hành động | `fld_recommended_actions` |

## 3. API INTEGRATION THEO MÔ HÌNH MỚI

### 3.1 Authentication Setup với phân quyền theo phòng ban

```python
# config/lark_config.py
LARK_CONFIG = {
    'app_id': 'cli_xxxxxxxxxxxxx',
    'app_secret': 'xxxxxxxxxxxxxxxxxxxx',
    'base_token': 'bascnxxxxxxxxxxxxxxxxxx',
    'department_mapping': {
        'RND': 'Research & Development',
        'MKT': 'Marketing', 
        'ECOM': 'E-commerce',
        'PUR': 'Purchasing',
        'LEG': 'Legal',
        'WH': 'Warehouse',
        'COM': 'Communication'
    },
    'notification_groups': {
        'RND': 'oc_xxxxxxxxxxxxx',  # Group chat ID cho phòng RND
        'MKT': 'oc_xxxxxxxxxxxxx',  # Group chat ID cho phòng Marketing
        'PUR': 'oc_xxxxxxxxxxxxx',  # Group chat ID cho phòng Purchasing
        # ... các phòng ban khác
    }
}

# API Endpoints với department routing
LARK_BASE_API = "https://open.larksuite.com/open-apis/bitable/v1"
LARK_BOT_API = "https://open.larksuite.com/open-apis/im/v1"
```

### 3.2 Data Sync Functions với Department Responsibility

#### 3.2.1 Products Sync với Primary Owner + Secondary Access
```python
def sync_products_to_lark():
    """
    Đồng bộ thông tin sản phẩm với Primary Owner + Secondary Access
    """
    # Lấy dữ liệu từ PIM database với department responsibility
    products = get_products_with_department_responsibility()
    
    # Format data cho Lark Base với Primary Owner + Secondary Access model
    lark_records = []
    for product in products:
        record = {
            "fields": {
                "fld_sku": product.sku,
                "fld_product_name": product.name,
                "fld_primary_dept": product.primary_owner_department,
                "fld_secondary_depts": product.secondary_access_departments,
                "fld_product_status": product.status,
                "fld_total_docs": product.total_documents,
                "fld_required_docs": product.required_documents,
                "fld_completed_docs": product.completed_documents,
                "fld_compliance_pct": round(product.compliance_percentage, 2),
                "fld_critical_alerts": product.critical_alerts_count,
                "fld_warning_alerts": product.warning_alerts_count,
                "fld_responsible_person": product.primary_responsible_person,
                "fld_last_updated": product.updated_at.isoformat(),
                "fld_next_review": calculate_next_review_date(product)
            }
        }
        lark_records.append(record)
    
    # Batch update to Lark Base với department-aware routing
    return batch_update_lark_table("tbl_products_overview", lark_records)
```

#### 3.2.2 Department Alert Sync với Smart Routing
```python
def sync_department_alerts_to_lark():
    """
    Đồng bộ cảnh báo với phân định rõ ràng trách nhiệm phòng ban
    """
    # Lấy alerts mới trong 24h qua với department routing
    alerts = get_recent_alerts_with_department_routing(hours=24)
    
    lark_records = []
    for alert in alerts:
        record = {
            "fields": {
                "fld_alert_id": alert.id,
                "fld_created_date": alert.created_at.date().isoformat(),
                "fld_priority": map_priority(alert.priority),
                "fld_sku_link": [get_product_record_id(alert.sku)],
                "fld_responsible_dept": alert.primary_responsible_department,
                "fld_involved_depts": alert.secondary_involved_departments,
                "fld_doc_type": alert.document_type,
                "fld_alert_message": f"[{alert.primary_responsible_department}] {alert.message}",
                "fld_due_date": alert.due_date.isoformat() if alert.due_date else None,
                "fld_days_overdue": alert.days_overdue,
                "fld_primary_assigned": alert.primary_assigned_person,
                "fld_secondary_notified": alert.secondary_notified_persons,
                "fld_status": "New"
            }
        }
        lark_records.append(record)
    
    return batch_create_lark_records("tbl_alert_monitor", lark_records)
```

### 3.3 Department Performance Sync với Primary/Secondary Tracking
```python
def sync_department_performance_to_lark():
    """
    Đồng bộ performance của phòng ban với Primary Owner + Secondary Access tracking
    """
    # Calculate performance metrics cho từng department
    departments = ['RND', 'MKT', 'ECOM', 'PUR', 'LEG', 'WH', 'COM']
    
    lark_records = []
    for dept_code in departments:
        metrics = calculate_department_metrics_with_roles(dept_code)
        
        record = {
            "fields": {
                "fld_department": dept_code,
                "fld_primary_products": metrics.primary_owner_products,
                "fld_secondary_products": metrics.secondary_access_products,
                "fld_total_responsibilities": metrics.total_responsibilities,
                "fld_compliant_primary": metrics.compliant_primary_tasks,
                "fld_compliant_secondary": metrics.compliant_secondary_tasks,
                "fld_overall_compliance": round(metrics.overall_compliance_score, 2),
                "fld_primary_compliance": round(metrics.primary_compliance_score, 2),
                "fld_secondary_compliance": round(metrics.secondary_compliance_score, 2),
                "fld_critical_primary": metrics.critical_alerts_primary,
                "fld_critical_secondary": metrics.critical_alerts_secondary,
                "fld_avg_response": round(metrics.avg_response_time_hours, 1),
                "fld_collaboration_score": round(metrics.cross_dept_collaboration_score, 2),
                "fld_trend": determine_trend_direction(metrics),
                "fld_actions": generate_improvement_actions(metrics)
            }
        }
        lark_records.append(record)
    
    return batch_update_lark_table("tbl_dept_performance", lark_records)

def calculate_department_metrics_with_roles(dept_code):
    """
    Tính toán metrics phòng ban với phân biệt Primary Owner vs Secondary Access
    """
    # Primary Owner responsibilities
    primary_products = get_products_where_primary_owner(dept_code)
    primary_compliance = calculate_compliance_score(primary_products, role="primary")
    
    # Secondary Access responsibilities  
    secondary_products = get_products_where_secondary_access(dept_code)
    secondary_compliance = calculate_compliance_score(secondary_products, role="secondary")
    
    # Cross-department collaboration score
    collaboration_score = calculate_collaboration_effectiveness(dept_code)
    
    return DepartmentMetrics(
        primary_owner_products=len(primary_products),
        secondary_access_products=len(secondary_products),
        primary_compliance_score=primary_compliance,
        secondary_compliance_score=secondary_compliance,
        cross_dept_collaboration_score=collaboration_score
    )
```

### 3.4 Real-time Notification System với Department Routing
```python
def send_department_alert_notification(alert_data):
    """
    Gửi thông báo có department routing rõ ràng
    """
    primary_dept = alert_data['primary_responsible_department']
    secondary_depts = alert_data.get('secondary_involved_departments', [])
    
    # Primary notification với full responsibility
    primary_message = f"""
🚨 **[{primary_dept}] CẢNH BÁO CHÍNH - CẦN XỬ LÝ**
    
📦 **Sản phẩm:** {alert_data['sku']} - {alert_data['product_name']}
📋 **Tài liệu:** {alert_data['document_type']}
⚠️ **Mức độ:** {alert_data['priority']}
📅 **Hạn chót:** {alert_data['due_date']}
👤 **Phụ trách:** {alert_data['assigned_person']}

**TRÁCH NHIỆM:** {primary_dept} là phòng ban CHÍNH cần xử lý vấn đề này.
    """
    
    send_lark_group_message(
        group_id=LARK_CONFIG['notification_groups'][primary_dept],
        message=primary_message,
        message_type="interactive"
    )
    
    # Secondary notifications với thông tin hỗ trợ
    for secondary_dept in secondary_depts:
        secondary_message = f"""
ℹ️ **[{secondary_dept}] THÔNG BÁO HỖ TRỢ - {primary_dept}→{secondary_dept}**
        
📦 **Sản phẩm:** {alert_data['sku']} - {alert_data['product_name']}
📋 **Tài liệu:** {alert_data['document_type']}
        
**THÔNG TIN:** {primary_dept} đang xử lý, {secondary_dept} theo dõi để hỗ trợ nếu cần.
        """
        
        send_lark_group_message(
            group_id=LARK_CONFIG['notification_groups'][secondary_dept],
            message=secondary_message,
            message_type="text"
        )
```

### 3.5 Scheduled Jobs với Department-aware Processing

#### 3.5.1 Cron Job Configuration
```python
# settings.py - Django Celery Beat Schedule với department routing
CELERY_BEAT_SCHEDULE = {
    # Sync products với Primary/Secondary tracking mỗi 2 giờ
    'sync-products-with-dept-roles': {
        'task': 'pim.tasks.sync_products_to_lark_with_roles',
        'schedule': crontab(minute=0, hour='*/2'),
    },
    
    # Sync alerts với smart department routing mỗi 15 phút
    'sync-dept-alerts': {
        'task': 'pim.tasks.sync_department_alerts_to_lark', 
        'schedule': crontab(minute='*/15'),
    },
    
    # Department performance với Primary/Secondary metrics hàng ngày
    'daily-dept-performance-with-roles': {
        'task': 'pim.tasks.sync_dept_performance_with_roles',
        'schedule': crontab(hour=1, minute=0),  # 1:00 AM daily
    },
    
    # Cross-department collaboration tracking hàng tuần
    'weekly-collaboration-analysis': {
        'task': 'pim.tasks.analyze_cross_dept_collaboration',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),  # Sunday 2:00 AM
    },
    
    # Department workload balancing check
    'workload-balancing-check': {
        'task': 'pim.tasks.check_department_workload_balance',
        'schedule': crontab(hour=8, minute=0),  # 8:00 AM daily
    }
}
```

## 4. DASHBOARD VIEWS TRÊN LARK BASE THEO MÔ HÌNH DEPARTMENT-AWARE

### 4.1 Executive Dashboard View - Multi-Department Overview

#### View: "Management Overview với Primary/Secondary Tracking"
**Filters:**
- Department: All/Specific Department  
- Responsibility Type: Primary Owner/Secondary Access/Both
- Time Range: Last 7 days / Last 30 days / Custom

**Columns hiển thị:**
| Column | Description | Purpose |
|--------|-------------|---------|
| Department | Mã phòng ban | Identification |
| Primary Products | Số sản phẩm làm Primary Owner | Primary responsibility |
| Secondary Products | Số sản phẩm có Secondary Access | Secondary involvement |
| Primary Compliance | Điểm tuân thủ Primary (%) | Core performance |
| Secondary Compliance | Điểm tuân thủ Secondary (%) | Support performance |
| Critical Alerts (P) | Critical alerts Primary Owner | Primary urgency |
| Critical Alerts (S) | Critical alerts Secondary | Secondary urgency |
| Collaboration Score | Điểm hợp tác liên phòng ban | Cross-dept effectiveness |
| Trend | ↗️↘️→ | Performance direction |

**Conditional Formatting với Department Role Context:**
```
Primary Compliance Score:
- 95-100%: Dark Green (Excellent primary ownership)
- 85-94%: Light Green (Good primary performance)  
- 70-84%: Yellow (Primary needs attention)
- <70%: Red (Primary critical issues)

Secondary Compliance Score:
- 90-100%: Blue (Excellent support)
- 75-89%: Light Blue (Good support)
- 60-74%: Orange (Support needs improvement)
- <60%: Dark Orange (Poor support)

Critical Alerts:
- Primary: Red highlighting for urgent primary responsibilities
- Secondary: Orange highlighting for secondary support needs
```

#### View: "Critical Issues với Department Responsibility"
**Filters:**
- Priority: Critical only
- Responsibility Type: Primary/Secondary
- Department: All/Specific
- Status: New/In Progress

**Custom Fields hiển thị:**
- `[DEPT] Alert Message` - Hiển thị rõ department code
- Primary Assigned Person
- Secondary Notified Departments
- Days Overdue
- Impact on Other Departments

**Sort:** 
1. Primary responsibilities (higher priority)
2. Days Overdue (Descending)
3. Impact scope (cross-department issues first)

### 4.2 Department Manager Dashboard - Role-specific Views

#### View: "My Department - Primary Responsibilities"
**Filter cứng:** Department = Current User's Department AND Responsibility = Primary Owner

**Columns tối ưu cho Primary Owner:**
- SKU & Product Name
- Document Type  
- Compliance Status
- Days to Deadline
- Assigned Team Member
- Secondary Departments Involved
- Impact if Failed

#### View: "My Department - Secondary Support Tasks"  
**Filter cứng:** Department = Current User's Department AND Responsibility = Secondary Access

**Columns tối ưu cho Secondary Support:**
- SKU & Product Name
- Primary Owner Department
- Support Required
- Our Role/Contribution
- Timeline
- Support Status

#### View: "Cross-Department Collaboration"
**Filter:** Showing tasks where current department collaborates with others

**Columns:**
- Primary Owner Dept → Secondary Dept
- Collaboration Type
- Our Responsibility Level
- Communication Status
- Shared Documents
- Joint Deadlines

### 4.3 Team Lead Dashboard - Workload Management

#### View: "Department Workload với Primary/Secondary Balance"
**Purpose:** Cân bằng khối lượng công việc Primary vs Secondary

**Key Metrics:**
- Primary Tasks Count & Urgency
- Secondary Tasks Count & Urgency  
- Cross-Department Requests
- Team Capacity Utilization
- Recommended Actions

**Visual Indicators:**
```
Workload Status:
- Light (Green): <70% capacity, good balance
- Normal (Blue): 70-85% capacity, manageable
- Heavy (Yellow): 85-95% capacity, monitor closely  
- Overloaded (Red): >95% capacity, redistribute tasks
```

#### View: "Collaboration Effectiveness Tracking"
**Purpose:** Theo dõi hiệu quả hợp tác liên phòng ban

**Metrics:**
- Response time to cross-department requests
- Success rate of joint projects
- Communication quality score
- Resource sharing effectiveness
- Conflict resolution time

### 4.4 Individual Contributor Dashboard

#### View: "My Tasks với Department Context"
**Personal view filtered by assigned person**

**Sections:**
1. **Primary Responsibilities** (Tasks where my department is Primary Owner)
   - My direct assignments
   - High priority items
   - Approaching deadlines

2. **Secondary Support Tasks** (Tasks where my department provides support)
   - Support requests from other departments
   - Information sharing requirements
   - Review/approval tasks

3. **Cross-Department Communications**
   - Messages requiring response
   - Collaborative documents
   - Meeting action items

### 4.5 Real-time Monitoring Views

#### View: "Live Alert Feed với Department Routing"
**Auto-refresh mỗi 5 phút**

**Filter tabs:**
- All Alerts
- Primary Responsibility (my department)
- Secondary Involvement (my department)
- Cross-Department Issues
- Escalated Issues

**Alert Format:**
```
🚨 [PRIMARY-DEPT] → [SECONDARY-DEPTS] 
Product: SKU-123 | Document: Certificate
Assigned: Person Name | Due: 2 days
Status: ⚠️ Needs Attention
## 5. AUTOMATION & NOTIFICATION SYSTEM THEO DEPARTMENT ROUTING

### 5.1 Smart Notification Routing với Primary/Secondary Logic

#### 5.1.1 Alert Severity Routing
```python
def route_alert_by_department_role(alert):
    """
    Định tuyến thông báo dựa trên vai trò phòng ban và mức độ nghiêm trọng
    """
    primary_dept = alert.primary_responsible_department
    secondary_depts = alert.secondary_involved_departments
    severity = alert.severity_level
    
    routing_config = {
        "CRITICAL": {
            "primary_channels": ["lark_group", "email", "sms"],
            "secondary_channels": ["lark_group", "email"],
            "escalation_time": 2,  # hours
            "executive_notification": True
        },
        "HIGH": {
            "primary_channels": ["lark_group", "email"],
            "secondary_channels": ["lark_group"],
            "escalation_time": 4,  # hours
            "executive_notification": False
        },
        "MEDIUM": {
            "primary_channels": ["lark_group"],
            "secondary_channels": ["daily_digest"],
            "escalation_time": 24,  # hours
            "executive_notification": False
        }
    }
    
    config = routing_config[severity]
    
    # Send to Primary department với full responsibility
    send_primary_notification(
        department=primary_dept,
        alert=alert,
        channels=config["primary_channels"],
        message_type="action_required"
    )
    
    # Send to Secondary departments với support context
    for secondary_dept in secondary_depts:
        send_secondary_notification(
            department=secondary_dept,
            alert=alert,
            channels=config["secondary_channels"],
            message_type="fyi_support"
        )
    
    # Executive escalation if needed
    if config["executive_notification"]:
        schedule_executive_escalation(alert, config["escalation_time"])

def send_primary_notification(department, alert, channels, message_type):
    """
    Gửi thông báo đến phòng ban Primary Owner với trách nhiệm đầy đủ
    """
    message_template = get_primary_notification_template(alert.document_type)
    
    message = format_primary_message(
        template=message_template,
        alert=alert,
        department=department,
        urgency_level=alert.severity_level
    )
    
    for channel in channels:
        if channel == "lark_group":
            send_lark_message_with_actions(
                group_id=DEPT_GROUP_IDS[department],
                message=message,
                action_buttons=["Accept", "Delegate", "Escalate"]
            )
        elif channel == "email":
            send_department_email(
                department=department,
                subject=f"[{department}] {alert.subject}",
                message=message,
                priority="high"
            )

def send_secondary_notification(department, alert, channels, message_type):
    """
    Gửi thông báo đến phòng ban Secondary Access với context hỗ trợ
    """
    primary_dept = alert.primary_responsible_department
    
    message = f"""
ℹ️ **[{department}] THÔNG BÁO HỖ TRỢ - {primary_dept}→{department}**

📦 **Sản phẩm:** {alert.sku} - {alert.product_name}
📋 **Vấn đề:** {alert.document_type} - {alert.description}
👥 **Primary Owner:** {primary_dept} đang xử lý
🤝 **Vai trò của {department}:** {get_support_role_description(alert, department)}

**Hành động cần thiết từ {department}:**
{get_secondary_action_items(alert, department)}
    """
    
    for channel in channels:
        if channel == "lark_group":
            send_lark_message(
                group_id=DEPT_GROUP_IDS[department],
                message=message,
                message_type="info"
            )
```

### 5.2 Cross-Department Collaboration Workflows

#### 5.2.1 Document Handoff Process
```python
def initiate_cross_department_handoff(document, from_dept, to_dept, handoff_type):
    """
    Khởi tạo quy trình chuyển giao tài liệu giữa các phòng ban
    """
    handoff_types = {
        "primary_transfer": "Chuyển Primary Owner ownership",
        "secondary_request": "Yêu cầu Secondary Access support", 
        "review_request": "Yêu cầu review/approve từ phòng ban khác",
        "information_sharing": "Chia sẻ thông tin cần thiết"
    }
    
    # Create handoff request
    handoff_request = create_handoff_request(
        document=document,
        from_department=from_dept,
        to_department=to_dept,
        type=handoff_type,
        status="pending_acceptance"
    )
    
    # Notify receiving department
    notify_handoff_request(handoff_request)
    
    # Update Lark Base with handoff tracking
    sync_handoff_to_lark_base(handoff_request)
    
    return handoff_request

def notify_handoff_request(handoff_request):
    """
    Thông báo yêu cầu handoff đến phòng ban đích
    """
    to_dept = handoff_request.to_department
    from_dept = handoff_request.from_department
    
    message = f"""
🔄 **[{to_dept}] YÊU CẦU CHUYỂN GIAO - {from_dept}→{to_dept}**

📋 **Tài liệu:** {handoff_request.document.name}
📦 **Sản phẩm:** {handoff_request.document.sku}
🔄 **Loại chuyển giao:** {handoff_request.type_description}

**Thông tin từ {from_dept}:**
{handoff_request.handoff_notes}

**Yêu cầu từ {to_dept}:**
{handoff_request.required_actions}

⏰ **Thời hạn phản hồi:** {handoff_request.response_deadline}
    """
    
    send_lark_message_with_actions(
        group_id=DEPT_GROUP_IDS[to_dept],
        message=message,
        action_buttons=["Accept", "Request Info", "Decline", "Escalate"]
    )
```

### 5.3 Executive Reporting & Escalation

#### 5.3.1 Automated Executive Alerts
```python
def generate_executive_alert_summary():
    """
    Tạo báo cáo tóm tắt cho leadership với department breakdown
    """
    # Get critical issues by department
    critical_issues = get_critical_issues_by_department()
    
    # Get cross-department conflicts
    conflicts = get_cross_department_conflicts()
    
    # Get performance trends
    performance_trends = get_department_performance_trends(days=7)
    
    summary = {
        "total_critical_issues": sum(len(issues) for issues in critical_issues.values()),
        "departments_at_risk": [dept for dept, issues in critical_issues.items() if len(issues) > 3],
        "cross_dept_conflicts": len(conflicts),
        "performance_declining": [dept for dept, trend in performance_trends.items() if trend < -5],
        "action_items": generate_executive_action_items(critical_issues, conflicts, performance_trends)
    }
    
    # Send to executive group
    send_executive_summary(summary)
    
    # Update executive dashboard in Lark Base
    update_executive_dashboard_lark(summary)

def send_executive_summary(summary):
    """
    Gửi báo cáo tóm tắt đến executive team
    """
    message = f"""
📊 **BÁO CÁO TÌNH HÌNH PIM - EXECUTIVE SUMMARY**

**TÌNH HÌNH TỔNG QUAN:**
• Critical Issues: {summary['total_critical_issues']} vấn đề
• Phòng ban rủi ro: {', '.join(summary['departments_at_risk'])}
• Xung đột liên phòng ban: {summary['cross_dept_conflicts']} cases
• Performance suy giảm: {', '.join(summary['performance_declining'])}

**HÀNH ĐỘNG CẦN THIẾT:**
{format_executive_action_items(summary['action_items'])}

🔗 **Chi tiết:** [Xem Dashboard Executive](link_to_lark_base)
    """
    
    send_lark_message(
        group_id=EXECUTIVE_GROUP_ID,
        message=message,
## 6. API EXAMPLES VÀ IMPLEMENTATION SAMPLES

### 6.1 Lark Base API Integration với Department Context

#### 6.1.1 Authentication với Department Permissions
```python
import requests
from datetime import datetime, timedelta

class LarkBaseAPI:
    def __init__(self):
        self.app_id = LARK_CONFIG['app_id']
        self.app_secret = LARK_CONFIG['app_secret']
        self.base_token = LARK_CONFIG['base_token']
        self.access_token = None
        self.token_expires = None
        
    def get_access_token(self):
        """
        Lấy access token để authenticate với Lark API
        """
        if self.access_token and self.token_expires > datetime.now():
            return self.access_token
            
        url = "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal"
        payload = {
            "app_id": self.app_id,
            "app_secret": self.app_secret
        }
        
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data.get('code') == 0:
            self.access_token = data['tenant_access_token']
            self.token_expires = datetime.now() + timedelta(seconds=data['expire'] - 300)
            return self.access_token
        else:
            raise Exception(f"Failed to get access token: {data}")

    def update_product_with_department_info(self, sku, department_data):
        """
        Update product record với Primary Owner + Secondary Access information
        """
        headers = {
            "Authorization": f"Bearer {self.get_access_token()}",
            "Content-Type": "application/json"
        }
        
        # Find existing record
        record_id = self.find_product_record(sku)
        
        # Prepare update data với department context
        update_data = {
            "fields": {
                "fld_primary_dept": department_data['primary_owner_department'],
                "fld_secondary_depts": department_data['secondary_access_departments'],
                "fld_responsible_person": department_data['primary_responsible_person'],
                "fld_compliance_pct": department_data['compliance_percentage'],
                "fld_critical_alerts": department_data['critical_alerts_count'],
                "fld_last_updated": datetime.now().isoformat()
            }
        }
        
        url = f"{LARK_BASE_API}/apps/{self.base_token}/tables/tbl_products_overview/records/{record_id}"
        
        response = requests.put(url, headers=headers, json=update_data)
        return response.json()

    def create_department_alert(self, alert_data):
        """
        Tạo alert record với department routing information
        """
        headers = {
            "Authorization": f"Bearer {self.get_access_token()}",
            "Content-Type": "application/json"
        }
        
        record_data = {
            "fields": {
                "fld_alert_id": alert_data['id'],
                "fld_created_date": alert_data['created_at'].date().isoformat(),
                "fld_priority": alert_data['priority'],
                "fld_sku_link": [self.find_product_record(alert_data['sku'])],
                "fld_responsible_dept": alert_data['primary_responsible_department'],
                "fld_involved_depts": alert_data['secondary_involved_departments'],
                "fld_alert_message": f"[{alert_data['primary_responsible_department']}] {alert_data['message']}",
                "fld_due_date": alert_data['due_date'].isoformat() if alert_data['due_date'] else None,
                "fld_primary_assigned": alert_data['primary_assigned_person'],
                "fld_secondary_notified": alert_data['secondary_notified_persons'],
                "fld_status": "New"
            }
        }
        
        url = f"{LARK_BASE_API}/apps/{self.base_token}/tables/tbl_alert_monitor/records"
        
        response = requests.post(url, headers=headers, json={"records": [record_data]})
        return response.json()
```

### 6.2 Department Performance Calculation
```python
def calculate_department_performance_with_roles(department_code):
    """
    Tính toán performance chi tiết cho phòng ban với Primary/Secondary roles
    """
    # Lấy tất cả products mà department này involved
    primary_products = Product.objects.filter(primary_owner_department=department_code)
    secondary_products = Product.objects.filter(secondary_access_departments__contains=department_code)
    
    # Calculate Primary Owner performance
    primary_metrics = {
        'total_products': primary_products.count(),
        'compliant_products': primary_products.filter(compliance_percentage__gte=95).count(),
        'critical_alerts': sum(p.critical_alerts_count for p in primary_products),
        'avg_compliance': primary_products.aggregate(avg_compliance=Avg('compliance_percentage'))['avg_compliance'] or 0
    }
    
    # Calculate Secondary Access performance  
    secondary_metrics = {
        'total_products': secondary_products.count(),
        'support_provided': calculate_support_quality(secondary_products, department_code),
        'response_time': calculate_avg_response_time(department_code),
        'collaboration_score': calculate_collaboration_effectiveness(department_code)
    }
    
    # Overall department score với weighted calculation
    primary_weight = 0.7  # Primary responsibilities carry more weight
    secondary_weight = 0.3
    
    overall_score = (
        primary_metrics['avg_compliance'] * primary_weight +
        secondary_metrics['collaboration_score'] * secondary_weight
    )
    
    return {
        'department': department_code,
        'primary_metrics': primary_metrics,
        'secondary_metrics': secondary_metrics,
        'overall_score': round(overall_score, 2),
        'performance_trend': calculate_trend_direction(department_code),
        'improvement_actions': generate_improvement_recommendations(primary_metrics, secondary_metrics)
    }

def calculate_collaboration_effectiveness(department_code):
    """
    Tính toán hiệu quả hợp tác của phòng ban với phòng ban khác
    """
    # Get cross-department interactions
    cross_dept_tasks = CrossDepartmentTask.objects.filter(
        Q(primary_department=department_code) | Q(secondary_departments__contains=department_code),
        created_at__gte=timezone.now() - timedelta(days=30)
    )
    
    if not cross_dept_tasks.exists():
        return 0
    
    # Calculate metrics
    total_tasks = cross_dept_tasks.count()
    completed_on_time = cross_dept_tasks.filter(
        status='completed',
        completed_at__lte=F('due_date')
    ).count()
    
    avg_response_time = cross_dept_tasks.aggregate(
        avg_response=Avg('response_time_hours')
    )['avg_response'] or 0
    
    # Score calculation (0-100)
    completion_score = (completed_on_time / total_tasks) * 50
    response_score = min(50, max(0, 50 - (avg_response_time - 24) / 2))  # Penalty after 24h
    
    return round(completion_score + response_score, 2)
```

### 6.3 Real-time Dashboard Updates
```python
def setup_real_time_dashboard_sync():
    """
    Thiết lập đồng bộ real-time cho dashboard với WebSocket
    """
    import asyncio
    import websockets
    from channels.generic.websocket import AsyncWebsocketConsumer
    
    class DepartmentDashboardConsumer(AsyncWebsocketConsumer):
        async def connect(self):
            self.department = self.scope['url_route']['kwargs']['department']
            self.group_name = f'dashboard_{self.department}'
            
            # Join department-specific group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send initial dashboard data
            initial_data = await self.get_department_dashboard_data()
            await self.send(text_data=json.dumps(initial_data))
        
        async def receive(self, text_data):
            data = json.loads(text_data)
            
            if data['type'] == 'request_update':
                # Send updated dashboard data
                dashboard_data = await self.get_department_dashboard_data()
                await self.send(text_data=json.dumps({
                    'type': 'dashboard_update',
                    'data': dashboard_data
                }))
        
        async def dashboard_update(self, event):
            # Send update to WebSocket
            await self.send(text_data=json.dumps({
                'type': 'dashboard_update',
                'data': event['data']
            }))
        
        async def get_department_dashboard_data(self):
            """
            Lấy data dashboard real-time cho department
            """
            department = self.department
            
            # Get current metrics
            performance = await sync_to_async(calculate_department_performance_with_roles)(department)
            recent_alerts = await sync_to_async(get_recent_department_alerts)(department, hours=4)
            workload_status = await sync_to_async(get_current_workload_status)(department)
            
            return {
                'department': department,
                'timestamp': timezone.now().isoformat(),
                'performance': performance,
                'recent_alerts': [serialize_alert(alert) for alert in recent_alerts],
                'workload': workload_status,
                'cross_department_tasks': await sync_to_async(get_cross_dept_tasks)(department)
            }
```

### 6.4 Deployment Configuration
```python
# docker-compose.yml cho PIM + Lark Base integration
version: '3.8'

services:
  pim_backend:
    build: .
    environment:
      - DJANGO_SETTINGS_MODULE=pim.settings.production
      - LARK_APP_ID=${LARK_APP_ID}
      - LARK_APP_SECRET=${LARK_APP_SECRET}
      - LARK_BASE_TOKEN=${LARK_BASE_TOKEN}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
      - postgres
  
  celery_worker:
    build: .
    command: celery -A pim worker -l info
    environment:
      - DJANGO_SETTINGS_MODULE=pim.settings.production
    depends_on:
      - redis
      - postgres
  
  celery_beat:
    build: .
    command: celery -A pim beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    depends_on:
      - redis
      - postgres
  
  redis:
    image: redis:alpine
    
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: pim_db
      POSTGRES_USER: pim_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

## 7. TESTING & VALIDATION PLAN

### 7.1 Department Role Testing
```python
# tests/test_department_roles.py
import pytest
from django.test import TestCase
from pim.models import Product, Department, Alert
from pim.services.department_service import calculate_department_performance_with_roles

class DepartmentRoleTestCase(TestCase):
    def setUp(self):
        self.rnd_dept = Department.objects.create(code='RND', name='Research & Development')
        self.mkt_dept = Department.objects.create(code='MKT', name='Marketing')
        
    def test_primary_owner_responsibility(self):
        """
        Test Primary Owner có full responsibility
        """
        product = Product.objects.create(
            sku='TEST-001',
            name='Test Product',
            primary_owner_department='RND',
            secondary_access_departments=['MKT', 'ECOM']
        )
        
        # RND should have primary responsibility
        rnd_metrics = calculate_department_performance_with_roles('RND')
        self.assertEqual(rnd_metrics['primary_metrics']['total_products'], 1)
        
        # MKT should have secondary involvement  
        mkt_metrics = calculate_department_performance_with_roles('MKT')
        self.assertEqual(mkt_metrics['secondary_metrics']['total_products'], 1)
        self.assertEqual(mkt_metrics['primary_metrics']['total_products'], 0)
    
    def test_alert_routing_by_department_role(self):
        """
        Test alert được route đúng theo department role
        """
        alert = Alert.objects.create(
            sku='TEST-001',
            primary_responsible_department='RND',
            secondary_involved_departments=['MKT'],
            severity='CRITICAL',
            message='Test alert'
        )
        
        # Check routing logic
        routing = get_alert_routing(alert)
        self.assertEqual(routing['primary_notifications'][0]['department'], 'RND')
        self.assertEqual(routing['secondary_notifications'][0]['department'], 'MKT')
        self.assertTrue(routing['primary_notifications'][0]['action_required'])
        self.assertFalse(routing['secondary_notifications'][0]['action_required'])
```

### 7.2 Integration Testing với Lark Base
```python
# tests/test_lark_integration.py
class LarkBaseIntegrationTest(TestCase):
    def setUp(self):
        self.lark_api = LarkBaseAPI()
        self.test_data = create_test_department_data()
    
    def test_department_data_sync(self):
        """
        Test đồng bộ data với department context sang Lark Base
        """
        # Sync test data
        result = self.lark_api.sync_department_performance(self.test_data)
        
        # Verify sync success
        self.assertEqual(result['code'], 0)
        
        # Verify data accuracy trong Lark Base
        synced_data = self.lark_api.get_department_record('RND')
        self.assertEqual(synced_data['primary_products'], self.test_data['primary_products'])
    
    def test_real_time_notification(self):
        """
        Test real-time notification đến đúng department groups
        """
        alert = create_test_alert(
            primary_dept='RND',
            secondary_depts=['MKT', 'ECOM']
        )
        
        # Send notifications
        notifications_sent = send_department_alert_notification(alert)
        
        # Verify notifications sent to correct groups
        self.assertEqual(len(notifications_sent['primary']), 1)
        self.assertEqual(len(notifications_sent['secondary']), 2)
        self.assertEqual(notifications_sent['primary'][0]['group_id'], 'rnd_group_id')
```

---

## KẾT LUẬN

Tài liệu này đã được cập nhật hoàn toàn để phản ánh mô hình **Primary Owner + Secondary Access** mới với các tính năng chính:

### ✅ **Đã Cập Nhật:**
1. **Database Schema** - Table structures với Primary/Secondary department tracking
2. **API Integration** - Department-aware data sync functions
3. **Notification System** - Smart routing với department responsibility rõ ràng
4. **Dashboard Views** - Role-specific views cho Primary vs Secondary tasks
5. **Automation** - Department workload balancing và cross-department collaboration
6. **Testing Plan** - Comprehensive testing cho department role logic

### 🎯 **Key Benefits:**
- **Trách nhiệm rõ ràng:** Mỗi phòng ban biết chính xác vai trò Primary vs Secondary
- **Thông báo thông minh:** Notifications được route đúng với message context phù hợp  
- **Collaboration hiệu quả:** Cross-department handoff processes được standardize
- **Performance tracking:** Metrics riêng biệt cho Primary và Secondary responsibilities
- **Executive visibility:** Real-time dashboard với department breakdown

### 📊 **Implementation Ready:**
- Code examples sẵn sàng deploy
- Department configuration templates
- Testing scenarios đầy đủ
- Performance monitoring setup

Hệ thống hiện tại hoàn toàn ready để implement với yêu cầu "việc thông báo cần chỉ rõ phòng ban nào cần thực hiện" và model Primary Owner + Secondary Access đã được simplified loại bỏ approval workflows.
```
**Color coding:**
- Red: Overdue
- Orange: Due in 7 days
- Yellow: Due in 30 days
- Green: Future

## 5. LARK BOT INTEGRATION

### 5.1 Bot Notifications

#### 5.1.1 Critical Alert Notifications
```python
def send_critical_alert_to_lark(alert):
    """
    Gửi thông báo Critical alert qua Lark Bot
    """
    message = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": "🔴 Critical Alert - PIM System"
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"**Sản phẩm:** {alert.sku} - {alert.product_name}\n**Vấn đề:** {alert.message}\n**Quá hạn:** {alert.days_overdue} ngày\n**Phụ trách:** {alert.assigned_to}"
                    }
                },
                {
                    "tag": "action",
                    "actions": [
                        {
                            "tag": "button",
                            "text": {
                                "tag": "plain_text",
                                "content": "Xem chi tiết"
                            },
                            "url": f"{PIM_BASE_URL}/alerts/{alert.id}",
                            "type": "primary"
                        },
                        {
                            "tag": "button", 
                            "text": {
                                "tag": "plain_text",
                                "content": "Lark Base Dashboard"
                            },
                            "url": f"https://example.larksuite.com/base/{LARK_BASE_TOKEN}"
                        }
                    ]
                }
            ]
        }
    }
    
    # Gửi đến group chat của department
    department_chat_id = get_department_chat_id(alert.department)
    send_message_to_chat(department_chat_id, message)
```

#### 5.1.2 Weekly Summary
```python
def send_weekly_summary():
    """
    Gửi báo cáo tóm tắt hàng tuần
    """
    summary = generate_weekly_summary()
    
    message = {
        "msg_type": "interactive", 
        "card": {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": f"📊 Báo cáo tuần {summary.week_number}/2025"
                },
                "template": "blue"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"""
**Tổng quan:**
• Compliance trung bình: {summary.avg_compliance}%
• Critical alerts: {summary.critical_count}
• Cải thiện: {summary.improvement}%

**Top Performers:**
🥇 {summary.top_dept_1}: {summary.top_score_1}%
🥈 {summary.top_dept_2}: {summary.top_score_2}%

**Cần chú ý:**
⚠️ {summary.attention_dept}: {summary.attention_issues}
                        """
                    }
                }
            ]
        }
    }
    
    # Gửi đến leadership chat
    send_message_to_chat(LEADERSHIP_CHAT_ID, message)
```

## 6. WEBHOOK & REAL-TIME UPDATES

### 6.1 Webhook từ Lark Base về PIM

```python
@csrf_exempt
def lark_webhook_handler(request):
    """
    Xử lý webhook từ Lark Base khi user update status
    """
    if request.method == 'POST':
        # Verify webhook signature
        if not verify_lark_signature(request):
            return HttpResponse(status=401)
        
        data = json.loads(request.body)
        
        if data.get('type') == 'record.updated':
            # User cập nhật status alert trên Lark Base
            record_id = data['data']['recordId']
            updated_fields = data['data']['updatedFields']
            
            if 'fld_status' in updated_fields:
                new_status = updated_fields['fld_status']
                alert_id = get_alert_id_by_record_id(record_id)
                
                # Update status trong PIM database
                update_alert_status(alert_id, new_status)
                
                # Log activity
                log_user_activity(
                    user=data['operator']['userId'],
                    action='status_update',
                    alert_id=alert_id,
                    new_status=new_status
                )
        
        return HttpResponse(status=200)
```

## 7. MONITORING & ERROR HANDLING

### 7.1 Sync Status Monitoring

```python
class LarkSyncStatus(models.Model):
    """
    Theo dõi trạng thái đồng bộ với Lark Base
    """
    sync_type = models.CharField(max_length=50)  # products, alerts, performance
    last_sync = models.DateTimeField()
    status = models.CharField(max_length=20)  # success, failed, partial
    records_processed = models.IntegerField()
    error_message = models.TextField(null=True, blank=True)
    duration_seconds = models.FloatField()

def monitor_sync_health():
    """
    Kiểm tra sức khỏe của sync process
    """
    failed_syncs = LarkSyncStatus.objects.filter(
        status='failed',
        last_sync__gte=timezone.now() - timedelta(hours=24)
    )
    
    if failed_syncs.count() > 5:
        # Gửi alert cho IT team
        send_system_alert("Lark Base sync failing repeatedly")
```

### 7.2 Rate Limiting & Retry Logic

```python
import time
from functools import wraps

def rate_limit_retry(max_retries=3, delay=1.0):
    """
    Decorator để handle rate limiting và retry
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError as e:
                    if attempt == max_retries - 1:
                        raise e
                    time.sleep(delay * (2 ** attempt))  # Exponential backoff
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise e
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

@rate_limit_retry(max_retries=3, delay=2.0)
def call_lark_api(endpoint, data):
    """
    Gọi Lark API với retry logic
    """
    response = requests.post(endpoint, json=data, headers=get_auth_headers())
    
    if response.status_code == 429:  # Rate limited
        raise RateLimitError("Rate limit exceeded")
    elif response.status_code >= 400:
        raise APIError(f"API error: {response.status_code}")
    
    return response.json()
```

## 8. BENEFITS & ROI

### 8.1 Lợi ích trực tiếp
✅ **Real-time visibility** - Leadership nhìn thấy tình trạng compliance ngay lập tức
✅ **Mobile access** - Truy cập báo cáo mọi lúc mọi nơi qua Lark mobile
✅ **Collaboration** - Team có thể comment, assign task trực tiếp trên Lark Base
✅ **No training needed** - Sử dụng Lark có sẵn, không cần học tool mới
✅ **Automated reporting** - Giảm 80% thời gian tạo báo cáo thủ công

### 8.2 Metrics để đánh giá
- **Response time**: Thời gian từ khi có alert đến khi được xử lý
- **Compliance improvement**: % cải thiện tuân thủ sau khi có dashboard
- **Executive engagement**: Số lần truy cập dashboard của leadership
- **Cross-department collaboration**: Số lượng comments/interactions trên Lark Base

## 9. IMPLEMENTATION TIMELINE

**Week 1-2:** 
- Setup Lark App, tạo Base và Tables
- Implement basic API integration

**Week 3-4:**
- Develop sync functions và scheduled jobs
- Create dashboard views

**Week 5-6:**
- Implement Bot notifications
- Setup webhook handlers

**Week 7-8:**
- Testing, monitoring, performance optimization
- User training và rollout

## 10. SECURITY CONSIDERATIONS

### 10.1 Data Privacy
- Chỉ đồng bộ dữ liệu summary, không đồng bộ nội dung nhạy cảm của tài liệu
- Implement field-level permissions trên Lark Base
- Regular audit của data access logs

### 10.2 API Security  
- Use OAuth 2.0 với refresh token
- Encrypt sensitive data in transit
- Rate limiting và IP whitelist
- Webhook signature verification

---

*Tài liệu này cung cấp blueprint đầy đủ để implement tích hợp Lark Base cho hệ thống PIM, đảm bảo tính khả thi và bảo mật.*