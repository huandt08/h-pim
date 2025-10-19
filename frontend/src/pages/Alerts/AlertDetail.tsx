import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Timeline,
  Spin,
  message,
  Divider,
  Badge
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Alert, ALERT_PRIORITIES, ALERT_STATUSES } from '../../types';
import AlertService from '../../services/AlertService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [escalateModalVisible, setEscalateModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchAlertDetail();
    }
  }, [id]);

  const fetchAlertDetail = async () => {
    try {
      setLoading(true);
      const response = await AlertService.getAlertById(id!);
      if (response.success && response.data) {
        setAlert(response.data);
      } else {
        message.error('Không thể tải chi tiết cảnh báo');
        navigate('/alerts');
      }
    } catch (error) {
      console.error('Error fetching alert detail:', error);
      message.error('Không thể tải chi tiết cảnh báo');
      navigate('/alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (values: { resolution_notes: string }) => {
    if (!alert) return;

    try {
      setActionLoading(true);
      const response = await AlertService.resolveAlert(alert.id, values.resolution_notes);
      if (response.success) {
        message.success('Cảnh báo đã được giải quyết');
        setResolveModalVisible(false);
        form.resetFields();
        fetchAlertDetail(); // Refresh data
      } else {
        message.error(response.message || 'Không thể giải quyết cảnh báo');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      message.error('Có lỗi xảy ra khi giải quyết cảnh báo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (values: { escalation_notes: string }) => {
    if (!alert) return;

    try {
      setActionLoading(true);
      const response = await AlertService.escalateAlert(alert.id, values.escalation_notes);
      if (response.success) {
        message.success('Cảnh báo đã được leo thang');
        setEscalateModalVisible(false);
        form.resetFields();
        fetchAlertDetail(); // Refresh data
      } else {
        message.error(response.message || 'Không thể leo thang cảnh báo');
      }
    } catch (error) {
      console.error('Error escalating alert:', error);
      message.error('Có lỗi xảy ra khi leo thang cảnh báo');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = ALERT_PRIORITIES.find(p => p.value === priority);
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'red';
      case 'in_progress': return 'orange';
      case 'resolved': return 'green';
      case 'closed': return 'default';
      case 'escalated': return 'purple';
      default: return 'default';
    }
  };

  const canResolve = alert && ['open', 'in_progress', 'escalated'].includes(alert.status);
  const canEscalate = alert && ['open', 'in_progress'].includes(alert.status);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Không tìm thấy cảnh báo</Text>
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
            Chi tiết cảnh báo #{alert.id}
          </Title>
        </Space>
      </div>

      {/* Alert Info Card */}
      <Card
        title="Thông tin cảnh báo"
        extra={
          <Space>
            {canEscalate && (
              <Button
                type="default"
                icon={<ExclamationCircleOutlined />}
                onClick={() => setEscalateModalVisible(true)}
              >
                Leo thang
              </Button>
            )}
            {canResolve && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setResolveModalVisible(true)}
              >
                Giải quyết
              </Button>
            )}
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => navigate(`/alerts/edit/${alert.id}`)}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tiêu đề" span={2}>
            <Text strong>{alert.title}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {alert.message}
          </Descriptions.Item>
          <Descriptions.Item label="Loại cảnh báo">
            <Tag>{alert.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mức độ ưu tiên">
            <Tag color={getPriorityColor(alert.priority)}>
              {ALERT_PRIORITIES.find(p => p.value === alert.priority)?.label || alert.priority}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(alert.status)}>
              {ALERT_STATUSES.find(s => s.value === alert.status)?.label || alert.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phòng ban chịu trách nhiệm chính">
            {alert.primary_responsible_department}
          </Descriptions.Item>
          {alert.secondary_involved_departments && alert.secondary_involved_departments.length > 0 && (
            <Descriptions.Item label="Phòng ban liên quan" span={2}>
              <Space wrap>
                {alert.secondary_involved_departments.map((dept, index) => (
                  <Tag key={index}>{dept}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày tạo">
            {dayjs(alert.created_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {dayjs(alert.updated_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          {alert.due_date && (
            <Descriptions.Item label="Hạn xử lý">
              <Text type={dayjs(alert.due_date).isBefore(dayjs()) ? 'danger' : undefined}>
                {dayjs(alert.due_date).format('DD/MM/YYYY HH:mm')}
                {dayjs(alert.due_date).isBefore(dayjs()) && ' (Quá hạn)'}
              </Text>
            </Descriptions.Item>
          )}
          {alert.resolved_at && (
            <>
              <Descriptions.Item label="Ngày giải quyết">
                {dayjs(alert.resolved_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Người giải quyết">
                {alert.resolved_by}
              </Descriptions.Item>
              {alert.resolution_notes && (
                <Descriptions.Item label="Ghi chú giải quyết" span={2}>
                  {alert.resolution_notes}
                </Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>
      </Card>

      {/* Related Information */}
      {(alert.product_id || alert.document_id || alert.batch_id) && (
        <Card title="Thông tin liên quan" style={{ marginBottom: '24px' }}>
          <Descriptions bordered>
            {alert.product_id && (
              <Descriptions.Item label="Sản phẩm">
                <Button 
                  type="link" 
                  onClick={() => navigate(`/products/${alert.product_id}`)}
                >
                  Xem sản phẩm #{alert.product_id}
                </Button>
              </Descriptions.Item>
            )}
            {alert.document_id && (
              <Descriptions.Item label="Tài liệu">
                <Button 
                  type="link"
                  onClick={() => navigate(`/documents/${alert.document_id}`)}
                >
                  Xem tài liệu #{alert.document_id}
                </Button>
              </Descriptions.Item>
            )}
            {alert.batch_id && (
              <Descriptions.Item label="Lô sản xuất">
                <Button 
                  type="link"
                  onClick={() => navigate(`/batches/${alert.batch_id}`)}
                >
                  Xem lô #{alert.batch_id}
                </Button>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card title="Lịch sử hoạt động">
        <Timeline
          items={[
            {
              color: 'blue',
              children: (
                <div>
                  <Text strong>Cảnh báo được tạo</Text>
                  <br />
                  <Text type="secondary">
                    {dayjs(alert.created_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
              )
            },
            ...(alert.resolved_at ? [{
              color: 'green',
              children: (
                <div>
                  <Text strong>Cảnh báo được giải quyết</Text>
                  <br />
                  <Text type="secondary">
                    {dayjs(alert.resolved_at).format('DD/MM/YYYY HH:mm')} bởi {alert.resolved_by}
                  </Text>
                  {alert.resolution_notes && (
                    <>
                      <br />
                      <Text>{alert.resolution_notes}</Text>
                    </>
                  )}
                </div>
              )
            }] : [])
          ]}
        />
      </Card>

      {/* Resolve Modal */}
      <Modal
        title="Giải quyết cảnh báo"
        open={resolveModalVisible}
        onCancel={() => {
          setResolveModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResolve}
        >
          <Form.Item
            name="resolution_notes"
            label="Ghi chú giải quyết"
            rules={[
              { required: true, message: 'Vui lòng nhập ghi chú giải quyết' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả cách giải quyết cảnh báo..."
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setResolveModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={actionLoading}
                icon={<CheckOutlined />}
              >
                Giải quyết
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Escalate Modal */}
      <Modal
        title="Leo thang cảnh báo"
        open={escalateModalVisible}
        onCancel={() => {
          setEscalateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEscalate}
        >
          <Form.Item
            name="escalation_notes"
            label="Lý do leo thang"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do leo thang' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả lý do cần leo thang cảnh báo..."
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEscalateModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={actionLoading}
                icon={<ExclamationCircleOutlined />}
                danger
              >
                Leo thang
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertDetail;