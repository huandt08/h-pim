import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  message,
  DatePicker,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { Alert, AlertFormData, ALERT_PRIORITIES, ALERT_STATUSES } from '../../types';
import AlertService from '../../services/AlertService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AlertForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      fetchAlert();
    }
  }, [id, isEditing]);

  const fetchAlert = async () => {
    try {
      setLoading(true);
      const response = await AlertService.getAlertById(id!);
      if (response.success && response.data) {
        const alertData = response.data;
        setAlert(alertData);
        
        // Set form values
        form.setFieldsValue({
          title: alertData.title,
          message: alertData.message,
          type: alertData.type,
          priority: alertData.priority,
          status: alertData.status,
          primary_responsible_department: alertData.primary_responsible_department,
          secondary_involved_departments: alertData.secondary_involved_departments,
          product_id: alertData.product_id,
          document_id: alertData.document_id,
          batch_id: alertData.batch_id,
          due_date: alertData.due_date ? dayjs(alertData.due_date) : null
        });
      } else {
        message.error('Không thể tải thông tin cảnh báo');
        navigate('/alerts');
      }
    } catch (error) {
      console.error('Error fetching alert:', error);
      message.error('Không thể tải thông tin cảnh báo');
      navigate('/alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      const formData: AlertFormData = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD HH:mm:ss') : null
      };

      let response;
      if (isEditing) {
        response = await AlertService.updateAlert(id!, formData);
      } else {
        response = await AlertService.createAlert(formData);
      }

      if (response.success) {
        message.success(isEditing ? 'Cảnh báo đã được cập nhật' : 'Cảnh báo đã được tạo');
        navigate('/alerts');
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting alert:', error);
      message.error('Có lỗi xảy ra khi lưu cảnh báo');
    } finally {
      setSubmitting(false);
    }
  };

  const alertTypes = [
    { value: 'missing_document', label: 'Thiếu tài liệu' },
    { value: 'document_expiry', label: 'Tài liệu hết hạn' },
    { value: 'low_compliance', label: 'Tuân thủ thấp' },
    { value: 'batch_expiry', label: 'Lô hết hạn' },
    { value: 'system_alert', label: 'Cảnh báo hệ thống' },
    { value: 'manual', label: 'Thủ công' },
    { value: 'compliance_deadline', label: 'Hạn tuân thủ' },
    { value: 'document_expired', label: 'Tài liệu đã hết hạn' },
    { value: 'approval_required', label: 'Cần phê duyệt' },
    { value: 'system_notification', label: 'Thông báo hệ thống' },
    { value: 'quality_issue', label: 'Vấn đề chất lượng' }
  ];

  const departments = [
    'Nghiên Cứu & Phát Triển',
    'Sản Xuất',
    'Quản Lý Chất Lượng',
    'Kinh Doanh & Marketing',
    'Kỹ Thuật',
    'Quản Lý Dự Án',
    'Nhà Máy Sản Xuất',
    'Phòng Thí Nghiệm',
    'Bảo Đảm Chất Lượng',
    'Pháp Chế'
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/alerts')}
          >
            Quay lại
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEditing ? 'Chỉnh sửa cảnh báo' : 'Tạo cảnh báo mới'}
          </Title>
        </Space>
      </div>

      {/* Form Card */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'medium',
            status: 'open',
            type: 'manual'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="title"
              label="Tiêu đề cảnh báo"
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu đề cảnh báo' }
              ]}
            >
              <Input placeholder="Nhập tiêu đề cảnh báo" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Loại cảnh báo"
              rules={[
                { required: true, message: 'Vui lòng chọn loại cảnh báo' }
              ]}
            >
              <Select placeholder="Chọn loại cảnh báo">
                {alertTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              rules={[
                { required: true, message: 'Vui lòng chọn mức độ ưu tiên' }
              ]}
            >
              <Select placeholder="Chọn mức độ ưu tiên">
                {ALERT_PRIORITIES.map(priority => (
                  <Option key={priority.value} value={priority.value}>
                    {priority.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[
                { required: true, message: 'Vui lòng chọn trạng thái' }
              ]}
            >
              <Select placeholder="Chọn trạng thái">
                {ALERT_STATUSES.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="primary_responsible_department"
              label="Phòng ban chịu trách nhiệm chính"
              rules={[
                { required: true, message: 'Vui lòng chọn phòng ban chịu trách nhiệm chính' }
              ]}
            >
              <Select placeholder="Chọn phòng ban">
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="secondary_involved_departments"
              label="Phòng ban liên quan"
            >
              <Select
                mode="multiple"
                placeholder="Chọn phòng ban liên quan"
                allowClear
              >
                {departments.map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="due_date"
              label="Hạn xử lý"
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn hạn xử lý"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <div></div> {/* Empty div for grid layout */}

            <Form.Item
              name="product_id"
              label="ID Sản phẩm liên quan"
            >
              <Input placeholder="Nhập ID sản phẩm (nếu có)" />
            </Form.Item>

            <Form.Item
              name="document_id"
              label="ID Tài liệu liên quan"
            >
              <Input placeholder="Nhập ID tài liệu (nếu có)" />
            </Form.Item>

            <Form.Item
              name="batch_id"
              label="ID Lô sản xuất liên quan"
            >
              <Input placeholder="Nhập ID lô sản xuất (nếu có)" />
            </Form.Item>
          </div>

          <Form.Item
            name="message"
            label="Mô tả chi tiết"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả chi tiết' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về cảnh báo..."
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate('/alerts')}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
              >
                {isEditing ? 'Cập nhật' : 'Tạo cảnh báo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AlertForm;