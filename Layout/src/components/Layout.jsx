import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button, notification } from 'antd';
import { 
  UserOutlined, 
  DashboardOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';

const { Content, Sider } = Layout;

const AppLayout = ({ children }) => {
  const { state: authState, dispatch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    message.success('Đã đăng xuất!');
    navigate('/login');
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/users') return 'users';
    if (path === '/logs') return 'logs';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider 
        width={280} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header với đồng hồ và user info */}
        <div style={{ 
          padding: '24px 16px', 
          textAlign: 'center', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#fff',
            marginBottom: '8px'
          }}>
            {currentTime.toLocaleTimeString('vi-VN')}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'rgba(255,255,255,0.8)'
          }}>
            {currentTime.toLocaleDateString('vi-VN')}
          </div>
        </div>

        {/* User info */}
        <div style={{ 
          padding: '24px 16px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            style={{ 
              marginBottom: '16px',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)'
            }} 
          />
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#fff',
            marginBottom: '4px'
          }}>
            {authState.user?.username || 'Admin'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'rgba(255,255,255,0.8)'
          }}>
            Quản trị viên
          </div>
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: '16px'
          }}
        >
          <Menu.Item 
            key="dashboard" 
            icon={<DashboardOutlined />} 
            onClick={() => navigate('/dashboard')}
            style={{
              margin: '8px 16px',
              borderRadius: '8px',
              height: '48px',
              lineHeight: '48px'
            }}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item 
            key="users" 
            icon={<TeamOutlined />} 
            onClick={() => navigate('/users')}
            style={{
              margin: '8px 16px',
              borderRadius: '8px',
              height: '48px',
              lineHeight: '48px'
            }}
          >
            Quản lý Users
          </Menu.Item>
          <Menu.Item 
            key="logs" 
            icon={<FileTextOutlined />} 
            onClick={() => navigate('/logs')}
            style={{
              margin: '8px 16px',
              borderRadius: '8px',
              height: '48px',
              lineHeight: '48px'
            }}
          >
            Logs Anomaly
          </Menu.Item>
          <Menu.Item 
            key="blacklist" 
            icon={<StopOutlined />} 
            onClick={() => navigate('/blacklist')}
            style={{
              margin: '8px 16px',
              borderRadius: '8px',
              height: '48px',
              lineHeight: '48px'
            }}
          >
            Blacklist
          </Menu.Item>
          <Menu.Item 
            key="settings" 
            icon={<SettingOutlined />} 
            onClick={() => navigate('/settings')}
            style={{
              margin: '8px 16px',
              borderRadius: '8px',
              height: '48px',
              lineHeight: '48px'
            }}
          >
            Cài đặt
          </Menu.Item>
        </Menu>

        {/* Logout Button */}
        <div style={{ 
          padding: '16px', 
          position: 'absolute', 
          bottom: '0', 
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <Button 
            type="primary" 
            danger 
            block 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{
              height: '48px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content style={{ 
          margin: '24px', 
          padding: '24px', 
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 48px)'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout; 