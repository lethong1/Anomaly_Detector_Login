import React, { useState, useEffect, useContext, createContext } from 'react';
import { Card, Row, Col, Switch, Select, Typography, Radio, Button, message,notification, Layout, Menu, Avatar, Tabs, Form, Input, Space, Table, Divider } from 'antd';
import { BgColorsOutlined, FontSizeOutlined, BulbOutlined, CheckOutlined, UserOutlined, DashboardOutlined, TeamOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const { Title } = Typography;
const { Content, Sider } = Layout;



const defaultSettings = {
  displayName: '',
  email: '',
  newPassword: '',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [loginHistory, setLoginHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ old: '', new1: '', new2: '' });
  const { state: authState, dispatch } = useAuth();
  const user = authState.user || {};

  // 1. Thêm state profile
  const [profile, setProfile] = useState({
    id: user.id,
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
  });

  // 2. Khi user context thay đổi (login lại), đồng bộ lại profile
  useEffect(() => {
    setProfile({
      id: user.id,
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
    });
  }, [user]);

  const { apiCall } = useApi();

  useEffect(() => {
    setLoadingHistory(true);
    apiCall('/user-login-history/')
      .then(res => {
        // Sửa ở đây cho đúng kiểu dữ liệu
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.logins || [];
        setLoginHistory(data);
      })
      .catch(() => setLoginHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [tabKey, setTabKey] = useState('ui');

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    notification.success({
      message: 'Thành công',
      description: 'Đã đăng xuất!',
    });
    navigate('/login');
  };

  // 3. Input dùng value={profile.username} và onChange={e => setProfile(p => ({ ...p, username: e.target.value }))}

  // 4. Khi cập nhật:
  const handleProfileUpdate = async () => {
    if (!profile.id) {
      notification.error({ message: 'Lỗi', description: 'Không xác định được user id!' });
      return;
    }
    try {
      await apiCall(`/users/${profile.id}/`, {
        method: 'PATCH',
        data: {
          username: profile.username,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
        },
      });
      notification.success({ message: 'Thành công', description: 'Đã cập nhật thông tin tài khoản!' });
    } catch (err) {
      notification.error({ message: 'Lỗi', description: err?.response?.data?.detail || 'Cập nhật thông tin thất bại!' });
    }
  };
  const handlePasswordChange = async () => {
    if (!passwordFields.old || !passwordFields.new1 || !passwordFields.new2) {
      notification.error({ message: 'Lỗi', description: 'Vui lòng nhập đủ các trường!' });
      return;
    }
    if (passwordFields.new1 !== passwordFields.new2) {
      notification.error({ message: 'Lỗi', description: 'Mật khẩu mới không khớp!' });
      return;
    }
    try {
      await apiCall(`/users/${user.id}/change-password/`, {
        method: 'POST',
        data: {
          password: passwordFields.old,
          new_password: passwordFields.new1,
          confirm_password: passwordFields.new2,
        },
      } );
      notification.success({ message: 'Thành công', description: 'Đã đổi mật khẩu!' });
      setPasswordFields({ old: '', new1: '', new2: '' });
    } catch (err) {
      console.log(err.response.data);
      notification.error({ message: 'Lỗi', description: err?.response?.data?.detail || 'Đổi mật khẩu thất bại!' });
    }
  };

  return (
    <Layout className="dashboard-bg" style={{ minHeight: '100vh' }}>
      <Sider width={240} className="dashboard-sider" collapsible={false}>
        <div style={{ color: '#222', textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #fff' }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
          <div className="sidebar-user-name">{authState.user?.username || 'Admin'}</div>
          <div className="sidebar-user-role">Cài đặt</div>
        </div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={['settings']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate('/dashboard')}>Dashboard</Menu.Item>
          <Menu.Item key="users" icon={<TeamOutlined />} onClick={() => navigate('/users')}>Users</Menu.Item>
          <Menu.Item key="logs" icon={<FileTextOutlined />} onClick={() => navigate('/logs')}>Logs</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>Settings</Menu.Item>
        </Menu>
        <div style={{ padding: '16px', borderTop: '1px solid #444', marginTop: 'auto' }}>
          <Button type="primary" danger block icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
        </div>
      </Sider>
      <Content style={{ padding: '16px 16px 16px 16px' }}>
        <Row justify="center">
          <Col span={24} style={{ margin: '0 auto' }}>
            <Card bordered style={{ borderRadius: 18, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)', padding: '0px 20px', maxWidth: 1200, margin: '0 auto' }}>
                <Row gutter={32} align="top" wrap={false}>
                  <Col xs={24} md={5} style={{ minWidth: 320, flex: '0 0 320px' }}>
                    <div style={{ paddingRight: 28, borderRight: '1px solid #eee', minHeight: 320, marginTop: 0 }}>
                      <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Thông tin tài khoản</h2>
                      <Form layout="vertical" size="large">
                        <Form.Item label="Username">
                          <Input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
                        </Form.Item>
                        <Form.Item label="Email">
                          <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                        </Form.Item>
                        <Form.Item label="Tên">
                          <Input value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} />
                        </Form.Item>
                        <Form.Item label="Họ">
                          <Input value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} />
                        </Form.Item>
                        <Form.Item label="Trạng thái" >
                          <Input value={user.is_active ? 'Đang hoạt động' : 'Bị khóa'} disabled />
                        </Form.Item>
                        
                        <Form.Item>
                          <Button type="primary" size="large" style={{ width: 180 }} onClick={handleProfileUpdate}>Cập nhật thông tin</Button>
                        </Form.Item>
                      </Form>
                    </div>
                  </Col>
                  <Col xs={24} md={12} style={{ minWidth: 800, flex: 1 }}>
                    <div style={{ paddingLeft: 24, minHeight: 320, marginTop: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Hàng trên: Nhật ký hoạt động */}
                      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 22 }}>Nhật ký hoạt động</div>
                      <Table
                        columns={[{
                          dataIndex: 'logline',
                          key: 'logline',
                          render: (_, record) => (
                            <span style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>
                              {[new Date(record.timestamp).toLocaleString('vi-VN'),
                                `IP: [${record.ip || record.ip_address || '-'}]`,
                                `username: [${record.username || '-'}]`,
                                `action: [${record.status || record.anomaly_flag|| '-'}]`,
                                record.description ? `Description: [${record.description}]` : ''
                              ].filter(Boolean).join(' | ')}
                            </span>
                          )
                        }]}
                        dataSource={loginHistory.slice(0, 15)}
                        rowKey={(r, i) => r.id || i}
                        loading={loadingHistory}
                        pagination={false}
                        showHeader={false}
                        scroll={{ x: true, y: 220 }}
                        rowClassName={() => 'log-row-tight'}
                        style={{ marginBottom: 8, background: 'none', border: 'none' }}
                      />
                      {/* Hàng dưới: 2 cột - Trạng thái & Đổi mật khẩu */}
                      <div style={{ display: 'flex', marginTop: 0 }}>
                        <div style={{ flex: 1, minWidth: 300, maxWidth: 400, background: '#fafafa', borderRadius: 8, border: '1px solid #eee', padding: '0 8px', marginBottom: 0 }}>
                          <h3 style={{ fontWeight: 500, textAlign: 'center', margin:0, marginTop:2 }}>Đổi mật khẩu</h3>
                          <Form layout="vertical" size="middle" onFinish={handlePasswordChange}>
                            <Form.Item label="Mật khẩu cũ">
                              <Input.Password value={passwordFields.old} onChange={e => setPasswordFields(f => ({ ...f, old: e.target.value }))} placeholder="Nhập mật khẩu cũ" />
                            </Form.Item>
                            <Form.Item label="Mật khẩu mới">
                              <Input.Password value={passwordFields.new1} onChange={e => setPasswordFields(f => ({ ...f, new1: e.target.value }))} placeholder="Nhập mật khẩu mới" />
                            </Form.Item>
                            <Form.Item label="Xác nhận mật khẩu mới">
                              <Input.Password value={passwordFields.new2} onChange={e => setPasswordFields(f => ({ ...f, new2: e.target.value }))} placeholder="Nhập lại mật khẩu mới" />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'center' }}>
                              <Button type="primary" size="middle" style={{ width: 140, margin:0 }} htmlType="submit">Đổi mật khẩu</Button>
                            </Form.Item>
                          </Form>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

// Thêm CSS cho dark mode nếu muốn
const style = document.createElement('style');
style.innerHTML = `
  body.dark-mode {
    background: #232526 !important;
    color: #eee !important;
  }
`;
document.head.appendChild(style);
// Thêm CSS cho log-row-tight để log sát nhau như logs
const logRowTightStyle = document.createElement('style');
logRowTightStyle.innerHTML = `
  .log-row-tight td {
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    line-height: 1.2 !important;
    border-bottom: 1px solid #f0f0f0 !important;
    background: none !important;
  }
  .log-row-tight {
    background: none !important;
    margin: 0 !important;
    min-height: 0 !important;
    height: auto !important;
  }
`;
document.head.appendChild(logRowTightStyle); 