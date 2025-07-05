import { useEffect, useState } from "react";
import { Statistic, Table, Tag, Layout, message, Avatar, Menu, Button, Grid, Row, Col, Card } from "antd";
import { UserOutlined, DashboardOutlined, TeamOutlined, FileTextOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ClockCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import "@/css/dashboard.css";

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const suspiciousData = [
  { user: "User A", activity: "Login from new location", risk: "High", time: "2024-01-15 10:00" },
  { user: "User B", activity: "Multiple failed login attempts", risk: "Medium", time: "2024-01-15 11:30" },
  { user: "User C", activity: "Unusual transaction amount", risk: "High", time: "2024-01-15 12:45" },
  { user: "User D", activity: "Account lockout", risk: "Medium", time: "2024-01-15 14:00" },
  { user: "User E", activity: "Password reset request", risk: "Low", time: "2024-01-15 15:15" }
];

const chartData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 10 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 15 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 20 },
];

const riskColor = {
  High: "red",
  Medium: "gold",
  Low: "green"
};

const columns = [
  {
    title: "User",
    dataIndex: "user",
    key: "user",
    render: text => <b>{text}</b>
  },
  {
    title: "Activity",
    dataIndex: "activity",
    key: "activity"
  },
  {
    title: "Risk Level",
    dataIndex: "risk",
    key: "risk",
    render: risk => <Tag color={riskColor[risk] || "default"}>{risk}</Tag>
  },
  {
    title: "Timestamp",
    dataIndex: "time",
    key: "time"
  }
];

export default function Dashboard() {
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAnimation, setShowAnimation] = useState(true);
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hasHighRisk = suspiciousData.some(entry => entry.risk === "High");
    if (hasHighRisk) {
      message.error({
        content: "Cảnh báo: Có hoạt động đáng ngờ mức High Risk!",
        duration: 4,
        style: { marginTop: '60px' },
      });
    }

    // Cập nhật thời gian realtime mỗi giây
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Tắt animation sau khi chạy xong (1.5 giây)
    const animationTimer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);

    return () => {
      clearInterval(timeTimer);
      clearTimeout(animationTimer);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    message.success('Đã đăng xuất!');
    navigate('/login');
  };

  return (
    <Layout className="dashboard-bg" style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        className="dashboard-sider"
        breakpoint="lg"
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div className="sidebar-user-info">
          <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
          <div className="sidebar-user-name">{state.user?.username || 'User'}</div>
          <div className="sidebar-user-role">Quản trị viên</div>
        </div>
        <Menu mode="inline" defaultSelectedKeys={['dashboard']} className="sidebar-menu">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="users" icon={<TeamOutlined />}>Users</Menu.Item>
          <Menu.Item key="logs" icon={<FileTextOutlined />}>Logs</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>
        </Menu>
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', marginTop: 'auto' }}>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ width: '100%', color: '#ff4d4f' }}
          >
            Đăng xuất
          </Button>
        </div>
        {!collapsed && (
          <div className="sidebar-bottom-btn">
            <Button type="text" icon={<MenuFoldOutlined />} onClick={() => setCollapsed(true)} style={{ width: '100%' }}>
              Ẩn
            </Button>
          </div>
        )}
      </Sider>
      <Content>
        <div className="dashboard-main-content">
          {collapsed && (
            <Button
              className="sidebar-trigger-btn"
              type="primary"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setCollapsed(false)}
              style={{ marginBottom: 16 }}
            >
            </Button>
          )}
          <div className="dashboard-content">
            <Row gutter={[16, 16]}>
              {/* Phần bên trái - 3 stat cards (3/12) */}
              <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                  <Card className="dashboard-stat-card" style={{ marginBottom: 0, flex: 1 }}>
                    <div className="dashboard-stat-title">Total Users</div>
                    <Statistic value={1234} valueStyle={{ fontSize: 28 }} />
                  </Card>
                  <Card className="dashboard-stat-card" style={{ marginBottom: 0, flex: 1 }}>
                    <div className="dashboard-stat-title">Active Users</div>
                    <Statistic value={987} valueStyle={{ color: '#3f8600', fontSize: 28 }} />
                  </Card>
                  <Card className="dashboard-stat-card" style={{ marginBottom: 0, flex: 1 }}>
                    <div className="dashboard-stat-title">Inactive Users</div>
                    <Statistic value={247} valueStyle={{ color: '#cf1322', fontSize: 28 }} />
                  </Card>
                </div>
              </Col>

              {/* Phần bên phải - Đồng hồ và biểu đồ (9/12) */}
              <Col xs={24} sm={24} md={18} lg={18} xl={18}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                  {/* Đồng hồ realtime - thiết kế đẹp hơn */}
                  <Card 
                    className="dashboard-clock-card"
                    style={{ 
                      background: 'linear-gradient(135deg,rgb(6, 156, 29) 0%,rgb(6, 85, 28) 100%)',
                      color: 'white',
                      height: '140px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 24px',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(19, 152, 92, 0.3)'
                    }}
                  >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <ClockCircleOutlined style={{ fontSize: '20px', opacity: 0.9 }} />
                        
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {formatTime(currentTime)}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8 }}>
                        {formatDate(currentTime)}
                      </div>
                    </div>
                  </Card>

                  {/* Biểu đồ mẫu test - không load liên tục */}
                  <Card 
                    title="Mẫu test" 
                    className="dashboard-chart-block"
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1890ff" 
                          strokeWidth={3} 
                          dot={{ r: 5, fill: '#1890ff' }}
                          activeDot={{ r: 8, stroke: '#1890ff', strokeWidth: 2 }}
                          isAnimationActive={showAnimation}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </Col>
            </Row>

            {/* Bảng Suspicious Activities - tràn ra hết phần content */}
            <div className="dashboard-table-block" style={{ marginTop: '16px' }}>
              <div className="dashboard-table-head">Suspicious Activities</div>
              <Table
                columns={columns}
                dataSource={suspiciousData}
                rowKey={(record, idx) => idx}
                pagination={{ pageSize: 5 }}
                className="dashboard-table"
              />
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
