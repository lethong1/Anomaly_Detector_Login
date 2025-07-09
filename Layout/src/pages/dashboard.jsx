import { useEffect, useState, useRef } from "react";
import { Statistic, Table, Tag, Layout, message, Spin, Alert, Card, Row, Col, Button, Avatar, Menu, notification } from "antd";
import { UserOutlined, DashboardOutlined, TeamOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined, ClockCircleOutlined, ExclamationCircleOutlined, StopOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios'; // Đảm bảo đã import api
import "@/css/dashboard.css";

const { Content, Sider } = Layout;


// Cấu hình cột cho bảng "Hoạt động đáng ngờ"
const suspiciousColumns = [
  { title: "Username", dataIndex: "username", key: "username", render: text => <b>{text}</b> },
  {
    title: "Loại bất thường", dataIndex: "anomaly_flag", key: "anomaly_flag",
    render: flag => {
      let color = 'gold';
      if (flag === 'blocked') color = 'volcano';
      if (flag === 'checkpoint') color = 'red';
      if (flag === 'new_ip') color = 'geekblue';
      return <Tag color={color}>{flag.toUpperCase()}</Tag>;
    }
  },
  { title: "Thời gian", dataIndex: "timestamp", key: "timestamp", render: text => new Date(text).toLocaleString('vi-VN') }
];

// Cấu hình cột cho bảng "IP bị chặn"
const blockedIpColumns = [
  { title: "Địa chỉ IP", dataIndex: "ip_address", key: "ip_address" },
  { title: "Lý do chặn", dataIndex: "blocked_reason", key: "blocked_reason" }
];


export default function Dashboard() {
  const { state: authState, dispatch } = useAuth();
  const navigate = useNavigate();
  // State để lưu dữ liệu từ API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [todayStats, setTodayStats] = useState({ today_success: 0, today_failed: 0, today_blocked: 0 });
  const [enableChartAnimation, setEnableChartAnimation] = useState(true);
  const lastAnomalyRef = useRef(null);

  // Sử dụng useEffect để gọi API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard-api/');
        setData(response.data);

        // Kiểm tra log bất thường mới nhất
        const suspiciousLogs = response.data.suspicious_logs || [];
        if (suspiciousLogs.length > 0) {
          const latest = suspiciousLogs[0];
          // Nếu là log mới và là suspicious trở lên
          if (
            lastAnomalyRef.current !== latest.timestamp &&
            ["suspicious",  "blocked"].includes(latest.anomaly_flag)
          ) {
            notification.warning({
              message: "Phát hiện bất thường!",
              description: `Người dùng ${latest.username} bị ${latest.anomaly_flag} lúc ${new Date(latest.timestamp).toLocaleString('vi-VN')}`,
              placement: "topRight",
              duration: 6,
            });
            lastAnomalyRef.current = latest.timestamp;
          }
        }
      } catch (err) {
        setError("Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.");
        notification.error({
          message: "Lỗi tải dữ liệu Dashboard!",
          description: "Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.",
          placement: "topRight",
          duration: 6,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cập nhật đồng hồ
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  useEffect(() => {
    api.get('/login-chart-data/')
      .then(res => {
        setChartData(res.data.chart_data || []);
        setTodayStats({
          today_success: res.data.today_success || 0,
          today_failed: res.data.today_failed || 0,
          today_blocked: res.data.today_blocked || 0
        });
      })
      .catch(() => {
        setChartData([]);
        setTodayStats({ today_success: 0, today_failed: 0, today_blocked: 0 });
      });
  }, []);

  useEffect(() => {
    setEnableChartAnimation(true);
    // Sau 1 khoảng ngắn, tắt animation
    const timer = setTimeout(() => setEnableChartAnimation(false), 1200);
    return () => clearTimeout(timer);
  }, []); // chỉ chạy khi load lần đầu

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    notification.success({
      message: 'Đã đăng xuất!',
      description: 'Đã đăng xuất thành công!',
    });
    navigate('/login');
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon style={{ margin: '20px' }}/>;
  }

  return (
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
        <Menu theme="light" mode="inline" defaultSelectedKeys={['dashboard']}>
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
          {/* HÀNG 1: 3 card thống kê ngang hàng, cùng chiều cao */}
          <Row gutter={[16, 16]} align="stretch">
            <Col xs={24} sm={8} style={{ height: '100%' }}>
              <Card 
                hoverable
                style={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <Statistic 
                  title={<span style={{ color: '#fff' }}>Tổng số người dùng</span>} 
                  value={data.total_users} 
                  prefix={<TeamOutlined style={{ color: '#fff' }} />} 
                  valueStyle={{ color: '#fff', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} style={{ height: '100%' }}>
              <Card 
                hoverable
                style={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none'
                }}
              >
                <Statistic 
                  title={<span style={{ color: '#fff' }}>Người dùng hoạt động</span>} 
                  value={data.active_users} 
                  prefix={<UserOutlined style={{ color: '#fff' }} />} 
                  valueStyle={{ color: '#fff', fontSize: '32px' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8} style={{ height: '100%' }}>
              <Card 
                hoverable
                style={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none'
                }}
              >
                <Statistic 
                  title={<span style={{ color: '#fff' }}>IP đang bị chặn</span>} 
                  value={data.blocked_ips.length} 
                  prefix={<StopOutlined style={{ color: '#fff' }} />} 
                  valueStyle={{ color: '#fff', fontSize: '32px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* HÀNG 2: Biểu đồ và card bất thường mới nhất, cùng chiều cao */}
          <Row gutter={[15, 15]} style={{ minHeight: 260 }} align="stretch">
            <Col xs={24} lg={16} style={{ height: '100%' }}>
                <Card title="Hoạt động trong tuần (7 ngày gần nhất)" className="dashboard-chart-block" style={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="logins"
                              stroke="#1890ff"
                              name="Lượt đăng nhập"
                              isAnimationActive={enableChartAnimation}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
            <Col xs={24} lg={8} style={{marginTop: '40px', display: 'flex', flexDirection: 'column' }}>
               <Card title="Bất thường mới nhất" style={{ background: '#fff', borderColor: '#faad14', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                {data.suspicious_logs && data.suspicious_logs.length > 0 ? (
                  data.suspicious_logs.slice(0, 3).map((log, idx) => (
                    <div
                      key={log.timestamp}
                      style={{
                        background: '#fff',
                        border: '1px solid rgb(175, 175, 175)',
                        borderRadius: 12,
                        padding: '14px 18px',
                        marginBottom: 14,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        cursor: 'pointer',
                        minHeight: 56,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(24,144,255,0.10)';
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#595959' }}>{log.username}</span>
                        <Tag color="gold" style={{ fontWeight: 500, fontSize: 13, marginLeft: 4 }}>{log.anomaly_flag} </Tag>
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#faad14', textAlign: 'center', marginTop: 30 }}>Không có bất thường nào gần đây.</div>
                )}
                {/* Thống kê đăng nhập hôm nay */}
                <div style={{ marginTop: 18, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Thống kê đăng nhập hôm nay:</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <span style={{ color: '#52c41a', fontWeight: 500 }}>Thành công: {todayStats.today_success}</span>
                    <span style={{ color: '#f5222d', fontWeight: 500 }}>Thất bại: {todayStats.today_failed}</span>
                    <span style={{ color: '#faad14', fontWeight: 500 }}>Đã block: {todayStats.today_blocked}</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* HÀNG 3: Các bảng dữ liệu */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px', minHeight: 350 }} align="stretch">
              <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column' }}>
                <Card title="Hoạt động đáng ngờ gần đây" headStyle={{backgroundColor: '#fffbe6', color: '#faad14'}} extra={<ExclamationCircleOutlined />} style={{ flex: 1, height: '100%' }}>
                  <Table columns={suspiciousColumns} dataSource={data.suspicious_logs} rowKey="timestamp" pagination={{ pageSize: 5 }} scroll={{ y: 220 }} />
                </Card>
              </Col>
              <Col xs={24} lg={12} style={{ display: 'flex', flexDirection: 'column' }}>
                <Card title="Danh sách IP bị chặn" headStyle={{backgroundColor: '#fff1f0', color: '#f5222d'}} extra={<StopOutlined />} style={{ flex: 1, height: '100%' }}>
                  <Table columns={blockedIpColumns} dataSource={data.blocked_ips} rowKey="ip_address" pagination={{ pageSize: 5 }} scroll={{ y: 220 }} />
                </Card>
              </Col>
          </Row>
      </Content>
    </Layout>
  );
}