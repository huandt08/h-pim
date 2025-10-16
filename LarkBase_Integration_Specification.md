# TÍCH HỢP LARK BASE CHO HỆ THỐNG PIM

## 1. TỔNG QUAN TÍCH HỢP

### 1.1 Mục đích
- **Báo cáo thời gian thực**: Đẩy dữ liệu từ PIM sang Lark Base để tạo dashboard trực quan
- **Collaboration**: Cho phép các stakeholder theo dõi và tương tác với dữ liệu
- **Executive Visibility**: Cung cấp báo cáo cấp cao cho ban lãnh đạo
- **Mobile Access**: Truy cập báo cáo mọi lúc mọi nơi qua Lark mobile app

### 1.2 Kiến trúc tổng thể
```
┌─────────────┐    API Call    ┌─────────────┐    Webhook    ┌─────────────┐
│ PIM System  │ ──────────────→ │ Lark Base   │ ──────────────→ │ Lark Bot    │
│             │                │ Tables      │                │ Notifications│
└─────────────┘                └─────────────┘                └─────────────┘
       │                              │                              │
       │        Scheduled Sync        │         Real-time           │
       ▼                              ▼         Updates             ▼
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│ Background  │                │ Dashboard   │                │ Team Chat   │
│ Jobs        │                │ Views       │                │ Groups      │
└─────────────┘                └─────────────┘                └─────────────┘
```

## 2. CẤU TRÚC LARK BASE

### 2.1 Danh sách các Base và Table

#### Base: "PIM Compliance Dashboard"

