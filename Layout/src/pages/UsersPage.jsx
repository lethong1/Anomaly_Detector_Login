import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Table, Tag, Space, Modal, Checkbox, Form, Input, message, Layout, Menu, Avatar, notification, Switch, Tabs, List, Select } from 'antd';
import { UserAddOutlined, StopOutlined, EditOutlined, DeleteOutlined, CheckOutlined, PlusOutlined,
   UserOutlined, DashboardOutlined, TeamOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined, 
   ClockCircleOutlined, FileOutlined, LockOutlined  } from '@ant-design/icons';
import api from '../utils/axios';
import '../css/users.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const { Content, Sider } = Layout;

export default function UsersPage() {
  const { state: authState, dispatch } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddToBlacklistModal, setShowAddToBlacklistModal] = useState(false);
  const [blockedIps, setBlockedIps] = useState([]);
  const [blacklistForm] = Form.useForm();
  const [blacklistType, setBlacklistType] = useState('ip');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/');
      const userList = res.data.results || res.data;
      setUsers(userList);
      setBlockedUsers(userList.filter(u => u.is_blocked));
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách users!',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
    resetPasswordForm.resetFields();
  };
  const handleResetPassword = async (values) => {
    setShowResetPasswordModal(false);
    
    console.log('Selected user:', selectedUser);
    console.log('Selected user ID:', selectedUser?.id);
    
    if (!selectedUser?.id) {
      notification.error({
        message: 'Lỗi',
        description: 'Không xác định được user ID!',
        placement: 'topRight',
      });
      return;
    }
    
    try {
      await api.post(`/users/${selectedUser.id}/reset-password/`, {
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      notification.success({
        message: 'Thành công',
        description: 'Đã cấp lại mật khẩu thành công!',
        placement: 'topRight',
      });
      fetchUsers();
    } catch (err) {
      console.log('Error response:', err.response);
      notification.error({
        message: 'Lỗi',
        description: err?.response?.data?.detail || 'Không thể cấp lại mật khẩu!',
        placement: 'topRight',
      });
    }
    }
  const handleAddUser = async (values) => {
    setShowAddModal(false);
    try {
      values.is_active = true;
      values.is_superuser = false;
      console.log('Sending data:', values);
      const response = await api.post('/users/', values);
      console.log('Response:', response);
      notification.success({
        message: 'Thành công',
        description: 'Đã thêm user thành công!',
        placement: 'topRight',
      });
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể thêm user!',
        placement: 'topRight',
      });
    }
  };

  const handleDelete = async (user) => {
    setShowDeleteModal(false);
    try {
        await api.delete(`/users/${user.id}/`);
        notification.success({
          message: 'Thành công',
          description: 'Đã xóa user thành công!',
          placement: 'topRight',
        });
        fetchUsers();
    } catch (err) {
        notification.error({
          message: 'Lỗi',
          description: 'Không thể xóa user!',
          placement: 'topRight',
        });
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  const handleUnBlockClick = user => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };
  const handleBlockClick = user => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };
  const handleBlock = async (user) => {
    setShowBlockModal(false);
    try {
      await api.patch(`/users/${user.id}/`, { is_active: false });
      notification.success({
        message: 'Thành công',
        description: 'Đã block user thành công!',
        placement: 'topRight',
      });
      fetchUsers();
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể block user!',
        placement: 'topRight',
      });
    }
  };

  const handleUnBlock = async (user) => {
    setShowBlockModal(false);
    try {
      await api.patch(`/users/${user.id}/`, { is_active: true });
      notification.success({
        message: 'Thành công',
        description: 'Đã unblock user thành công!',
        placement: 'topRight',
      });
      fetchUsers();
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể unblock user!',
        placement: 'topRight',
      });
    }
  };
  const handleEditClick = user => {
    setEditingUser(user);
    setShowEditModal(true);
    // Reset form và set giá trị mới
    editForm.resetFields();
    editForm.setFieldsValue({
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      is_staff: user.is_staff
    });
  };

  const handleEditSubmit = async (values) => {
    setShowEditModal(false);
    try {
      await api.patch(`/users/${editingUser.id}/`, values);
      notification.success({
        message: 'Thành công',
        description: 'Đã cập nhật user thành công!',
        placement: 'topRight',
      });
      fetchUsers();
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể cập nhật user!',
        placement: 'topRight',
      });
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    notification.success({
      message: 'Thành công',
      description: 'Đã đăng xuất!',
      placement: 'topRight',
    });
    navigate('/login');
  };

  const fetchBlockedIps = async () => {
    try {
      const res = await api.get('/get-blocked-ips/');
      setBlockedIps(res.data);
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tải danh sách IP bị chặn!',
        placement: 'topRight',
      });
    }
  };

  const handleUnblockIp = async (ip) => {
    try {
      await api.post('/unblock/', { ip_address: ip });
      notification.success({
        message: 'Thành công',
        description: `Đã bỏ chặn IP ${ip}!`,
        placement: 'topRight',
      });
      fetchBlockedIps();
    } catch (err) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể bỏ chặn IP!',
        placement: 'topRight',
      });
    }
  };

  const handleAddToBlacklist = async (values) => {
    try {
      // Chuẩn bị dữ liệu để gửi API
      const dataToSend = {
        type: values.type,
        blocked_reason: values.blocked_reason
      };
      
      // Thêm giá trị tương ứng với loại
      if (values.type === 'ip') {
        dataToSend.ip_address = values.value;
      } else if (values.type === 'user') {
        dataToSend.username = values.value;
      }
      
      console.log('Sending data to API:', dataToSend);
      await api.post('/add-to-blacklist/', dataToSend);
      
      notification.success({
        message: 'Thành công',
        description: 'Đã thêm vào danh sách đen!',
        placement: 'topRight',
      });
      setShowAddToBlacklistModal(false);
      blacklistForm.resetFields();
      setBlacklistType('ip'); // Reset về IP
      fetchBlockedIps();
    } catch (err) {
      console.log(err.response?.data);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể thêm vào danh sách đen!',
        placement: 'topRight',
      });
    }
  };

  const columns = [
    { 
      title: 'Username', 
      dataIndex: 'username', 
      key: 'username', 
      render: (text, record) => {
        if (text === authState.user?.username) {
          return <Tag color="blue">{text}</Tag>;
        } else {
          return <b>{text}</b>;
        }
      }
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Trạng thái', dataIndex: 'is_active', key: 'is_active', render: v => v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
    { title: 'Block', dataIndex: 'is_blocked', key: 'is_blocked', render: v => v ? <Tag color="red">Blocked</Tag> : <Tag color="blue">Normal</Tag> },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, user) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditClick(user)} size="small">Sửa</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteClick(user)} size="small" danger>Xóa</Button>
          {user.is_active ? (
            <Button icon={<StopOutlined />} onClick={() => handleBlockClick(user)} size="small" type="dashed">Block</Button>
          ) : (
            <Button icon={<StopOutlined />} onClick={() => handleUnBlockClick(user)} size="small" type="primary">Unblock</Button>

          )}
          <Button icon={<LockOutlined/>} onClick={() => handleResetPasswordClick(user)} size="small" type="primary">Cấp lại mật khẩu</Button>
        </Space>
      )
    }
  ];

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
        <Menu theme="light" mode="inline" defaultSelectedKeys={['users']}>
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
        {/* PHẦN TRÊN: 3 thẻ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card 
              hoverable
              style={{ 
                height: '90%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>Tổng số users</div>
              <div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>{users.length}</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable
              style={{ 
                height: '90%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: '#fff', fontSize: '16px', marginBottom: '8px', marginBottom: '10px' }}>Danh sách đen</div>
              <div style={{ color: '#fff', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{users.filter(u => u.is_active === false).length}</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable
              style={{ 
                height: '90%',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: '#1a1a1a', fontSize: '16px', marginBottom: '15px' }}>Hành động</div>
              <Button 
                icon={<UserAddOutlined />} 
                type="primary" 
                style={{ marginRight: 8, background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.2)', color: '#1a1a1a' }} 
                onClick={() => setShowAddModal(true)}
              >
                Thêm user
              </Button>
              <Button 
                icon={<FileOutlined />} 
                style={{ 
                  background: 'rgba(0,0,0,0.1)', 
                  border: '1px solid rgba(0,0,0,0.2)',
                  color: '#1a1a1a'
                }} 
                onClick={() => {
                  setShowAddToBlacklistModal(true);
                  fetchBlockedIps();
                }}
              >
                Danh sách đen
              </Button>
            </Card>
          </Col>
        </Row>
        {/* PHẦN DƯỚI: BẢNG USERS */}
        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </Card>
        {/* Modal thêm user */}
        <Modal
          open={showAddModal}
          title="Thêm user mới"
          onCancel={() => setShowAddModal(false)}
          onOk={() => form.submit()}
          okText="Thêm"
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical" onFinish={handleAddUser}>
            <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Nhập username!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email!' }]}>
              <Input type="email" />
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Nhập password!' }]}>
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
        {/* Modal xóa user */}
        <Modal
          open={showDeleteModal}
          title="Xóa user"
          onCancel={() => setShowDeleteModal(false)}
          onOk={() => handleDelete(selectedUser)}
          okText="Xác nhận xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <p>Bạn có chắc chắn muốn xóa user <strong>{selectedUser?.username}</strong>?</p>
          <p>Hành động này không thể hoàn tác.</p>
        </Modal>
        {/* Modal block user */}
        <Modal
          open={showBlockModal}
          title={selectedUser?.is_active ? "Block user" : "Unblock user"}
          onCancel={() => setShowBlockModal(false)}
          onOk={() => selectedUser?.is_active ? handleBlock(selectedUser) : handleUnBlock(selectedUser)}
          okText={selectedUser?.is_active ? "Block" : "Unblock"}
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn {selectedUser?.is_active ? 'block' : 'unblock'} user <strong>{selectedUser?.username}</strong>?</p>
        </Modal>

        {/* Modal sửa user */}
        <Modal
          open={showEditModal}
          title="Sửa user"
          onCancel={() => setShowEditModal(false)}
          onOk={() => editForm.submit()}
          okText="Cập nhật"
          cancelText="Hủy"
        >
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Nhập username!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email!' }]}>
              <Input type="email" />
            </Form.Item>
            <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="is_staff" label="Quyền admin" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
        {/* Modal thêm vào danh sách đen */}
        <Modal
          open={showAddToBlacklistModal}
          title="Quản lý danh sách đen"
          onCancel={() => setShowAddToBlacklistModal(false)}
          footer={null}
          width={800}
        >
          <Tabs
            items={[
              {
                key: '1',
                label: 'Danh sách IP bị chặn',
                children: (
                  <div>
                    <List
                      dataSource={blockedIps}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button 
                              size="small" 
                              onClick={() => handleUnblockIp(item.ip_address)}
                              danger
                            >
                              Bỏ chặn
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={`IP: ${item.ip_address}`}
                            description={`Lý do: ${item.blocked_reason} | Thời gian: ${new Date(item.blocked_at).toLocaleString('vi-VN')}`}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ),
              },
              {
                key: '2',
                label: 'Thêm vào danh sách đen',
                children: (
                  <Form form={blacklistForm} layout="vertical" onFinish={handleAddToBlacklist}>
                    <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Chọn loại!' }]}>
                      <Select 
                        onChange={(value) => {
                          setBlacklistType(value);
                          blacklistForm.setFieldsValue({ value: '' }); // Reset giá trị khi đổi loại
                        }}
                      >
                        <Select.Option value="ip">IP Address</Select.Option>
                        <Select.Option value="user">Username</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item 
                      name="value" 
                      label={blacklistType === 'ip' ? 'IP Address' : 'Username'} 
                      rules={[{ required: true, message: blacklistType === 'ip' ? 'Nhập IP address!' : 'Nhập username!' }]}
                    >
                      <Input 
                        placeholder={blacklistType === 'ip' ? 'Nhập IP address (ví dụ: 192.168.1.1)' : 'Nhập username'} 
                      />
                    </Form.Item>
                    <Form.Item name="blocked_reason" label="Lý do" rules={[{ required: true, message: 'Nhập lý do!' }]}>
                      <Input.TextArea rows={3} placeholder="Lý do thêm vào danh sách đen" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Thêm vào danh sách đen
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Modal>
        {/* Modal cấp lại mật khẩu */}
        <Modal
          open={showResetPasswordModal}
          title="Cấp lại mật khẩu"
          onCancel={() => setShowResetPasswordModal(false)}
          onOk={() => resetPasswordForm.submit()}
          okText="Cấp lại"
          cancelText="Hủy"
        >
          <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPassword}>
            <Form.Item name="new_password" label="Mật khẩu mới" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item name="confirm_password" label="Xác nhận mật khẩu" rules={[{ required: true, message: 'Nhập lại mật khẩu!' }]}>
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
} 