import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  DatePicker, 
  Select, 
  Input, 
  Button, 
  Row, 
  Col, 
  Statistic,
  Typography,
  Divider,
  Badge,
  Tooltip,
  Modal,
  Descriptions,
  Alert,
  Layout,
  Menu,
  Avatar,
  notification,
  Pagination,
  Checkbox
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  EyeOutlined,
  WarningOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined, 
  DashboardOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  LogoutOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { message } from 'antd';
import "@/css/dashboard.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Content, Sider } = Layout;

const LogsPage = () => {
  const { state: authState, dispatch } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    anomaly_type: '',
    ip_address: '',
    date_range: null,
    status: '',
    username: '',
    todayOnly: false,
  });
  const [stats, setStats] = useState({
    total_logs: 0,
    blocked_attempts: 0,
    suspicious_attempts: 0,
    today_logs: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Thêm state cho sort order
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = mới nhất, 'asc' = cũ nhất


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async (page = 1, order = sortOrder) => {
    setLoading(true);
    try {
      // Xây dựng query parameters từ filters
      const params = new URLSearchParams();
      if (filters.anomaly_type) params.append('anomaly_type', filters.anomaly_type);
      if (filters.ip_address) params.append('ip', filters.ip_address);
      if (filters.username) params.append('username', filters.username);
      if (filters.date_range && filters.date_range.length === 2) {
        params.append('date_from', filters.date_range[0].format('YYYY-MM-DD'));
        params.append('date_to', filters.date_range[1].format('YYYY-MM-DD'));
      }
      
      // Thêm page parameter
      params.append('page', page);
      params.append('page_size', pagination.pageSize);
      // Sắp xếp theo timestamp
      if (order === 'asc') {
        params.append('ordering', 'timestamp');
      } else {
        params.append('ordering', '-timestamp');
      }
      
      const response = await api.get(`/logs/?${params.toString()}`);
      
      // Cập nhật logs và stats từ response mới
      setLogs(response.data.logs || []);
      setStats(response.data.stats || {
        total_logs: 0,
        blocked_attempts: 0,
        suspicious_attempts: 0,
        today_logs: 0
      });
      
      // Cập nhật pagination
      if (response.data.pagination) {
        setPagination({
          current: page,
          pageSize: 20,
          total: response.data.pagination.count
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải dữ liệu logs từ máy chủ',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []); // Chỉ chạy 1 lần khi component mount

  const getAnomalyTypeColor = (type) => {
    switch (type) {
      case 'blocked':
        return 'red';
      case 'suspicious':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getAnomalyTypeText = (type) => {
    switch (type) {
      case 'blocked':
        return 'Bị chặn';
      case 'suspicious':
        return 'Đáng ngờ';
      default:
        return type;
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'blocked':
        return <StopOutlined />;
      case 'suspicious':
        return <WarningOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Chỉ còn 1 cột duy nhất, không tiêu đề
  const columns = [
    {
      dataIndex: 'logline',
      key: 'logline',
      render: (_, record) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>
         [{formatDateTime(record.timestamp)}] | IP: [{record.ip_address}] | username: [{record.username || '-'}] | action: [{record.anomaly_type}] | Description: [{record.description || 'Không có'}]
        </span>
      ),
    },
  ];

  const showLogDetail = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    // Áp dụng filter bằng cách gọi lại API từ trang 1
    fetchLogs(1, sortOrder);
  };

  const handleRefresh = () => {
    fetchLogs(pagination.current, sortOrder);
  };

  const handleReset = () => {
    setFilters({
      anomaly_type: '',
      ip_address: '',
      date_range: null,
      status: '',
      username: '',
      todayOnly: false,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(() => fetchLogs(1, sortOrder), 100);
  };


  const handlePageChange = (page) => {
    fetchLogs(page, sortOrder);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    fetchLogs(1, value);
  };

  const handleTodayOnlyChange = (checked) => {
    if (checked) {
      const today = dayjs();
      setFilters((prev) => ({
        ...prev,
        todayOnly: true,
        date_range: [today, today],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        todayOnly: false,
        date_range: null,
      }));
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    message.success('Đã đăng xuất!');
    navigate('/login');
  };

  return (
    <>
      <Layout className="dashboard-bg" style={{ minHeight: '100vh' }}>
        <Sider width={240} className="dashboard-sider" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          {/* Đồng hồ ở đầu sidebar */}
          <div style={{ color: '#222', textAlign: 'center', padding: '16px 0 16px 0', borderBottom: '1px solid #fff' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{currentTime.toLocaleTimeString('vi-VN')}</div>
            <div style={{ fontSize: '13px' }}>{currentTime.toLocaleDateString('vi-VN')}</div>
          </div>
          <div className="sidebar-user-info">
            <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <div className="sidebar-user-name">{authState.user?.username || 'Admin'}</div>
            <div className="sidebar-user-role">Quản trị viên</div>
            {authState.ipAddress && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                IP: {authState.ipAddress}
              </div>
            )}
          </div>
          <Menu theme="light" mode="inline" defaultSelectedKeys={['logs']}>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
            <Menu.Item key="users" icon={<TeamOutlined />} onClick={() => navigate('/users')}>Users</Menu.Item>
            <Menu.Item key="logs" icon={<FileTextOutlined />} onClick={() => navigate('/logs')}>Logs</Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>Settings</Menu.Item>
          </Menu>
          <div style={{ padding: '16px', borderTop: '1px solid #444', marginTop: 'auto' }}>
              <Button type="primary" danger block icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </Sider>
        <Content style={{ padding: '24px' }}>
            {/* Thống kê - 4 card */}
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  hoverable
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#fff' }}>Tổng số logs</span>}
                    value={stats.total_logs}
                    valueStyle={{ color: '#fff', fontSize: '32px' }}
                    prefix={<FileTextOutlined style={{ color: '#fff' }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  hoverable
                  style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#fff' }}>Lần bị chặn</span>}
                    value={stats.blocked_attempts}
                    valueStyle={{ color: '#fff', fontSize: '32px' }}
                    prefix={<StopOutlined style={{ color: '#fff' }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  hoverable
                  style={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#fff' }}>Lần đáng ngờ</span>}
                    value={stats.suspicious_attempts}
                    valueStyle={{ color: '#fff', fontSize: '32px' }}
                    prefix={<WarningOutlined style={{ color: '#fff' }} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  hoverable
                  style={{ 
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    border: 'none'
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#1a1a1a' }}>Logs hôm nay</span>}
                    value={stats.today_logs}
                    valueStyle={{ color: '#1a1a1a', fontSize: '32px' }}
                    prefix={<ClockCircleOutlined style={{ color: '#1a1a1a' }} />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Layout chia 8/12 và 4/12 */}
            <Row gutter={[16, 16]}>
              {/* Danh sách logs 9/12 */}
              <Col xs={24} lg={18}>
                <Card 
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: true }}
                    rowClassName={() => 'log-row-tight'}
                    showHeader={false}
                    style={{ fontSize: 12 }}
                  />
                </Card>
              </Col>
              {/* Bộ lọc tìm kiếm 3/12 */}
              <Col xs={24} lg={6}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <Button 
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                    block
                    style={{ marginBottom: 12, fontWeight: 600, fontSize: 15 }}
                  >
                    Làm mới logs
                  </Button>
                  <Select
                    value={sortOrder}
                    onChange={handleSortChange}
                    style={{ width: '100%', marginBottom: 12 }}
                  >
                    <Option value="desc">Mới nhất</Option>
                    <Option value="asc">Cũ nhất</Option>
                  </Select>
                  <Row gutter={[8, 8]} align="middle">
                    <Col span={24}>
                      <Select
                        placeholder="Loại"
                        value={filters.anomaly_type}
                        onChange={(value) => handleFilterChange('anomaly_type', value)}
                        style={{ width: '100%' }}
                        allowClear
                      >
                        <Option value="blocked">Blocked</Option>
                        <Option value="suspicious">Suspicious</Option>
                        <Option value="normal">Normal</Option>
                        <Option value="new_ip">New Ip Detected</Option>
                      </Select>
                    </Col>
                    <Col span={24}>
                      <Input
                        placeholder="IP Address"
                        value={filters.ip_address}
                        onChange={(e) => handleFilterChange('ip_address', e.target.value)}
                        prefix={<SearchOutlined />}
                      />
                    </Col>
                    <Col span={24}>
                      <Input
                        placeholder="Username"
                        value={filters.username}
                        onChange={(e) => handleFilterChange('username', e.target.value)}
                        prefix={<UserOutlined />}
                      />
                    </Col>
                    <Col span={24} style={{ marginBottom: 4 }}>
                      <Checkbox
                        checked={filters.todayOnly}
                        onChange={e => handleTodayOnlyChange(e.target.checked)}
                        style={{ width: '100%', margin: 0, fontWeight: 500 }}
                      >
                        Chỉ xem logs hôm nay
                      </Checkbox>
                    </Col>
                    <Col span={24}>
                      <RangePicker
                        placeholder={['Từ ngày', 'Đến ngày']}
                        value={filters.date_range}
                        onChange={(dates) => handleFilterChange('date_range', dates)}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={24} style={{ textAlign: 'right' }}>
                      <Button 
                        type="primary" 
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                        block
                        style={{ marginBottom: 8, fontWeight: 600, fontSize: 15 }}
                      >
                        Tìm kiếm
                      </Button>
                      <Button 
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                        block
                        style={{ fontWeight: 600, fontSize: 15 }}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                      {pagination.total > 0 ? 
                        `${(pagination.current - 1) * pagination.pageSize + 1}-${Math.min(pagination.current * pagination.pageSize, pagination.total)} của ${pagination.total} logs` : 
                        'Không có logs'
                      }
                    </div>
                    <Pagination
                      current={pagination.current}
                      total={pagination.total}
                      pageSize={pagination.pageSize}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper={false}
                      size="small"
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Modal chi tiết log */}
            <Modal
              title="Chi tiết Log"
              open={detailModalVisible}
              onCancel={() => setDetailModalVisible(false)}
              footer={[
                <Button key="close" onClick={() => setDetailModalVisible(false)}>
                  Đóng
                </Button>
              ]}
              width={600}
            >
              {selectedLog && (
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Thời gian">
                    {formatDateTime(selectedLog.timestamp)}
                  </Descriptions.Item>
                  <Descriptions.Item label="IP Address">
                    <Tag color="blue">{selectedLog.ip_address}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại">
                    <Tag 
                      color={getAnomalyTypeColor(selectedLog.anomaly_type)}
                      icon={getAnomalyIcon(selectedLog.anomaly_type)}
                    >
                      {getAnomalyTypeText(selectedLog.anomaly_type)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Username">
                    {selectedLog.username ? (
                      <Tag color="green">{selectedLog.username}</Tag>
                    ) : (
                      <Text type="secondary">Không có</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả">
                    {selectedLog.description}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Modal>
          </Content>
        </Layout>
        <style>{`
          .log-row-tight > td {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
            line-height: 1.2 !important;
          }
        `}</style>
      </>
    );
  };

export default LogsPage; 