**Table 1: Products Overview** (`tbl_products_overview`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| sku | Single Line Text | Mã SKU sản phẩm | `fld_sku` |
| product_name | Single Line Text | Tên sản phẩm | `fld_product_name` |
| department | Single Select | Phòng ban chủ quản | `fld_department` |
| status | Single Select | Active/Inactive/Development | `fld_status` |
| total_documents | Number | Tổng số tài liệu | `fld_total_docs` |
| required_documents | Number | Tài liệu bắt buộc | `fld_required_docs` |
| completed_documents | Number | Tài liệu đã hoàn thành | `fld_completed_docs` |
| compliance_percentage | Number | % Tuân thủ | `fld_compliance_pct` |
| critical_alerts | Number | Số cảnh báo Critical | `fld_critical_alerts` |
| warning_alerts | Number | Số cảnh báo Warning | `fld_warning_alerts` |
| last_updated | Date | Ngày cập nhật cuối | `fld_last_updated` |
| next_review_date | Date | Ngày review tiếp theo | `fld_next_review` |

**Table 2: Alert Monitor** (`tbl_alert_monitor`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| alert_id | Single Line Text | ID cảnh báo | `fld_alert_id` |
| created_date | Date | Ngày tạo cảnh báo | `fld_created_date` |
| priority | Single Select | Critical/Warning/Info | `fld_priority` |
| sku | Link to Records | Liên kết đến Products | `fld_sku_link` |
| department | Single Select | Phòng ban | `fld_department` |
| document_type | Single Line Text | Loại tài liệu | `fld_doc_type` |
| alert_message | Long Text | Nội dung cảnh báo | `fld_alert_message` |
| due_date | Date | Ngày đến hạn | `fld_due_date` |
| days_overdue | Number | Số ngày quá hạn | `fld_days_overdue` |
| assigned_to | Single Line Text | Người phụ trách | `fld_assigned_to` |
| status | Single Select | New/In Progress/Resolved | `fld_status` |
| resolution_notes | Long Text | Ghi chú xử lý | `fld_resolution` |

**Table 3: Department Performance** (`tbl_dept_performance`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| report_date | Date | Ngày báo cáo | `fld_report_date` |
| department | Single Select | Phòng ban | `fld_department` |
| total_products | Number | Tổng sản phẩm | `fld_total_products` |
| compliant_products | Number | Sản phẩm tuân thủ | `fld_compliant_products` |
| compliance_score | Number | Điểm tuân thủ (0-100) | `fld_compliance_score` |
| critical_count | Number | Số cảnh báo Critical | `fld_critical_count` |
| warning_count | Number | Số cảnh báo Warning | `fld_warning_count` |
| avg_response_time | Number | TG phản hồi TB (giờ) | `fld_avg_response` |
| trend_direction | Single Select | Up/Stable/Down | `fld_trend` |
| improvement_actions | Long Text | Hành động cải thiện | `fld_actions` |

**Table 4: Document Expiry Calendar** (`tbl_doc_expiry`)
| Field Name | Type | Description | API Field |
|------------|------|-------------|-----------|
| sku | Link to Records | Liên kết đến Products | `fld_sku_link` |
| document_name | Single Line Text | Tên tài liệu | `fld_doc_name` |
| document_type | Single Select | Loại tài liệu | `fld_doc_type` |
| current_expiry_date | Date | Ngày hết hạn hiện tại | `fld_current_expiry` |
| renewal_due_date | Date | Ngày cần gia hạn | `fld_renewal_due` |
| days_to_expiry | Formula | Số ngày còn lại | `fld_days_to_expiry` |
| renewal_status | Single Select | Not Started/In Progress/Completed | `fld_renewal_status` |
| responsible_person | Single Line Text | Người phụ trách | `fld_responsible` |
| department | Single Select | Phòng ban | `fld_department` |
| renewal_cost | Number | Chi phí gia hạn | `fld_renewal_cost` |
| vendor_contact | Single Line Text | Liên hệ nhà cung cấp | `fld_vendor_contact` |

## 3. API INTEGRATION

### 3.1 Authentication Setup

```python
# Lark App Configuration
LARK_CONFIG = {
    "app_id": "cli_a1b2c3d4e5f6g7h8",
    "app_secret": "your_app_secret_here",
    "base_token": "bascnAbCdEfGhIjKlMnOpQrStUvWxYz",
    "webhook_secret": "your_webhook_secret"
}

# API Endpoints
LARK_BASE_API = "https://open.larksuite.com/open-apis/bitable/v1"
LARK_BOT_API = "https://open.larksuite.com/open-apis/im/v1"
```

### 3.2 Data Sync Functions

#### 3.2.1 Products Sync
```python
def sync_products_to_lark():
    """
    Đồng bộ thông tin sản phẩm từ PIM sang Lark Base
    """
    # Lấy dữ liệu từ PIM database
    products = get_products_compliance_data()
    
    # Format data cho Lark Base
    lark_records = []
    for product in products:
        record = {
            "fields": {
                "fld_sku": product.sku,
                "fld_product_name": product.name,
                "fld_department": map_department(product.department),
                "fld_status": product.status,
                "fld_total_docs": product.total_documents,
                "fld_required_docs": product.required_documents,
                "fld_completed_docs": product.completed_documents,
                "fld_compliance_pct": round(product.compliance_percentage, 2),
                "fld_critical_alerts": product.critical_alerts_count,
                "fld_warning_alerts": product.warning_alerts_count,
                "fld_last_updated": product.updated_at.isoformat(),
                "fld_next_review": calculate_next_review_date(product)
            }
        }
        lark_records.append(record)
    
    # Batch update to Lark Base
    return batch_update_lark_table("tbl_products_overview", lark_records)
```

#### 3.2.2 Alert Sync
```python
def sync_alerts_to_lark():
    """
    Đồng bộ cảnh báo real-time từ PIM sang Lark Base
    """
    # Lấy alerts mới trong 24h qua
    alerts = get_recent_alerts(hours=24)
    
    lark_records = []
    for alert in alerts:
        record = {
            "fields": {
                "fld_alert_id": alert.id,
                "fld_created_date": alert.created_at.date().isoformat(),
                "fld_priority": map_priority(alert.priority),
                "fld_sku_link": [get_product_record_id(alert.sku)],
                "fld_department": alert.department,
                "fld_doc_type": alert.document_type,
                "fld_alert_message": alert.message,
                "fld_due_date": alert.due_date.isoformat() if alert.due_date else None,
                "fld_days_overdue": alert.days_overdue,
                "fld_assigned_to": alert.assigned_to,
                "fld_status": "New"
            }
        }
        lark_records.append(record)
    
    return batch_create_lark_records("tbl_alert_monitor", lark_records)
```

### 3.3 Scheduled Jobs

#### 3.3.1 Cron Job Configuration
```python
# settings.py - Django Celery Beat Schedule
CELERY_BEAT_SCHEDULE = {
    # Sync products mỗi 2 giờ
    'sync-products-to-lark': {
        'task': 'pim.tasks.sync_products_to_lark',
        'schedule': crontab(minute=0, hour='*/2'),
    },
    
    # Sync alerts real-time mỗi 15 phút
    'sync-alerts-to-lark': {
        'task': 'pim.tasks.sync_alerts_to_lark', 
        'schedule': crontab(minute='*/15'),
    },
    
    # Department performance báo cáo hàng ngày
    'daily-dept-performance': {
        'task': 'pim.tasks.sync_dept_performance',
        'schedule': crontab(hour=1, minute=0),  # 1:00 AM daily
    },
    
    # Document expiry calendar hàng tuần
    'weekly-expiry-sync': {
        'task': 'pim.tasks.sync_document_expiry',
        'schedule': crontab(hour=2, minute=0, day_of_week=0),  # Sunday 2:00 AM
    }
}
```

## 4. DASHBOARD VIEWS TRÊN LARK BASE

### 4.1 Executive Dashboard View

#### View: "Management Overview"
**Filters:**
- Department: All/Specific Department
- Time Range: Last 7 days / Last 30 days / Custom

**Columns hiển thị:**
- Department
- Total Products
- Compliance Score (với color coding)
- Critical Alerts
- Trend (↗️↘️→)
- Action Required

**Conditional Formatting:**
```
Compliance Score:
- 90-100%: Green background
- 70-89%: Yellow background  
- <70%: Red background

Critical Alerts:
- 0: Green
- 1-3: Yellow
- >3: Red
```

#### View: "Critical Issues"
**Filters:**
- Priority: Critical only
- Status: New/In Progress
- Department: All

**Sort:** Days Overdue (Descending)

### 4.2 Department Manager Dashboard

#### View: "My Department Performance"
**Filter by Department** (user-specific)
**Columns:**
- Product SKU
- Product Name
- Compliance %
- Missing Documents
- Days Overdue
- Assigned To

### 4.3 Operational Views

#### View: "Document Expiry Calendar"
**Calendar View** based on `renewal_due_date`
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